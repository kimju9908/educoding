import React, { useState, useRef, useCallback, JSX } from 'react';

import { useNavigate, Link, useParams } from 'react-router-dom';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { Base64 } from 'js-base64';

import CodingTestApi from '../../../../api/AxiosApi/CodingTestApi/CodingTestApi';
import {
  CancelJobResponse,
  ErrorDataType,
  SubmitCodeRequest,
  SubmitCodeResponse,
} from '../../../../api/AxiosApi/CodingTestApi/CodingTestApiType';
import { CodingTest_CodingPage as CssWrapper } from '../../../styles/codingtest/CodingTest_CodingPage';
import { LevelTypeObject, SSETestCaseResult, TestCaseResultMap } from '../CodingTestType';
import CodingTest_AiHint from '../components/CodingTest_AiHint';
import CodingTest_AiReview from '../components/CodingTest_AiReview';
import CodingTest_CodeEditor from '../components/CodingTest_CodeEditor';
import CodingTest_CodeResult from '../components/CodingTest_CodeResult';
import CodingTest_QuestInfo from '../components/CodingTest_QuestInfo';
import useSse from '../customhook/useSse';

const convertLanguageWithVersion = (language: string): string => {
  const languageMap: Record<string, string> = {
    c: 'C11',
    nodejs: 'NODEJS20',
    nodejsesm: 'NODEJS20ESM',
    python: 'PYTHON3',
    cpp: 'CPP17',
    java: 'JAVA17',
  };
  return languageMap[language.toLowerCase()];
};

