import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { Base64 } from 'js-base64';

import type {
  ErrorDataType,
  GetChallengeDetailRequest,
  GetChallengeDetailResponse,
} from '../../../../api/AxiosApi/CodingTestApi/CodingTestApiType';
import type { ChallengeExample, CodeChallengeInfoProps } from '../CodingTestType';

import CodingTestApi from '../../../../api/AxiosApi/CodingTestApi/CodingTestApi';
import JwtDecoding from '../../../../api/JwtDecode';
import { useAppSelector } from '../../../../redux/hooks/reduxHooks';
import { CodingTest_QuestInfo as CssWrapper } from '../../../styles/codingtest/CodingTest_QuestInfo';
import { challengeIoExamples } from '../constant/examples';

const CodeChallengeInfo: React.FC<CodeChallengeInfoProps> = ({
  level,
  setHeaderTitle,
  setCodeEditorValue,
}) => {
  const [challengeDetail, setChallengeDetail] = useState<Record<string, string>>({
    title: 'Loading...',
    description: 'Loading...',
    cond: 'Loading...',
    limits: 'Loading...',
  });

  const { challengeId } = useParams();

  const accessToken = useAppSelector((state) => state.auth.accesstoken);
  const userId = accessToken ? JwtDecoding.getFieldFromToken(accessToken, 'sub') : null;

  const isErrorDataType = (
    data: GetChallengeDetailResponse | ErrorDataType,
  ): data is ErrorDataType => {
    return typeof data === 'object' && data !== null && 'error' in data;
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const fetchChallengeDetail = async (): Promise<void> => {
      const challengeDetailRequest: GetChallengeDetailRequest = {
        challengeId: Number(challengeId),
      };
      const responseData = await CodingTestApi.getChallengeDetail(challengeDetailRequest);

      if (isErrorDataType(responseData)) {
        const errorMessage = responseData['error'];
        // alert(errorMessage);
        setDialogMessage(errorMessage || '알 수 없는 오류가 발생했습니다.');
        setDialogOpen(true);
        return;
      }

      setHeaderTitle(responseData['title']);

      if (responseData['lastSubmittedCode'])
        setCodeEditorValue(Base64.decode(responseData['lastSubmittedCode']));
      setChallengeDetail((prev) => ({
        ...prev,
        title: responseData['title'],
        description: responseData['description'],
        cond: responseData['cond'],
        limits: `메모리 제한: ${responseData['memoryLimitMb']}mb\n실행 시간: ${responseData['timeLimitMs']}초 이내`,
      }));
    };

    fetchChallengeDetail();
  }, [challengeId, setCodeEditorValue, setHeaderTitle, userId]);

  return (
    <>
      <CssWrapper>
        <div className="challenge-level">
          <div>
            <span>단계</span>
          </div>
          <div>
            <p>{level}</p>
          </div>
        </div>
        <div className="challenge-title">
          <div>
            <span>문제 이름</span>
          </div>
          <div>
            <p>{challengeDetail.title}</p>
          </div>
        </div>
        <div className="challenge-desc">
          <div>
            <span>문제 설명</span>
          </div>
          <div>
            <p>{challengeDetail.description}</p>
          </div>
        </div>
        <div className="challenge-condition">
          <div>
            <span>조건</span>
          </div>
          <div>
            <p>{challengeDetail.cond}</p>
          </div>
          <div className="challenge-limit">
            <div>
              <span>시스템 제한사항</span>
            </div>
            <div>
              <p>{challengeDetail.limits}</p>
            </div>
          </div>
        </div>
        <div className="challenge-io-example">
          <div>
            <span>정답 예시</span>
          </div>
          <div>
            <table>{challengeIoExamples[challengeId as keyof ChallengeExample]}</table>
          </div>
        </div>
      </CssWrapper>
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
    </>
  );
};

export default CodeChallengeInfo;
