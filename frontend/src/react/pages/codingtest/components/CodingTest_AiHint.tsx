import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import { CircularProgress, Drawer } from '@mui/material';

import CodeHintApi from '../../../../api/AxiosApi/CodeHintApi/CodeHintApi';
import {
  CodeHintContent,
  CodeHintState,
  HintSubmission,
} from '../../../../api/AxiosApi/CodeHintApi/CodeHintApiType';
import CodeReviewApi, { isCodeReviewApiError } from '../../../../api/AxiosApi/CodeReviewApi/CodeReviewApi';
import { AiHintPanel } from '../../../styles/codingtest/CodingTest_AiHint';
import { FailureCauseMap, FailureCauseType } from '../CodingTestType';

type Props = {
  challengeId: number;
  // 에디터에서 고른 언어 (CodeChallengeLanguage). 제출 전 힌트의 관련 강의 검색에만 쓴다.
  language: string | null;
  // 방금 오답으로 끝난 채점의 jobId -- 바뀌면 그 제출을 힌트 기준으로 자동 선택한다
  failedJobId: string | null;
  open: boolean;
  onClose: () => void;
};

// 힌트 기준: 'problem' = 제출 전(문제 조건만), 숫자 = 오답 제출 ID
type Basis = 'problem' | number;

const LEVEL_NAMES = ['', '개념', '접근 방법', '구현 방향'];
const MAX_QUESTION_CHARS = 300;
// 다른 탭 등에서 생성 중일 때 상태를 다시 확인하는 간격/횟수 (약 3분)
const POLL_INTERVAL_MS = 3000;
const POLL_MAX_COUNT = 60;
// 웹훅 저장이 SSE 완료보다 늦을 수 있어 jobId → 제출 조회를 잠깐 다시 시도한다
const TARGET_RETRY_COUNT = 6;
const TARGET_RETRY_DELAY_MS = 1000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const judgmentIdOf = (basis: Basis): number | null => (basis === 'problem' ? null : basis);

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const failureLabel = (cause: string | null): string =>
  cause && cause in FailureCauseMap ? FailureCauseMap[cause as FailureCauseType] : '실패';