const CodingTest_Coding = (): JSX.Element => {
  const navigate = useNavigate();
  const { level } = useParams();
  const [headerTitle, setHeaderTitle] = useState<string>('Loading...');
  const [language, setLanguage] = useState<string>('java');

  // 에디터 인풋 value
  const [codeEditorValue, setCodeEditorValue] = useState<string>('');

  // 문제 번호
  const { challengeId } = useParams();

  // 코드 실행 작업의 고유 식별자
  const jobIdRef = useRef<string | null>(null);

  // 코드 실행 결과
  const [results, setResults] = useState<TestCaseResultMap | null>(null);

  // 이번 채점의 모든 테스트 케이스가 통과했는지 (SSE 메시지마다 갱신)
  const allPassedRef = useRef<boolean>(false);
  // AI 코드 리뷰 대상: 정답 처리된 채점의 jobId (새 제출·취소·오답이면 null)
  const [reviewJobId, setReviewJobId] = useState<string | null>(null);
  // AI 힌트: 오답으로 끝난 채점의 jobId (그 제출을 힌트 기준으로 자동 선택)
  const [failedJobId, setFailedJobId] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);

  // SSE 연결이 반복되지 않도록 useCallback 사용
  const handleOpen = useCallback((totalTestCases: number) => {
    const resultToUpdate: TestCaseResultMap = {};
    for (let i = 1; i <= totalTestCases; i++) resultToUpdate[i] = {};
    allPassedRef.current = totalTestCases > 0;
    setResults(resultToUpdate);
  }, []);

  const handleMessage = useCallback((result: SSETestCaseResult): void => {
    // 정상 실행이 된 경우
    if (!result.failureCause) {
      if (!result.passed) allPassedRef.current = false;
      setResults((prev) => ({
        ...prev,
        [result.testCaseIndex as number]: {
          passed: result.passed,
          memoryUsageMb: result.memoryUsageMb,
          elapsedTimeMs: result.elapsedTimeMs,
        },
      }));
    } else {
      allPassedRef.current = false;
      setResults({
        [-1]: {
          failureCause: result.failureCause,
          failureDetail: result.failureDetail,
        },
      });
    }
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const handleError = useCallback((errorMessage: string): void => {
    jobIdRef.current = null;
    allPassedRef.current = false;
    setResults(null);
    // alert(errorMessage);
    setDialogMessage(errorMessage || '알 수 없는 오류가 발생했습니다.');
    setDialogOpen(true);
  }, []);

  const handleComplete = useCallback((): void => {
    // jobId를 비우기 전에, 통과한 채점이면 그 jobId를 AI 코드 리뷰 대상으로 잡아둔다
    if (allPassedRef.current && jobIdRef.current) setReviewJobId(jobIdRef.current);
    if (!allPassedRef.current && jobIdRef.current) setFailedJobId(jobIdRef.current);
    jobIdRef.current = null;
    setDialogMessage('채점이 완료되었습니다.');
    setDialogOpen(true);
  }, []);

  const [isConnectedRef, connect]: [React.RefObject<boolean>, () => void] = useSse({
    jobId: jobIdRef.current,
    onOpen: handleOpen,
    onMessage: handleMessage,
    onError: handleError,
    onComplete: handleComplete,
  });

  const isErrorDataType = (
    data: SubmitCodeResponse | CancelJobResponse | ErrorDataType | null,
  ): data is ErrorDataType => {
    return typeof data === 'object' && data !== null && !('jobId' in data);
  };

  const handleSubmitButtonClick = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    if (jobIdRef.current) {
      setDialogMessage('채점이 진행중이니, 중단 후 다시 시도해주세요.');
      setDialogOpen(true);

      return;
    }

    const submitRequest: SubmitCodeRequest = {
      codeLanguage: convertLanguageWithVersion(language),
      code: Base64.encode(codeEditorValue),
      challengeId: Number(challengeId),
    };

    const submitResponseData = await CodingTestApi.submitCode(submitRequest);

    // 조건문 내부 값이 undefined면 falsy 값
    if (isErrorDataType(submitResponseData)) {
      const errorMessage = submitResponseData['error'];
      handleError(errorMessage ?? '');
      return;
    }

    jobIdRef.current = submitResponseData['jobId'];
    allPassedRef.current = false;
    setReviewJobId(null);
    setResults(null);
    connect();
  };

  const handleCancelButtonClick = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    if (!isConnectedRef.current) {
      setDialogMessage('진행 중인 채점이 없습니다.');
      setDialogOpen(true);
      return;
    }

    const jobIdToCancel = jobIdRef.current;
    jobIdRef.current = null;
    setResults(null);
    connect();

    const cancelJobResponseData = await CodingTestApi.cancelJob(jobIdToCancel as string); // 수정 필요 (null 값 처리)
    if (isErrorDataType(cancelJobResponseData)) {
      const errorMessage = cancelJobResponseData['error'];
      handleError(errorMessage ?? '');
      return;
    }

    setDialogMessage('채점이 중단되었습니다.');
    setDialogOpen(true);
  };

  const levelNames: LevelTypeObject = {
    practice: '연습문제',
    basic: '1단계',
    intermediate: '2단계',
    expert: '3단계',
  };

  return (
    <>
      <CssWrapper>
        <header>
          <div>
            <div className="logo-container">
              <Link className="logo" to="/">
                educoding
              </Link>
            </div>
            <div className="menu-tree-indicator">
              <span onClick={() => navigate(`/codingtest/${level}`)}>
                {levelNames[level as keyof LevelTypeObject]}
              </span>
              <span>{headerTitle}</span>
            </div>
          </div>

          <div>
            <button className="leave-page-btn" onClick={() => setHintOpen((prev) => !prev)}>
              {hintOpen ? '힌트 닫기' : '힌트 보기'}
            </button>
            <button
              className="leave-page-btn"
              onClick={() => {
                navigate(-1);
              }}
            >
              나가기
            </button>
          </div>
        </header>

        <main>
          <div>
            <CodingTest_CodeEditor
              language={language}
              setLanguage={setLanguage}
              value={codeEditorValue}
              setValue={setCodeEditorValue}
              handleSubmitButtonClick={handleSubmitButtonClick}
              handleCancelButtonClick={handleCancelButtonClick}
              isConnectedRef={isConnectedRef}
            />
            <CodingTest_CodeResult
              results={results}
              headerAction={<CodingTest_AiReview jobId={reviewJobId} />}
            />
          </div>
          <div>
            <CodingTest_QuestInfo
              setHeaderTitle={setHeaderTitle}
              setCodeEditorValue={setCodeEditorValue}
              level={levelNames[level as keyof LevelTypeObject]}
            />
          </div>
        </main>
        <CodingTest_AiHint
          challengeId={Number(challengeId)}
          language={convertLanguageWithVersion(language) ?? null}
          failedJobId={failedJobId}
          open={hintOpen}
          onClose={() => setHintOpen(false)}
        />
        {/* <footer></footer> */}
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          PaperProps={{
            sx: {
              fontFamily: 'regular',
              minWidth: '400px', // 최소 가로 너비 설정
              maxWidth: '500px', // 최대 가로 너비 설정
            },
          }}
        >
          <DialogContent
            sx={{
              fontFamily: 'bold',
              fontSize: '14px',
              textAlign: 'center', // 가로 정렬
              display: 'flex',
              justifyContent: 'center', // 세로 정렬
              alignItems: 'center', // 세로 정렬
            }}
          >
            {dialogMessage}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'right' }}>
            <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleDialogClose}>
              닫기
            </Button>
          </DialogActions>
        </Dialog>
      </CssWrapper>
    </>
  );
};

export default CodingTest_Coding;
