import { JSX, useEffect, useState } from 'react';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
} from '@mui/material';

import {
  RightContainerEach,
  RightContentsContainer,
  AlertTitle,
  AlertText,
  RightAlertContentsEach1,
  RightAlertContentsEach2,
  RightAlertContentsInner,
} from '../../../../styles/mypage/MyPage_Account';
import AlertSwtich from '../AlertSwitch';

const AccountManager_Alert = (): JSX.Element => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>('');

  // 알림 상태 localstorage에 저장
  const getStoredState = (key: string, defaultValue: boolean): boolean => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  };
  const [commentAlert, setCommentAlert] = useState<boolean>(() =>
    getStoredState('commentAlert', false),
  );
  const [marketingAlert, setMarketingAlert] = useState<boolean>(() =>
    getStoredState('marketingAlert', false),
  );
  useEffect(() => {
    localStorage.setItem('commentAlert', JSON.stringify(commentAlert));
  }, [commentAlert]);
  useEffect(() => {
    localStorage.setItem('marketingAlert', JSON.stringify(marketingAlert));
  }, [marketingAlert]);

  const handleCommentAlert = (_event: React.SyntheticEvent, checked: boolean): void => {
    setCommentAlert(checked); // event에서 checked 값 가져오기
    setDialogMessage(`댓글 알림이 ${checked ? '설정되었습니다' : '해제되었습니다'}.`);
    setOpenDialog(true);
  };

  const handleMarketingAlert = (_event: React.SyntheticEvent, checked: boolean): void => {
    setMarketingAlert(checked);
    setDialogMessage(`마케팅 알림이 ${checked ? '설정되었습니다' : '해제되었습니다'}.`);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <RightContainerEach>
        <RightContentsContainer>
          <RightAlertContentsEach1>
            <RightAlertContentsInner>
              <AlertTitle>댓글 알림</AlertTitle>
              <AlertText>내 질문에 댓글이 등록되면 알림을 받겠습니다.</AlertText>
            </RightAlertContentsInner>
            <AlertSwtich checked={commentAlert} onChange={handleCommentAlert} />
          </RightAlertContentsEach1>
          <RightAlertContentsEach2>
            <RightAlertContentsInner>
              <AlertTitle>마케팅 활용 동의 및 광고 수신 동의</AlertTitle>
              <AlertText>
                강의 오픈, 신규 테스트 등록, 각종 이벤트, 회원 혜택 등 educoding 마케팅 알림을
                받겠습니다.
              </AlertText>
            </RightAlertContentsInner>
            <AlertSwtich checked={marketingAlert} onChange={handleMarketingAlert} />
          </RightAlertContentsEach2>
        </RightContentsContainer>
      </RightContainerEach>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
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
          <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleCloseDialog}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountManager_Alert;