const HintBody = ({ content }: { content: CodeHintContent }): JSX.Element => (
  <>
    <p>{content.summary}</p>
    {content.concepts.length > 0 && (
      <>
        <p className="label">핵심 개념</p>
        <ul>
          {content.concepts.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </>
    )}
    {content.guidingQuestions.length > 0 && (
      <>
        <p className="label">스스로 생각해 볼 질문</p>
        <ul>
          {content.guidingQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </>
    )}
    {content.approach && (
      <>
        <p className="label">접근 방법</p>
        <p>{content.approach}</p>
      </>
    )}
    {content.dataStructures.length > 0 && (
      <>
        <p className="label">어울리는 자료구조</p>
        <ul>
          {content.dataStructures.map((d, i) => (
            <li key={i}>
              <strong>{d.name}</strong> — {d.reason}
            </li>
          ))}
        </ul>
      </>
    )}
    {content.steps.length > 0 && (
      <>
        <p className="label">구현 순서</p>
        <ol>
          {content.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </>
    )}
    {content.pseudocode && (
      <>
        <p className="label">의사코드 (언어 문법이 아닌 흐름만)</p>
        <pre>
          <code>{content.pseudocode}</code>
        </pre>
      </>
    )}
    {content.failureInsight && (
      <div className="insight">
        <span className={`badge ${content.failureInsight.speculative ? 'guess' : ''}`}>
          {content.failureInsight.speculative ? '추정' : '제출 분석'}
        </span>
        <p>{content.failureInsight.text}</p>
      </div>
    )}
    {content.lessons.length > 0 && (
      <>
        <p className="label">관련 강의</p>
        <ul>
          {content.lessons.map((lesson) => (
            <li key={lesson.chunkId}>
              <Link to={lesson.url} target="_blank" rel="noopener noreferrer">
                {lesson.title}
              </Link>
            </li>
          ))}
        </ul>
      </>
    )}
  </>
);

const CodingTest_AiHint = ({ challengeId, language, failedJobId, open, onClose }: Props): JSX.Element => {
  const [basis, setBasis] = useState<Basis>('problem');
  const [submissions, setSubmissions] = useState<HintSubmission[]>([]);
  const [state, setState] = useState<CodeHintState | null>(null);
  // 화면에서만 쓰는 상태: 상태 조회 중 / 요청을 보내 응답을 기다리는 중
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');

  // 기준(풀이 시도)이 바뀌거나 언마운트된 뒤 도착한 응답은 버리기 위한 실행 번호
  const runRef = useRef(0);

  const refreshSubmissions = useCallback(async (): Promise<HintSubmission[]> => {
    const list = await CodeHintApi.listSubmissions(challengeId);
    if (isCodeReviewApiError(list)) return [];
    setSubmissions(list);
    return list;
  }, [challengeId]);

  // 생성 중이면 끝날 때까지 확인한다
  const pollWhileGenerating = useCallback(
    async (run: number, initial: CodeHintState): Promise<void> => {
      let current = initial;
      for (let i = 0; i < POLL_MAX_COUNT && current.status === 'GENERATING'; i++) {
        await sleep(POLL_INTERVAL_MS);
        if (runRef.current !== run) return;
        const polled = await CodeHintApi.getState(challengeId, current.judgmentId);
        if (runRef.current !== run) return;
        if (isCodeReviewApiError(polled)) {
          setRequestError(polled.error);
          return;
        }
        current = polled;
        setState(polled);
      }
      if (current.status === 'GENERATING') {
        setRequestError('힌트 생성이 오래 걸리고 있습니다. 잠시 후 다시 확인해주세요.');
      }
    },
    [challengeId],
  );

  // 기준이 바뀌면 그 풀이 시도의 상태를 새로 불러온다
  useEffect(() => {
    if (!open) return undefined;
    const run = ++runRef.current;
    setState(null);
    setRequestError(null);
    setRequesting(false);
    setLoading(true);
    void (async (): Promise<void> => {
      const loaded = await CodeHintApi.getState(challengeId, judgmentIdOf(basis));
      if (runRef.current !== run) return;
      setLoading(false);
      if (isCodeReviewApiError(loaded)) {
        setRequestError(loaded.error);
        return;
      }
      setState(loaded);
      if (loaded.status === 'GENERATING') await pollWhileGenerating(run, loaded);
    })();
    return (): void => {
      runRef.current += 1;
    };
  }, [open, basis, challengeId, pollWhileGenerating]);

  useEffect(() => {
    if (open) void refreshSubmissions();
  }, [open, refreshSubmissions]);

  // 오답으로 끝난 채점 → 그 제출을 기준으로 선택 (최신 제출로 대체하지 않고 jobId로 정확히 찾는다)
  useEffect(() => {
    if (!failedJobId) return undefined;
    let cancelled = false;
    void (async (): Promise<void> => {
      for (let attempt = 1; attempt <= TARGET_RETRY_COUNT; attempt++) {
        const target = await CodeReviewApi.findTarget(failedJobId);
        if (cancelled) return;
        if (!isCodeReviewApiError(target)) {
          if (!target.passed && target.challengeId === challengeId) {
            await refreshSubmissions();
            if (!cancelled) setBasis(target.judgmentId);
          }
          return;
        }
        if (target.status !== 404) return;
        await sleep(TARGET_RETRY_DELAY_MS);
      }
    })();
    return (): void => {
      cancelled = true;
    };
  }, [failedJobId, challengeId, refreshSubmissions]);

  const requestLevel = async (level: number): Promise<void> => {
    if (requesting || state === null) return;
    const run = runRef.current;
    setRequesting(true);
    setRequestError(null);
    const trimmed = question.trim();
    const result = await CodeHintApi.requestHint({
      challengeId,
      judgmentId: judgmentIdOf(basis),
      level,
      language: basis === 'problem' ? language : null,
      question: trimmed === '' ? null : trimmed,
    });
    if (runRef.current !== run) return;
    setRequesting(false);
    if (isCodeReviewApiError(result)) {
      setRequestError(result.error);
      // 단계 건너뛰기 거절(409) 등: 서버 상태로 다시 맞춘다
      const latest = await CodeHintApi.getState(challengeId, judgmentIdOf(basis));
      if (runRef.current === run && !isCodeReviewApiError(latest)) setState(latest);
      return;
    }
    setState(result);
    if (result.status === 'READY' && result.revealedLevel >= level) setQuestion('');
    if (result.status === 'GENERATING') await pollWhileGenerating(run, result);
  };

  const revealed = state?.revealedLevel ?? 0;
  const maxLevel = state?.maxLevel ?? 3;
  const generating = requesting || state?.status === 'GENERATING';
  const failed = !generating && state?.status === 'FAILED';
  const nextLevel = failed && state?.pendingLevel ? state.pendingLevel : revealed + 1;
  const allRevealed = revealed >= maxLevel;

  const stepState = (level: number): string => {
    if (level <= revealed) return 'done';
    if (level === nextLevel && generating) return 'generating';
    if (level === nextLevel && failed) return 'failed';
    return 'locked';
  };

  const stepStateLabel: Record<string, string> = {
    done: '공개됨',
    generating: '생성 중',
    failed: '실패',
    locked: '잠김',
  };

  const mainButtonLabel = (): string => {
    if (generating) return `${nextLevel}단계 힌트 생성 중…`;
    if (failed) return `${nextLevel}단계 다시 시도`;
    if (revealed === 0) return '힌트 보기 (1단계 · 개념)';
    return `다음 힌트 (${nextLevel}단계 · ${LEVEL_NAMES[nextLevel]})`;
  };

  return (
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
      <AiHintPanel role="region" aria-label="단계별 AI 힌트" aria-busy={generating || loading}>
        <div className="panel-header">
          <div>
            <strong>단계별 AI 힌트</strong>
          </div>
          <button type="button" onClick={onClose}>
            닫기 ✕
          </button>
        </div>
        <div className="panel-body">
          <label className="basis">
            <span>힌트 기준</span>
            <select
              value={basis === 'problem' ? 'problem' : String(basis)}
              disabled={requesting}
              onChange={(e) => setBasis(e.target.value === 'problem' ? 'problem' : Number(e.target.value))}
            >
              <option value="problem">제출 전 · 문제 조건만 참고</option>
              {submissions.map((s) => (
                <option key={s.judgmentId} value={s.judgmentId}>
                  오답 제출 #{s.judgmentId} · {formatTime(s.submittedAt)} · {failureLabel(s.failureCause)}
                </option>
              ))}
            </select>
          </label>
          <p className="note">
            {basis === 'problem'
              ? '문제 조건만 보고 힌트를 드려요. 제출하지 않은 에디터 코드는 분석하지 않습니다.'
              : '선택한 제출의 코드와 채점 실패 유형을 함께 참고해요. 어떤 테스트에서 틀렸는지는 AI도 알 수 없어 원인은 추정일 수 있어요.'}
            {' '}
            기준마다 힌트 단계가 따로 진행되며, 이전 기준의 힌트는 다시 선택하면 볼 수 있어요.
          </p>

          <ol className="steps" aria-label="힌트 단계">
            {[1, 2, 3].map((level) => (
              <li key={level} data-state={stepState(level)}>
                <span>{level}</span>
                {LEVEL_NAMES[level]}
                <small>{stepStateLabel[stepState(level)]}</small>
              </li>
            ))}
          </ol>

          {loading && (
            <div className="status-box">
              <CircularProgress size={24} sx={{ color: 'var(--educoding-purple)' }} />
            </div>
          )}

          {state?.hints.map((item) => (
            <section className="hint" key={item.level}>
              <div className="hint-head">
                <span className="level">
                  {item.level}단계 · {LEVEL_NAMES[item.level]}
                </span>
                <small>{formatTime(item.revealedAt)} 공개</small>
              </div>
              {item.question && <p className="asked">내 질문: {item.question}</p>}
              {item.content ? <HintBody content={item.content} /> : <p>힌트를 표시할 수 없습니다.</p>}
            </section>
          ))}

          {generating && (
            <div className="status-box">
              <CircularProgress size={24} sx={{ color: 'var(--educoding-purple)' }} />
              <p>{nextLevel}단계 힌트를 만들고 있어요. 1분 정도 걸릴 수 있어요.</p>
            </div>
          )}

          {(requestError || (failed && state?.errorMessage)) && (
            <p className="error" role="alert">
              {requestError ?? state?.errorMessage}
              {failed && ' 실패한 요청은 단계를 소모하지 않아요.'}
            </p>
          )}

          {state !== null && !allRevealed && (
            <div className="ask">
              <textarea
                value={question}
                maxLength={MAX_QUESTION_CHARS}
                disabled={generating}
                placeholder="(선택) 이번 힌트와 함께 궁금한 점 — 질문해도 공개 단계는 바뀌지 않아요"
                onChange={(e) => setQuestion(e.target.value)}
              />
              <small>
                {question.length}/{MAX_QUESTION_CHARS}
              </small>
              <button
                type="button"
                className="next-btn"
                disabled={generating}
                onClick={() => void requestLevel(nextLevel)}
              >
                {mainButtonLabel()}
              </button>
            </div>
          )}
          {allRevealed && <p className="note">모든 단계의 힌트를 확인했어요. 정답 코드는 제공하지 않아요.</p>}

          <p className="note">AI가 만든 힌트로, 틀린 내용이 있을 수 있습니다.</p>
        </div>
      </AiHintPanel>
    </Drawer>
  );
};

export default CodingTest_AiHint;
