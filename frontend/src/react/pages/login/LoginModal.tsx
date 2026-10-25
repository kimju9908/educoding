import React, { JSX, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { TextField, Checkbox, Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { AxiosError } from 'axios';

import LoginApi from '../../../api/AxiosApi/LoginApi/LoginApi';
import { UserLogin } from '../../../api/AxiosApi/LoginApi/LoginApiTypes';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks/reduxHooks';
import { setLoginData, setError } from '../../../redux/slice/authSlice';
import { closeLoginModal } from '../../../redux/slice/LoginModalSlice';
import { setLoginCondition } from '../../../redux/slice/loginSlice';
import Common from '../../../util/Common';
import {
  FloatingLeftContainer,
  FloatingLeftLoginContainer,
  FloatingLeftLoginExtra,
  FloatingLeftExtraAutoLoginBox,
  FloatingLeftExtraFindAccountBox,
  FloatingLeftExtraText,
  FloatingLeftExtraRightText,
  FloatingLeftSignupArea,
  FloatingLeftSignupLeftText,
  FloatingLeftSignupRightText,
  FloatingLeftSNSContainer,
  FloatingLeftSNSText,
  FloatingLeftSNSIconContainer,
  FloatingLeftSNSEachIcon,
} from '../../styles/login/login';

// 로그인 페이지였던 걸 전역 모달로 바꾼 것 -- Layout.tsx에서 한 번만 렌더링되고,
// navigate('/login') 하던 곳들은 전부 dispatch(openLoginModal())로 바뀐다.
// 오른쪽의 "Welcome to educoding!" 홍보 문구 패널은 모달에선 생략하고 로그인 폼만 둔다.
const LoginModal = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.loginModal.isOpen);
  const prefillEmail = useAppSelector((state) => state.loginModal.prefillEmail);

  const [inputEmail, setInputEmail] = useState<string>('');
  const [inputPw, setInputPw] = useState<string>('');
  const [isId, setIsId] = useState<boolean>(false);
  const [isPw, setIsPw] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCheckedAutoLogin, setIsCheckedAutoLogin] = useState<boolean>(false);

  // 모달이 열릴 때마다 (회원가입 직후 prefillEmail이 있으면) 입력값 초기화
  const onEnter = (): void => {
    setInputEmail(prefillEmail);
    setIsId(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(prefillEmail));
    setInputPw('');
    setIsPw(false);
    setIsCheckedAutoLogin(false);
  };

  const handleClose = (): void => {
    dispatch(closeLoginModal());
  };

  const goTo = (path: string): void => {
    handleClose();
    navigate(path);
  };

  const handleInputIdChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setInputEmail(e.target.value);
    setIsId(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim()));
  };
  const handleInputPwChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setInputPw(e.target.value);
    setIsPw(e.target.value.length >= 5);
  };

  const handleCheckAutoLoginBox = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setIsCheckedAutoLogin(e.target.checked);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const request: UserLogin = { email: inputEmail.trim(), password: inputPw };
      const response = await LoginApi.login(request);

      if (response.data.grantType === 'Bearer') {
        const nickname = Common.getNewNickname(response.data.accessToken);
        const keynumber = Common.getNewUserKeyNumber(response.data.accessToken);
        const accesstokenexpiresin = Common.getNewAccessTokenExpiresIn(response.data.accessToken);
        const authortiy = Common.getNewAuthority(response.data.accessToken);
        const profile = response.data.profileUrl;
        const registeredAt = response.data.registeredAt;

        dispatch(
          setLoginData({
            keynumber: keynumber,
            nickname: nickname,
            authority: authortiy,
            accesstoken: response.data.accessToken,
            accesstokenexpiresin: accesstokenexpiresin,
            profile: profile,
            registeredAt: registeredAt,
          }),
        );
        dispatch(
          setLoginCondition({
            autologin: isCheckedAutoLogin,
          }),
        );

        handleClose(); // 페이지 이동 없이 모달만 닫고 보던 화면에 그대로 머무름
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = (error.response?.data as { message?: string } | undefined)?.message;
        setDialogMessage(
          error.response ? (message ?? '로그인에 실패했습니다.') : '서버가 응답하지 않습니다.',
        );
        setDialogOpen(true);
      }
      dispatch(setError(error || 'Login Failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginTextFieldStyles = {
    fontFamily: 'bold,sans-serif',
    fontSize: '14px',
    '& .MuiInputLabel-root': {
      fontFamily: 'bold,sans-serif',
      fontSize: '14px',
    },
    '& .MuiOutlinedInput-root': {
      fontFamily: 'bold,sans-serif',
      fontSize: '14px',
    },
  };

  const loginButtonStyles = {
    fontFamily: 'bold, sans-serif',
    fontSize: '14px',
    height: '53.13px',
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        TransitionProps={{ onEnter }}
        PaperProps={{ sx: { borderRadius: '8px', overflow: 'visible', backgroundColor: '#121212' } }}
      >
        <FloatingLeftContainer style={{ height: 'auto', padding: '40px 0' }}>
          <FloatingLeftLoginContainer>
            <TextField
              label="이메일"
              type="email"
              variant="outlined"
              color="secondary"
              value={inputEmail}
              onChange={(e) => handleInputIdChange(e)}
              autoComplete="email"
              sx={loginTextFieldStyles}
            />
            <TextField
              label="비밀번호"
              variant="outlined"
              color="secondary"
              value={inputPw}
              onChange={(e) => handleInputPwChange(e)}
              type="password"
              sx={loginTextFieldStyles}
            />
            <FloatingLeftLoginExtra>
              <FloatingLeftExtraAutoLoginBox>
                <Checkbox
                  size="small"
                  color="secondary"
                  id="autologin"
                  checked={isCheckedAutoLogin}
                  onChange={handleCheckAutoLoginBox}
                  sx={{ padding: '0' }}
                />
                <FloatingLeftExtraText
                  onClick={() => setIsCheckedAutoLogin((prev) => !prev)}
                  style={{ cursor: 'pointer' }}
                >
                  자동로그인
                </FloatingLeftExtraText>
              </FloatingLeftExtraAutoLoginBox>
              <FloatingLeftExtraFindAccountBox>
                <FloatingLeftExtraRightText onClick={() => goTo('/findpw')}>
                  비밀번호 재설정
                </FloatingLeftExtraRightText>
              </FloatingLeftExtraFindAccountBox>
            </FloatingLeftLoginExtra>
            {isId && isPw ? (
              <Button
                variant="contained"
                color="secondary"
                sx={loginButtonStyles}
                onClick={handleSubmit}
              >
                로그인
              </Button>
            ) : (
              <Button variant="outlined" color="secondary" sx={loginButtonStyles} disabled>
                로그인
              </Button>
            )}
            <FloatingLeftSignupArea>
              <FloatingLeftSignupLeftText>계정이 없으신가요?</FloatingLeftSignupLeftText>
              <FloatingLeftSignupRightText onClick={() => goTo('/signup')}>
                회원가입
              </FloatingLeftSignupRightText>
            </FloatingLeftSignupArea>
          </FloatingLeftLoginContainer>
          <FloatingLeftSNSContainer>
            <FloatingLeftSNSText>다른 방법으로 로그인</FloatingLeftSNSText>
            <FloatingLeftSNSIconContainer>
              <FloatingLeftSNSEachIcon
                style={{ backgroundImage: 'url(/images/sns/google_b.png)' }}
              />
              <FloatingLeftSNSEachIcon style={{ backgroundImage: 'url(/images/sns/kakao_b.png)' }} />
              <FloatingLeftSNSEachIcon style={{ backgroundImage: 'url(/images/sns/naver_b.png)' }} />
            </FloatingLeftSNSIconContainer>
          </FloatingLeftSNSContainer>
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              fontSize: 11,
              color: 'var(--educoding-muted, #9ca3af)',
            }}
          >
            <span style={{ cursor: 'pointer' }} onClick={() => goTo('/legal/Terms')}>
              서비스 이용약관
            </span>
            <span style={{ cursor: 'pointer' }} onClick={() => goTo('/legal/Privacy')}>
              개인정보 처리방침
            </span>
          </div>
        </FloatingLeftContainer>
      </Dialog>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            fontFamily: 'regular',
            minWidth: '400px',
            maxWidth: '500px',
          },
        }}
      >
        <DialogContent
          sx={{
            fontFamily: 'bold',
            fontSize: '14px',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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

export default LoginModal;
