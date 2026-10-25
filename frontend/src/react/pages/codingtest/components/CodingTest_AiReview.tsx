import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import { CircularProgress, Drawer } from '@mui/material';

import CodeReviewApi, { isCodeReviewApiError } from '../../../../api/AxiosApi/CodeReviewApi/CodeReviewApi';
import {
  CodeReviewContent,
  CodeReviewResponse,
} from '../../../../api/AxiosApi/CodeReviewApi/CodeReviewApiType';
import { AiReviewButton, AiReviewPanel, AiReviewSlot } from '../../../styles/codingtest/CodingTest_AiReview';

type Phase = 'idle' | 'pending' | 'completed' | 'failed';

type Props = {
  // 정답 처리된 채점의 jobId. null이면 버튼을 숨긴다 (새 제출/취소/오답 시 null로 바뀜)
  jobId: string | null;
};

// 웹훅으로 채점이 DB에 저장되는 시점이 마지막 SSE 이벤트보다 늦을 수 있어서 잠깐 다시 묻는다
const TARGET_RETRY_COUNT = 6;
const TARGET_RETRY_DELAY_MS = 1000;
// 다른 요청(다른 탭 등)이 생성 중일 때 상태를 다시 확인하는 간격/횟수 (약 4분)
const POLL_INTERVAL_MS = 3000;
const POLL_MAX_COUNT = 80;

const BUTTON_LABEL = new Map<Phase, string>([
  ['idle', 'AI 코드 리뷰'],
  ['pending', '리뷰 생성 중'],
  ['completed', 'AI 코드 리뷰 보기'],
  ['failed', 'AI 리뷰 다시 시도'],
]);

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const lineLabel = (start: number, end: number): string =>
  start === end ? `${start}번 줄` : `${start}–${end}번 줄`;

