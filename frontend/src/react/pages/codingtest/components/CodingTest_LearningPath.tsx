import { JSX, useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { isCodeReviewApiError } from '../../../../api/AxiosApi/CodeReviewApi/CodeReviewApi';
import LearningPathApi, { LearningPath, LearningProfile } from '../../../../api/AxiosApi/LearningPathApi/LearningPathApi';
import { useAppSelector } from '../../../../redux/hooks/reduxHooks';

const Panel = styled.section`
  width: min(100%, 1280px);
  padding: 24px;
  margin: 0 auto;
  box-sizing: border-box;
  color: var(--educoding-white);
  background: var(--educoding-dark);
  border: 1px solid var(--educoding-line);
  h2 { font-size: 20px; margin: 0 0 12px; }
  p { line-height: 1.6; margin: 8px 0; }
  .controls { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; margin: 16px 0; }
  label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
  select, button { padding: 10px; border-radius: 6px; color: inherit; background: var(--educoding-dark); border: 1px solid var(--educoding-line); }
  button { cursor: pointer; background: var(--educoding-purple); }
  button:disabled { opacity: .6; cursor: wait; }
  ol { padding-left: 24px; }
  li { padding: 12px 0; border-bottom: 1px solid var(--educoding-line); }
  a { color: inherit; text-decoration: underline; }
  small { line-height: 1.6; display: block; opacity: .8; }
  [role='alert'] { color: #ffb4ab; }
`;
const KIND = { LESSON: '강의 복습', PRACTICE: '연습 문제', RETRY: '오답 재도전' };

const CodingTest_LearningPath = (): JSX.Element => {
  const owner = useAppSelector((state) => state.auth.keynumber);
  const token = useAppSelector((state) => state.auth.accesstoken);
  const [profile, setProfile] = useState<LearningProfile>({ language: 'python', level: 'PRACTICE', goal: 'BASICS' });
  const [plan, setPlan] = useState<LearningPath | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sequence = useRef(0);
  const pollCount = useRef(0);

  useEffect(() => {
    const current = ++sequence.current;
    setPlan(null);
    setError('');
    setBusy(false);
    pollCount.current = 0;
    if (!token) return;
    void LearningPathApi.get(profile).then((result) => {
      if (sequence.current !== current) return;
      if (isCodeReviewApiError(result)) setError(result.error);
      else setPlan(result);
    });
    return () => { sequence.current++; };
  }, [profile, owner, token]);

  useEffect(() => {
    if (!plan?.generating || !token) return;
    if (pollCount.current >= 50) {
      setError('생성이 지연되고 있습니다. 잠시 후 페이지를 다시 열어주세요.');
      return;
    }
    const current = sequence.current;
    const timer = window.setTimeout(() => {
      pollCount.current++;
      void LearningPathApi.get(profile).then((result) => {
        if (sequence.current !== current) return;
        if (isCodeReviewApiError(result)) {
          setError(result.error);
          setPlan((previous) => previous ? { ...previous, generating: false } : null);
        } else setPlan(result);
      });
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [plan, profile, token]);

  const generate = async (): Promise<void> => {
    const current = ++sequence.current;
    setBusy(true);
    setError('');
    pollCount.current = 0;
    const result = await LearningPathApi.generate(profile, plan?.id !== null && plan?.id !== undefined);
    if (sequence.current !== current) return;
    setBusy(false);
    if (isCodeReviewApiError(result)) setError(result.error);
    else setPlan(result);
  };
  const disabled = busy || Boolean(plan?.generating);
  return (
    <Panel aria-label="오늘의 학습 경로">
      <h2>오늘의 학습 경로</h2>
      <p>풀이와 힌트 사용 기록을 바탕으로 복습 강의와 다음 문제를 연결합니다.</p>
      {!token ? <p>로그인하면 나만의 학습 경로를 만들 수 있어요.</p> : <>
        <div className="controls">
          <label>학습 언어<select value={profile.language} disabled={disabled} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
            <option value="python">Python</option><option value="java">Java</option><option value="javascript">JavaScript</option><option value="c">C</option><option value="cplus">C++</option>
          </select></label>
          <label>내가 선택한 수준<select value={profile.level} disabled={disabled} onChange={(e) => setProfile({ ...profile, level: e.target.value })}>
            <option value="PRACTICE">연습</option><option value="BASIC">1단계까지</option><option value="INTERMEDIATE">2단계까지</option><option value="EXPERT">3단계까지</option>
          </select></label>
          <label>학습 목표<select value={profile.goal} disabled={disabled} onChange={(e) => setProfile({ ...profile, goal: e.target.value })}>
            <option value="BASICS">기초 복습</option><option value="PRACTICE">문제 풀이 연습</option>
          </select></label>
          <button type="button" disabled={disabled} onClick={() => { void generate(); }}>
            {disabled ? '학습 경로를 만드는 중…' : plan?.id ? '현재 기록으로 새 추천' : '학습 경로 만들기'}
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
        {plan?.stale && <p role="status">풀이·힌트 또는 콘텐츠가 변경됐어요. 새 추천을 요청해 현재 기록을 반영하세요.</p>}
        {plan?.source === 'PENDING' && !plan.generating && <p role="status">이전 생성이 완료되지 않았습니다. 새 추천을 요청해주세요.</p>}
        {plan?.id && plan.source !== 'PENDING' && !plan.generating && <>
          <small>기준: {new Date(plan.asOf).toLocaleString()} · {plan.source === 'AI' ? 'AI가 후보 순서 구성' : '기본 추천 규칙 사용'}</small>
          {plan.steps.length ? <ol>{plan.steps.map((step) => <li key={step.id}>
            <strong>{KIND[step.kind]} · {step.concept}</strong><p><Link to={step.url}>{step.title}</Link></p><small>{step.reason}</small>
          </li>)}</ol> : <p>현재 수준에 맞는 태그 후보가 부족합니다. 언어나 수준을 바꿔보세요.</p>}
        </>}
        {plan && <details><summary>추천 근거와 지원 범위</summary><p>{plan.notice}</p>
          {plan.evidence.filter((item) => item.attempted > 0).map((item) => <p key={item.concept}>{item.evidence}</p>)}
        </details>}
      </>}
    </Panel>
  );
};
export default CodingTest_LearningPath;
