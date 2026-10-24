import { JSX, useLayoutEffect, useState } from 'react';

import { useNavigate, useOutletContext } from 'react-router-dom';

import { Button, Checkbox, Dialog, DialogActions, DialogContent } from '@mui/material';

import MyPageApi from '../../../../../api/AxiosApi/MyPageApi/MyPageApi';
import { useAppDispatch } from '../../../../../redux/hooks/reduxHooks';
import { logoutAuth } from '../../../../../redux/slice/authSlice';
import { logoutCondition } from '../../../../../redux/slice/loginSlice';
import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  PageSubTitleBar,
} from '../../../../styles/mypage/MyPage_Main';
import {
  RightContainerEach,
  RightContentsContainer,
  WithdrawalHeadline,
  WithdrawalText,
  CheckBoxGroup,
  ContentsCheckText,
  WithdrawnContainer,
  WithdrawnHeadline,
  WithdrawnText,
} from '../../../../styles/mypage/MyPage_Withdrawal';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';
import { OutletContextType } from '../../MyPageType';

const MyPage_Withdrawal = (): JSX.Element => {
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const mainContentRef = useOutletContext<OutletContextType>();
  const [isWithdrawn, setIsWithdrawn] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setIsChecked(event.target.checked);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const handleWithdrawal = (): void => {
    setDialogMessage('정말로 탈퇴하시겠습니까?'); // 다이얼로그 메시지 설정
    setDialogOpen(true); // 다이얼로그 열기
  };

  const handleConfirmWithdrawal = async (): Promise<void> => {
    setIsProcessing(true); // 요청 중 상태 설정
    try {
      // 탈퇴 API 요청
      await handleDeRegister();
      setIsWithdrawn(true);
      setDialogMessage('탈퇴가 완료되었습니다.');
    } catch (error) {
      console.error('탈퇴 실패', error);
      setDialogMessage('탈퇴에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false); // 요청 완료 상태 설정
    }
  };

  const handleDeRegister = async (): Promise<void> => {
    try {
      const response = await MyPageApi.deRegister();
      if (response.data) {
        dispatch(logoutAuth()); // 로그아웃 처리
        dispatch(logoutCondition()); // 상태 변경
      }
    } catch (error) {
      console.error('에러 발생', error);
      throw new Error('탈퇴 실패');
    }
  };

  return (
    <>
      <Wrap>
        {isWithdrawn ? ( // 탈퇴 완료 상태일 경우 다른 메시지 표시
          <>
            <WithdrawnContainer>
              <WithdrawnHeadline>회원 탈퇴 완료</WithdrawnHeadline>
              <WithdrawnText>
                회원 탈퇴가 완료되었습니다. <br />
                그동안 educoding 서비스를 이용해 주셔서 감사합니다.
              </WithdrawnText>
              <Button
                onClick={() => navigate('/')}
                variant="contained"
                color="secondary"
                sx={{
                  fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                  fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                  color: 'white',
                  padding: '10px 20px',
                }}
              >
                메인으로
              </Button>
            </WithdrawnContainer>
          </>
        ) : (
          <>
            <Container>
              <LeftContainer>
                <LeftTopProfile />
                <LeftMenus />
              </LeftContainer>
              <RightContainer>
                <PageTitleBar>내 프로필</PageTitleBar>
                <PageSubTitleBar>회원 탈퇴</PageSubTitleBar>
                <RightContainerEach>
                  <RightContentsContainer>
                    <WithdrawalHeadline>
                      회원 탈퇴 전, 다음 내용을 꼭 확인해주세요.
                    </WithdrawalHeadline>
                    <WithdrawalText>
                      · 고객 정보 및 개인형 서비스 이용 기록은 개인정보 처리방침에 따라 삭제됩니다.
                      <br />
                      · 회원 탈퇴 후에는 회원님의 개인정보를 복원할 수 없으며, 해당 아이디는 영구
                      삭제되어 재가입이 불가합니다.
                      <br />· 회원 탈퇴 후에도 작성하신 게시물은 삭제되지 않으니, 한번 더 확인하시기
                      바랍니다.
                    </WithdrawalText>
                    <CheckBoxGroup>
                      <Checkbox
                        color="secondary"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                      />
                      <ContentsCheckText>
                        안내 사항을 모두 확인하였으며, 이에 동의합니다.
                      </ContentsCheckText>
                    </CheckBoxGroup>
                    <Button
                      disabled={!isChecked}
                      onClick={() => {
                        handleWithdrawal();
                      }}
                      variant="contained"
                      color="secondary"
                      sx={{
                        fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                        fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                        color: 'white',
                        padding: '10px 20px',
                      }}
                    >
                      educoding 회원 탈퇴
                    </Button>
                  </RightContentsContainer>
                </RightContainerEach>
              </RightContainer>
            </Container>
          </>
        )}
      </Wrap>
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
            취소
          </Button>
          {dialogMessage === '정말로 탈퇴하시겠습니까?' && (
            <Button
              sx={{ fontFamily: 'bold' }}
              color="secondary"
              onClick={() => {
                handleDialogClose();
                handleConfirmWithdrawal();
              }}
              disabled={isProcessing}
            >
              {isProcessing ? '탈퇴 중' : '확인'}
            </Button>
          )}
          {dialogMessage === '탈퇴에 실패했습니다. 다시 시도해주세요.' && (
            <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleDialogClose}>
              닫기
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyPage_Withdrawal;
