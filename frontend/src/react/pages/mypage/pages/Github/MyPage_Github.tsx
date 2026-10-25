import { JSX, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useOutletContext, useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import type { OutletContextType } from '../../MyPageType';

import { isCodeReviewApiError } from '../../../../../api/AxiosApi/CodeReviewApi/CodeReviewApi';
import GithubApi, {
  AutoCommitJob,
  AutoCommitPreview,
  AutoSaveSetting,
  GithubAnalysis,
  GithubConnection,
} from '../../../../../api/AxiosApi/GithubApi/GithubApi';
import { useAppSelector } from '../../../../../redux/hooks/reduxHooks';
import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  PageSubTitleBar,
} from '../../../../styles/mypage/MyPage_Main';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';

const Panel = styled.section`
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  color: var(--educoding-white);
  background: var(--educoding-dark);
  border: 1px solid var(--educoding-line);
  margin-bottom: 16px;
  p { line-height: 1.6; margin: 8px 0; }
  .row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 12px 0; }
  button { padding: 10px 14px; border-radius: 6px; color: inherit; background: var(--educoding-purple);
    border: 1px solid var(--educoding-line); cursor: pointer; }
  button.secondary { background: var(--educoding-dark); }
  button:disabled { opacity: .6; cursor: wait; }
  a { color: inherit; text-decoration: underline; }
  [role='alert'] { color: #ffb4ab; }
  [role='status'] { opacity: .85; }
  ul.repos { list-style: none; padding: 0; }
  ul.repos li { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--educoding-line); }
  .card { border: 1px solid var(--educoding-line); border-radius: 6px; padding: 12px; margin: 10px 0; }
  .badge { font-size: 12px; padding: 2px 8px; border-radius: 10px; border: 1px solid var(--educoding-line); margin-left: 6px; }
  .evidence { font-size: 13px; opacity: .85; }
  code { background: rgba(255,255,255,.08); padding: 1px 4px; border-radius: 4px; }
`;

const STATUS_MESSAGE: Record<string, string> = {
  connected: 'GitHub 계정이 연결되었습니다.',
  installed: '저장소 접근 권한이 연결되었습니다. 분석할 저장소를 선택해주세요.',
  github_oauth_denied: 'GitHub 로그인 요청을 취소했습니다.',
  github_oauth_invalid_state: '요청이 만료되었거나 유효하지 않습니다. 다시 시도해주세요.',
  github_oauth_failed: 'GitHub 로그인 중 오류가 발생했습니다.',
  github_install_invalid_state: '요청이 만료되었거나 유효하지 않습니다. 다시 시도해주세요.',
  github_install_pending: '설치가 완료되지 않았습니다.',
  github_install_unverifiable: 'GitHub 설치 설정 문제로 신원을 확인할 수 없습니다. 관리자에게 문의해주세요.',
  github_install_not_logged_in: '먼저 GitHub 계정을 연결해주세요.',
  github_install_account_mismatch: '로그인한 GitHub 계정과 설치한 계정이 다릅니다.',
  github_install_not_owned: '본인이 설치한 권한이 아닙니다.',
  github_install_failed: '저장소 접근 권한 연결 중 오류가 발생했습니다.',
};

const githubEvidenceUrl = (ref: { owner: string; repo: string; path: string; commitSha: string | null }): string =>
  `https://github.com/${ref.owner}/${ref.repo}/blob/${ref.commitSha ?? 'HEAD'}/${ref.path}`;