const ReviewBody = ({ review }: { review: CodeReviewContent }): JSX.Element => {
  const { observedMetrics } = review;
  return (
    <>
      <section>
        <h4>요약</h4>
        <p>{review.summary}</p>
      </section>

      <section>
        <h4>잘한 점</h4>
        <ul>
          {review.strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>복잡도</h4>
        <p>시간: {review.complexity.time}</p>
        <p>공간: {review.complexity.space}</p>
        <p className="note">가정</p>
        <ul>
          {review.complexity.assumptions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>채점 관측값</h4>
        <p>
          최대 실행 시간: {observedMetrics.maxElapsedTimeMs ?? '-'}ms · 최대 메모리:{' '}
          {observedMetrics.maxMemoryUsageMb ?? '-'}MB
        </p>
        <p className="note">
          채점 서버에서 측정한 값입니다. 입력 크기·환경에 따라 달라지며 복잡도를 증명하지 않습니다.
        </p>
      </section>

      <section>
        <h4>개선점</h4>
        {review.improvements.length === 0 ? (
          <p>특별히 제안할 개선점이 없습니다.</p>
        ) : (
          review.improvements.map((item, i) => (
            <div className="improvement" key={i}>
              <div className="improvement-head">
                <span className={`badge ${item.kind}`}>
                  {item.kind === 'bug' ? '실제 오류' : '개선 제안'}
                </span>
                <strong>{item.title}</strong>
                <span className="lines">{lineLabel(item.lineStart, item.lineEnd)}</span>
              </div>
              <p>{item.detail}</p>
              {item.exampleCode ? (
                <>
                  <p className="example-label">예시 코드 (실행·검증되지 않음)</p>
                  <pre>
                    <code>{item.exampleCode}</code>
                  </pre>
                </>
              ) : null}
            </div>
          ))
        )}
      </section>

      {review.lessons.length > 0 && (
        <section>
          <h4>관련 강의</h4>
          <ul>
            {review.lessons.map((lesson) => (
              <li key={lesson.chunkId}>
                <Link to={lesson.url} target="_blank" rel="noopener noreferrer">
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="note">AI가 생성한 리뷰로, 틀린 내용이 있을 수 있습니다.</p>
    </>
  );
};

const CodingTest_AiReview = ({ jobId }: Props): JSX.Element | null => {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [review, setReview] = useState<CodeReviewContent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [judgmentId, setJudgmentId] = useState<number | null>(null);

  // 제출이 바뀌거나 언마운트된 뒤 도착한 응답은 버리기 위한 실행 번호
  const runRef = useRef(0);

  useEffect(() => {
    runRef.current += 1;
    setOpen(false);
    setPhase('idle');
    setReview(null);
    setErrorMessage(null);
    setJudgmentId(null);
    return (): void => {
      runRef.current += 1;
    };
  }, [jobId]);

  const start = useCallback(async (): Promise<void> => {
    if (!jobId) return;
    const run = ++runRef.current;
    const stale = (): boolean => runRef.current !== run;

    const fail = (message: string): void => {
      if (stale()) return;
      setErrorMessage(message);
      setPhase('failed');
    };

    // COMPLETED/FAILED면 반영 후 true, PENDING이면 false
    const settle = (res: CodeReviewResponse): boolean => {
      if (stale()) return true;
      if (res.status === 'COMPLETED' && res.review) {
        setReview(res.review);
        setPhase('completed');
        return true;
      }
      if (res.status === 'FAILED' || res.status === 'COMPLETED') {
        fail(res.errorMessage || 'AI 코드 리뷰를 생성하지 못했습니다.');
        return true;
      }
      return false;
    };

    setErrorMessage(null);
    setPhase('pending');

    // 1) 이 jobId로 저장된 그 제출을 찾는다 (최신 제출로 대체하지 않음)
    let targetId = judgmentId;
    if (targetId === null) {
      for (let attempt = 1; ; attempt++) {
        const target = await CodeReviewApi.findTarget(jobId);
        if (stale()) return;
        if (!isCodeReviewApiError(target)) {
          if (!target.passed) {
            fail('정답 처리된 제출만 AI 코드 리뷰를 받을 수 있습니다.');
            return;
          }
          targetId = target.judgmentId;
          setJudgmentId(targetId);
          break;
        }
        if (target.status !== 404 || attempt >= TARGET_RETRY_COUNT) {
          fail(target.error);
          return;
        }
        await sleep(TARGET_RETRY_DELAY_MS);
        if (stale()) return;
      }
    }

    // 2) 저장된 리뷰가 있으면 그대로 보여준다
    const saved = await CodeReviewApi.getReview(targetId);
    if (stale()) return;
    if (isCodeReviewApiError(saved)) {
      fail(saved.error);
      return;
    }
    if (saved.status === 'COMPLETED' && settle(saved)) return;

    // 3) 없거나 실패했으면 생성 요청 (다른 요청이 생성 중이면 PENDING으로 바로 돌아옴)
    if (saved.status !== 'PENDING') {
      const requested = await CodeReviewApi.requestReview(targetId);
      if (stale()) return;
      if (isCodeReviewApiError(requested)) {
        fail(requested.error);
        return;
      }
      if (settle(requested)) return;
    }

    // 4) 생성 중이면 완료될 때까지 확인
    for (let i = 0; i < POLL_MAX_COUNT; i++) {
      await sleep(POLL_INTERVAL_MS);
      if (stale()) return;
      const polled = await CodeReviewApi.getReview(targetId);
      if (stale()) return;
      if (isCodeReviewApiError(polled)) {
        fail(polled.error);
        return;
      }
      if (polled.status === null) {
        fail('AI 코드 리뷰를 생성하지 못했습니다. 다시 시도해주세요.');
        return;
      }
      if (settle(polled)) return;
    }
    fail('AI 코드 리뷰 생성이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.');
  }, [jobId, judgmentId]);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setOpen(true);
    if (phase === 'idle' || phase === 'failed') {
      void start();
    }
  };

  if (!jobId) return null;

  return (
    <AiReviewSlot>
      <AiReviewButton type="button" data-state={phase} onClick={handleButtonClick}>
        {phase === 'pending' && <CircularProgress size={12} sx={{ color: '#fff' }} />}
        {BUTTON_LABEL.get(phase)}
      </AiReviewButton>

      {/* persistent: 배경을 막지 않아 채점 결과·에디터를 계속 볼 수 있다 */}
      <Drawer
        anchor="right"
        variant="persistent"
        open={open}
        PaperProps={{
          sx: {
            top: '50px',
            height: 'calc(100% - 50px)',
            width: { xs: '100%', sm: '480px' },
            borderLeft: '1px solid var(--educoding-line)',
            backgroundColor: 'var(--educoding-dark)',
          },
        }}
      >
        <AiReviewPanel role="region" aria-label="AI 코드 리뷰" aria-busy={phase === 'pending'}>
          <div className="panel-header">
            <div>
              <strong>AI 코드 리뷰</strong>
              {judgmentId !== null && <small>제출 #{judgmentId} 기준</small>}
            </div>
            <button type="button" onClick={() => setOpen(false)}>
              닫기 ✕
            </button>
          </div>
          <div className="panel-body">
            {phase === 'pending' && (
              <div className="status-box">
                <CircularProgress size={28} sx={{ color: 'var(--educoding-purple)' }} />
                <p>
                  제출한 코드를 분석하고 있어요. 최대 2~3분 걸릴 수 있습니다.
                  <br />
                  창을 닫아도 채점 결과는 그대로 확인할 수 있어요.
                </p>
              </div>
            )}
            {phase === 'failed' && (
              <div className="status-box">
                <p className="error">{errorMessage}</p>
                <button type="button" className="retry-btn" onClick={() => void start()}>
                  다시 시도
                </button>
              </div>
            )}
            {phase === 'completed' && review !== null ? <ReviewBody review={review} /> : null}
          </div>
        </AiReviewPanel>
      </Drawer>
    </AiReviewSlot>
  );
};

export default CodingTest_AiReview;