const MyPage_Github = (): JSX.Element => {
  const mainContentRef = useOutletContext<OutletContextType>();
  const token = useAppSelector((state) => state.auth.accesstoken);
  const [searchParams, setSearchParams] = useSearchParams();
  const [connection, setConnection] = useState<GithubConnection | null>(null);
  const [analysis, setAnalysis] = useState<GithubAnalysis | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [autoSave, setAutoSave] = useState<AutoSaveSetting | null>(null);
  const [autoSaveForm, setAutoSaveForm] = useState<{ repositoryId: number | null; branch: string; basePath: string }>(
    { repositoryId: null, branch: '', basePath: '' },
  );
  const [preview, setPreview] = useState<AutoCommitPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [jobs, setJobs] = useState<AutoCommitJob[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sequence = useRef(0);

  useLayoutEffect(() => { mainContentRef?.current?.scrollTo(0, 0); }, [mainContentRef]);

  const statusParam = searchParams.get('githubStatus');

  const loadConnection = async (): Promise<void> => {
    const result = await GithubApi.connection();
    if (isCodeReviewApiError(result)) { setError(result.error); return; }
    setConnection(result);
    setSelected(new Set(result.repositories.filter((r) => r.selected).map((r) => r.id)));
  };

  const loadLatestAnalysis = async (): Promise<GithubAnalysis | null> => {
    const result = await GithubApi.latestAnalysis();
    if (isCodeReviewApiError(result)) { setError(result.error); return null; }
    setAnalysis(result);
    return result;
  };

  const loadAutoSave = async (): Promise<void> => {
    const result = await GithubApi.autoSaveSettings();
    if (isCodeReviewApiError(result)) { setError(result.error); return; }
    setAutoSave(result);
    setAutoSaveForm({ repositoryId: result.repositoryId, branch: result.branch ?? '', basePath: result.basePath });
  };

  const loadJobs = async (): Promise<void> => {
    const result = await GithubApi.autoSaveJobs();
    if (!isCodeReviewApiError(result)) setJobs(result);
  };

  useEffect(() => {
    if (!token) return;
    void loadConnection();
    void loadLatestAnalysis();
    void loadAutoSave();
    void loadJobs();
    if (statusParam) {
      searchParams.delete('githubStatus');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!analysis?.generating || !token) return;
    const current = ++sequence.current;
    const timer = window.setTimeout(() => {
      void loadLatestAnalysis().then((result) => {
        if (sequence.current !== current || !result) return;
      });
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [analysis, token]);

  const toggleRepo = (id: number): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const saveSelection = async (): Promise<void> => {
    setBusy(true); setError('');
    const result = await GithubApi.selectRepositories([...selected]);
    setBusy(false);
    if (isCodeReviewApiError(result)) setError(result.error);
    else setConnection(result);
  };

  const requestAnalysis = async (): Promise<void> => {
    setBusy(true); setError('');
    const result = await GithubApi.requestAnalysis();
    setBusy(false);
    if (isCodeReviewApiError(result)) setError(result.error);
    else setAnalysis(result);
  };

  const cancelAnalysis = async (): Promise<void> => {
    if (!analysis?.id) return;
    const result = await GithubApi.cancelAnalysis(analysis.id);
    if (isCodeReviewApiError(result)) setError(result.error);
    else setAnalysis(result);
  };

  const disconnect = async (): Promise<void> => {
    if (!window.confirm('GitHub 연결을 해제하시겠어요? GitHub 쪽 설치는 별도로 관리 페이지에서 제거할 수 있습니다.')) return;
    const result = await GithubApi.disconnect();
    if (isCodeReviewApiError(result)) setError(result.error);
    else { setConnection(null); void loadConnection(); }
  };

  const startOauth = async (): Promise<void> => {
    const result = await GithubApi.oauthStartUrl();
    if (isCodeReviewApiError(result)) setError(result.error);
    else window.location.href = result;
  };

  const startInstall = async (): Promise<void> => {
    const result = await GithubApi.installStartUrl();
    if (isCodeReviewApiError(result)) setError(result.error);
    else window.location.href = result;
  };

  const refreshWritePermission = async (): Promise<void> => {
    const result = await GithubApi.refreshWritePermission();
    if (isCodeReviewApiError(result)) setError(result.error);
    else setConnection(result);
  };

  const saveAutoSaveSettings = async (): Promise<void> => {
    if (!autoSaveForm.repositoryId || !autoSaveForm.branch.trim()) {
      setError('저장소와 브랜치를 선택해주세요.');
      return;
    }
    setBusy(true); setError('');
    const result = await GithubApi.saveAutoSaveSettings(autoSaveForm.repositoryId, autoSaveForm.branch.trim(), autoSaveForm.basePath.trim());
    setBusy(false);
    if (isCodeReviewApiError(result)) setError(result.error);
    else setAutoSave(result);
  };

  const togglePreview = async (): Promise<void> => {
    if (showPreview) { setShowPreview(false); return; }
    const result = await GithubApi.autoSavePreview();
    if (isCodeReviewApiError(result)) { setError(result.error); return; }
    setPreview(result);
    setShowPreview(true);
  };

  const enableAutoSave = async (): Promise<void> => {
    setBusy(true); setError('');
    const result = await GithubApi.enableAutoSave();
    setBusy(false);
    if (isCodeReviewApiError(result)) setError(result.error);
    else setAutoSave(result);
  };

  const disableAutoSave = async (): Promise<void> => {
    const result = await GithubApi.disableAutoSave();
    if (isCodeReviewApiError(result)) setError(result.error);
    else setAutoSave(result);
  };

  const retryJob = async (id: number): Promise<void> => {
    const result = await GithubApi.retryAutoSaveJob(id);
    if (isCodeReviewApiError(result)) { setError(result.error); return; }
    void loadJobs();
  };

  return (
    <Wrap>
      <Container>
        <LeftContainer>
          <LeftTopProfile />
          <LeftMenus />
        </LeftContainer>
        <RightContainer>
          <PageTitleBar>GitHub 코드 기반 학습 진단</PageTitleBar>
          <PageSubTitleBar>GitHub 연결</PageSubTitleBar>
          {!token ? (
            <Panel><p>로그인 후 이용할 수 있어요.</p></Panel>
          ) : (
            <>
              {statusParam && STATUS_MESSAGE[statusParam] && <Panel role="status"><p>{STATUS_MESSAGE[statusParam]}</p></Panel>}
              {error && <Panel role="alert"><p>{error}</p></Panel>}
              <Panel>
                <p>실제 코드와 본인 커밋을 근거로 확인 가능한 개발 경험을 정리하고 학습 경로를 추천합니다. 읽기 권한만 사용하며, 분석 대상 저장소는 최대 3개까지 직접 선택합니다.</p>
                {!connection?.loggedIn ? (
                  <div className="row"><button type="button" onClick={() => { void startOauth(); }}>GitHub 계정 로그인</button></div>
                ) : (
                  <>
                    <p>로그인됨: <strong>@{connection.githubLogin}</strong></p>
                    {!connection.installed ? (
                      <div className="row"><button type="button" onClick={() => { void startInstall(); }}>저장소 접근 권한 연결</button></div>
                    ) : (
                      <>
                        <p>저장소 접근 권한 연결됨 ({connection.installationAccountLogin}). 분석할 저장소를 최대 3개까지 선택하세요.</p>
                        <ul className="repos">
                          {connection.repositories.map((r) => (
                            <li key={r.id}>
                              <input type="checkbox" checked={selected.has(r.id)}
                                disabled={!selected.has(r.id) && selected.size >= 3}
                                onChange={() => toggleRepo(r.id)} />
                              <span>{r.owner}/{r.name}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="row">
                          <button type="button" disabled={busy} onClick={() => { void saveSelection(); }}>선택 저장</button>
                          <button type="button" className="secondary" onClick={() => { void GithubApi.refreshRepositories().then((r) => { if (!isCodeReviewApiError(r)) setConnection(r); }); }}>저장소 목록 새로고침</button>
                        </div>
                      </>
                    )}
                    <p>
                      쓰기 권한(자동 저장용): {connection.writePermissionGranted ? '있음' : '없음'}
                      {!connection.writePermissionGranted && connection.writePermissionUpgradeUrl && (
                        <> — <a href={connection.writePermissionUpgradeUrl} target="_blank" rel="noreferrer">GitHub에서 권한 요청</a>{' '}
                          <button type="button" className="secondary" onClick={() => { void refreshWritePermission(); }}>권한 다시 확인</button>
                        </>
                      )}
                    </p>
                    <div className="row">
                      <button type="button" className="secondary" onClick={() => { void disconnect(); }}>연결 해제</button>
                      <a href={connection.manageUrl} target="_blank" rel="noreferrer">GitHub에서 설치 관리</a>
                    </div>
                  </>
                )}
              </Panel>

              {connection?.installed && connection.writePermissionGranted && (
                <>
                  <PageSubTitleBar>정답 풀이 자동 저장</PageSubTitleBar>
                  <Panel>
                    <p>정답 처리된 제출과 AI 요약을 지정한 저장소에 자동으로 커밋합니다. 설정을 저장해도 바로 켜지지 않으며, 미리보기를 확인한 뒤 직접 켜야 합니다.</p>
                    <div className="row">
                      <label>저장소
                        <select value={autoSaveForm.repositoryId ?? ''} disabled={Boolean(autoSave?.enabled)}
                          onChange={(e) => setAutoSaveForm({ ...autoSaveForm, repositoryId: e.target.value ? Number(e.target.value) : null })}>
                          <option value="">선택</option>
                          {connection.repositories.map((r) => <option key={r.id} value={r.id}>{r.owner}/{r.name}</option>)}
                        </select>
                      </label>
                      <label>브랜치
                        <input type="text" value={autoSaveForm.branch} disabled={Boolean(autoSave?.enabled)}
                          onChange={(e) => setAutoSaveForm({ ...autoSaveForm, branch: e.target.value })} placeholder="main" />
                      </label>
                      <label>기본 경로(선택)
                        <input type="text" value={autoSaveForm.basePath} disabled={Boolean(autoSave?.enabled)}
                          onChange={(e) => setAutoSaveForm({ ...autoSaveForm, basePath: e.target.value })} placeholder="예: solutions" />
                      </label>
                    </div>
                    {!autoSave?.enabled && (
                      <div className="row">
                        <button type="button" disabled={busy} onClick={() => { void saveAutoSaveSettings(); }}>설정 저장</button>
                        <button type="button" className="secondary" onClick={() => { void togglePreview(); }}>
                          {showPreview ? '미리보기 닫기' : '미리보기'}
                        </button>
                        <button type="button" disabled={busy || !autoSave?.configured} onClick={() => { void enableAutoSave(); }}>자동 저장 켜기</button>
                      </div>
                    )}
                    {autoSave?.enabled && (
                      <div className="row">
                        <p role="status">자동 저장 켜짐: {autoSave.owner}/{autoSave.name}@{autoSave.branch}</p>
                        <button type="button" className="secondary" onClick={() => { void disableAutoSave(); }}>자동 저장 끄기</button>
                      </div>
                    )}
                    {showPreview && preview && (
                      <div className="card">
                        <p>저장 경로: <code>{preview.path}/{preview.solutionFileName}</code>, <code>{preview.path}/README.md</code></p>
                        <p>README 미리보기(AI 요약 부분은 저장 시 채워집니다):</p>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>{preview.readmePreview}</pre>
                      </div>
                    )}
                    {jobs.length > 0 && (
                      <>
                        <h3>최근 저장 작업</h3>
                        {jobs.map((job) => (
                          <div className="card" key={job.id}>
                            <p>{job.owner}/{job.name}/{job.path} — <strong>{job.status}</strong>
                              {job.status === 'FAILED' && <button type="button" className="secondary" onClick={() => { void retryJob(job.id); }}>다시 시도</button>}
                            </p>
                            {job.errorMessage && <p className="evidence">{job.errorMessage}</p>}
                            {job.commitUrl && <p><a href={job.commitUrl} target="_blank" rel="noreferrer">커밋 보기</a></p>}
                          </div>
                        ))}
                      </>
                    )}
                  </Panel>
                </>
              )}

              {connection?.installed && (
                <>
                  <PageSubTitleBar>진단 결과</PageSubTitleBar>
                  <Panel>
                    <div className="row">
                      <button type="button" disabled={busy || Boolean(analysis?.generating) || selected.size === 0}
                        onClick={() => { void requestAnalysis(); }}>
                        {analysis?.generating ? '분석 중…' : analysis?.id ? '다시 분석 요청' : '분석 요청'}
                      </button>
                      {analysis?.generating && <button type="button" className="secondary" onClick={() => { void cancelAnalysis(); }}>취소</button>}
                    </div>
                    {analysis?.notice && <p role="status">{analysis.notice}</p>}
                    {analysis?.status === 'COMPLETED' && (
                      <>
                        <h3>확인된 구현 경험</h3>
                        {analysis.confirmed.length === 0 && <p>확인된 항목이 없습니다.</p>}
                        {analysis.confirmed.map((item, i) => (
                          <div className="card" key={i}>
                            <strong>{item.concept}</strong>
                            <p>{item.evidenceSummary}</p>
                            <p className="evidence">{item.evidenceRefs.map((ref, j) => (
                              <span key={j}><a href={githubEvidenceUrl(ref)} target="_blank" rel="noreferrer">
                                {ref.owner}/{ref.repo}/{ref.path}{ref.commitSha ? ` @ ${ref.commitSha.slice(0, 7)}` : ''}
                              </a>{j < item.evidenceRefs.length - 1 ? ', ' : ''}</span>
                            ))}</p>
                            <p className="evidence">범위/한계: {item.limits}</p>
                          </div>
                        ))}
                        <h3>확인이 부족한 영역</h3>
                        {analysis.gaps.length === 0 && <p>해당 없음.</p>}
                        {analysis.gaps.map((item, i) => (
                          <div className="card" key={i}><strong>{item.concept}</strong><p>{item.note}</p></div>
                        ))}
                        <h3>추천 학습 주제</h3>
                        {analysis.recommendedTopics.length === 0 && <p>추천할 주제가 없습니다.</p>}
                        {analysis.recommendedTopics.map((topic, i) => (
                          <div className="card" key={i}>
                            <strong>{topic.concept}</strong>
                            {!topic.supported && <span className="badge">지원 부족</span>}
                            <p>{topic.reason}</p>
                            {topic.lessonUrl && <p><a href={topic.lessonUrl}>{topic.lessonTitle}</a></p>}
                            {topic.challengeUrl && <p><a href={topic.challengeUrl}>{topic.challengeTitle}</a></p>}
                          </div>
                        ))}
                        {analysis.scopeNote && <p className="evidence">분석 범위: {analysis.scopeNote}</p>}
                      </>
                    )}
                  </Panel>
                </>
              )}
            </>
          )}
        </RightContainer>
      </Container>
    </Wrap>
  );
};
export default MyPage_Github;
