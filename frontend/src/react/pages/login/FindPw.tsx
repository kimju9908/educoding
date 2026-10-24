import React, { useEffect, useState, useRef, JSX } from 'react';

import { useNavigate } from 'react-router-dom';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import {
  Button,
  TextField,
  IconButton,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import type {
  ResetPassword,
  ValidateNewPassword,
  VerifySecurity,
} from '../../../api/AxiosApi/LoginApi/LoginApiTypes';
import type { CheckResponse } from '../../../types/CommonTypes';

import LoginApi from '../../../api/AxiosApi/LoginApi/LoginApi';
import { useAppDispatch } from '../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../redux/slice/LoginModalSlice';
import {
  emailAvailable,
  isBlank,
  isPwContainsCharacter,
  isPwContainsNumber,
  isPwContainsSpecialCharacter,
  isPwTooLong,
  isPwTooShort,
  pwAvailable,
} from '../../../util/signup/Validation';
import {
  Wrap,
  FloatingOuter,
  FloatingLeftContainer,
  FloatingLeftResetContainer,
  BodyContainer,
  FloatingRightContainer,
  FloatingRightTitle,
  FloatingRightText,
  BottomNoticeContainer,
  BottomNoticeText,
} from '../../styles/login/FindPw';

const FindPw = (): JSX.Element => {
  const [inputEmail, setInputEmail] = useState<string>('');
  const [isEmail, setIsEmail] = useState<boolean>(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean>(true);
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [inputSecurity, setInputSecurity] = useState<string>('');
  const [isSecurity, setIsSecurity] = useState<boolean>(false);
  const [securityMessage, setSecurityMessage] = useState<string>('');
  const [isSecurityAvailable, setIsSecurityAvailable] = useState<boolean>(false);
  const [inputPw, setInputPw] = useState<string>('');
  const [pwMessage, setPwMessage] = useState<string>('');
  const [inputConPw, setInputConPw] = useState<string>('');
  const [conPwMessage, setConPwMessage] = useState<string>('');
  const [isPw, setIsPw] = useState<boolean>(false);
  const [isConPw, setIsConPw] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 타이머 설정
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timeLeftRef = useRef<number>(180);

  const [isVisiblePwd, setIsVisiblePwd] = useState<boolean>(false);
  const [isVisibleConPwd, setIsVisibleConPwd] = useState<boolean>(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const toggleVisiblePwd = (): void => {
    setIsVisiblePwd(!isVisiblePwd);
  };
  const toggleVisibleConPwd = (): void => {
    setIsVisibleConPwd(!isVisibleConPwd);
  };

  async function verifyemail(email: string): Promise<CheckResponse | null> {
    try {
      const response = await LoginApi.findpw(email);
      return response.data;
    } catch (error) {
      console.error('에러 발생', error);

      setEmailMessage('등록된 이메일이 없습니다.');
      setIsEmail(false);
      return null;
    }
  }

  async function verifysecurity(request: VerifySecurity): Promise<CheckResponse | null> {
    try {
      const response = await LoginApi.verifypwsecurity(request);

      return response.data;
    } catch (error) {
      console.error('에러 발생', error);
      setSecurityMessage('인증번호가 일치하지 않습니다.');
      // 인증 번호 유효시간 등에 대한 에러 처리를 위해서는 구분이 필요함
      setIsSecurity(false);
      return null;
    }
  }

  async function validatenewpw(params: ValidateNewPassword): Promise<CheckResponse | null> {
    try {
      const response = await LoginApi.validatenewpassword(params);

      return response.data;
    } catch (error) {
      console.error('에러 발생', error);
      setPwMessage('새 비밀번호 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsPw(false);
      return null;
    }
  }

  async function resetpw(request: ResetPassword): Promise<CheckResponse | null> {
    try {
      const response = await LoginApi.resetpassword(request);

      return response.data;
    } catch (error) {
      console.error('에러 발생', error);
      setConPwMessage('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
      return null;
    }
  }

  // 타이머 업데이트 함수 (정확한 1초 단위 실행)
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(interval);
        stopTimer();
        return;
      }
      if (!isEmail) {
        clearInterval(interval);
        resetTimer();
        return;
      }
    }, 1000);

    return (): void => clearInterval(interval); // 기존 타이머 정리
  }, [isRunning, isEmail]); // 타이머 상태가 변경될 때만 실행

  const startTimer = (): void => {
    timeLeftRef.current = 180;
    setTimeLeft(180);
    setIsRunning(true);
  };
  const resetTimer = (): void => {
    timeLeftRef.current = 0;
    setTimeLeft(0);
    setEmailMessage('새로운 이메일을 입력해주세요.');
    setIsRunning(false);
    setIsSecurityAvailable(false);
    setIsLoading(false);
  };

  const stopTimer = (): void => {
    timeLeftRef.current = 0;
    setTimeLeft(0);
    setEmailMessage('요청시간이 지났습니다. 다시 시도해주세요.');
    setIsRunning(false);
    setIsSecurityAvailable(false);
    setIsLoading(false);
  };

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setInputEmail(e.target.value);
    const currentValue = e.target.value;
    if (emailAvailable(currentValue)) {
      setEmailMessage('');
      setIsEmail(true);
    } else {
      setIsEmail(false);
    }
  };
  const onBlurEmail = (): void => {
    const currentValue = inputEmail;
    if (isBlank(currentValue)) {
      setEmailMessage('비밀번호를 재설정하기 위해서는 이메일 인증이 필요합니다.');
      setIsEmail(false);
      return;
    }
    if (!emailAvailable(currentValue)) {
      setEmailMessage('이메일 형식이 올바르지 않습니다.');
      setIsEmail(false);
      return;
    }
    setIsEmail(true);
  };

  const onClickFindPw = async (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    setIsRunning(false);
    setIsLoading(true);
    setIsSubmitting(true);
    const currentValue = inputEmail;
    try {
      const emailExist = await verifyemail(currentValue);
      if (emailExist) {
        setEmailMessage('');
        setSecurityMessage('');
        setIsSecurityAvailable(true);
        startTimer();
      } else {
        setEmailMessage('등록된 이메일이 없습니다.');
        setIsEmail(false);
      }
    } catch (error) {
      console.error('에러 발생', error);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const onChangeSecurity = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputSecurity(e.target.value);
  };

  const onClickVerifySecurity = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    const currentValue = inputSecurity;
    const request: VerifySecurity = { otp: Number(currentValue), email: inputEmail };
    try {
      const otpAvailable = await verifysecurity(request);
      if (!otpAvailable) {
        setSecurityMessage('인증번호가 일치하지 않습니다.');
        setIsSecurity(false);
      } else {
        setEmailMessage('');
        setSecurityMessage('');
        setIsSecurity(true);
        setIsRunning(false);
        setIsSecurityAvailable(false);
        setIsEmailAvailable(false);
      }
    } catch (error) {
      console.error('에러 발생', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const onChangePw = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputPw(e.target.value);
    const currentValue = e.target.value;
    if (pwAvailable(currentValue)) {
      setPwMessage('');
      setIsPw(true);
    } else {
      setIsPw(false);
    }
  };
  const onBlurPw = async (): Promise<void> => {
    const currentValuePw = inputPw;
    const currentValueEmail = inputEmail;
    if (isBlank(currentValuePw)) {
      setPwMessage('비밀번호는 필수 입력 정보입니다.');
      setIsPw(false);
      return;
    }
    if (!isPwContainsCharacter(currentValuePw)) {
      setPwMessage('비밀번호는 1개 이상의 영문자를 포함해야 합니다.');
      setIsPw(false);
      return;
    }
    if (!isPwContainsNumber(currentValuePw)) {
      setPwMessage('비밀번호는 1개 이상의 숫자를 포함해야 합니다.');
      setIsPw(false);
      return;
    }
    if (!isPwContainsSpecialCharacter(currentValuePw)) {
      setPwMessage('비밀번호는 1개 이상의 특수문자를 포함해야 합니다.');
      setIsPw(false);
      return;
    }
    if (isPwTooLong(currentValuePw)) {
      setPwMessage('비밀번호는 20자 이하 8자 이상이어야 합니다.');
      setIsPw(false);
      return;
    }
    if (isPwTooShort(currentValuePw)) {
      setPwMessage('비밀번호는 8자 이상 20자 이하이어야 합니다.');
      setIsPw(false);
      return;
    }
    setPwMessage('');
    setIsPw(true);

    try {
      const params: ValidateNewPassword = { email: currentValueEmail, newpassword: currentValuePw };
      const newPwAvailable = await validatenewpw(params);
      if (newPwAvailable) {
        setPwMessage('');
        setIsPw(true);
      } else {
        setPwMessage('동일한 비밀번호를 사용할 수 없습니다.');
        setIsPw(false);
      }
    } catch (error) {
      console.error('에러 발생', error);
      setPwMessage('새 비밀번호 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsPw(false);
    }
  };
  const onChangeConPw = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputConPw(e.target.value);
    const currentValue = e.target.value;
    if (currentValue === inputPw) {
      setConPwMessage('');
      setIsConPw(true);
    } else {
      setIsConPw(false);
    }
  };
  const onBlurConPw = (): void => {
    const currentValue = inputConPw;
    if (isBlank(inputPw)) {
      setConPwMessage('비밀번호 입력이 필요합니다.');
      setIsConPw(false);
      return;
    }
    if (isBlank(currentValue)) {
      setConPwMessage('비밀번호 확인이 필요합니다.');
      setIsConPw(false);
      return;
    }
    if (currentValue !== inputPw) {
      setConPwMessage('비밀번호가 일치하지 않습니다.');
      setIsConPw(false);
      return;
    }
    setConPwMessage('');
    setIsConPw(true);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const onClickResetPw = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      const email = inputEmail.trim().replace(/\s+/g, '');
      const newPw = inputPw.trim().replace(/\s+/g, '');
      const request: ResetPassword = { email: email, newpassword: newPw };
      const resetPassword = await resetpw(request);

      if (resetPassword) {
        setDialogMessage('비밀번호 변경에 성공했습니다.');
        setDialogOpen(true);
        dispatch(openLoginModal());
        navigate('/');
      } else {
        setDialogMessage('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('에러 발생', error);
      setDialogMessage('서버가 응답하지 않습니다.');
      setDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Wrap>
        <BodyContainer>
          <FloatingOuter>
            <FloatingLeftContainer>
              <FloatingLeftResetContainer isSecurityAvailable={isSecurityAvailable}>
                {isEmailAvailable ? (
                  <TextField
                    label="이메일"
                    variant="outlined"
                    color="secondary"
                    type="email"
                    value={inputEmail}
                    onChange={onChangeEmail}
                    onBlur={onBlurEmail}
                    error={!isEmail && emailMessage !== ''}
                    helperText={!isEmail ? emailMessage : ''}
                    autoComplete="off"
                    sx={{
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
                      '& .MuiFormHelperText-root': {
                        fontFamily: 'bold,sans-serif',
                        fontSize: '12px',
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {isEmail &&
                          isEmailAvailable &&
                          isSecurityAvailable &&
                          isRunning &&
                          !isLoading ? (
                            <>
                              <div style={{ marginRight: 8, fontSize: '14px' }}>
                                {Math.floor(timeLeft / 60)}:
                                {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
                              </div>
                              <IconButton onClick={onClickFindPw} color="secondary" edge="end">
                                <RefreshIcon />
                              </IconButton>
                            </>
                          ) : isLoading ? (
                            <CircularProgress size={15} color="secondary" />
                          ) : (
                            <IconButton
                              onClick={onClickFindPw}
                              color="secondary"
                              edge="end"
                              disabled={!inputEmail}
                            >
                              <SendIcon />
                            </IconButton>
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                ) : (
                  <>
                    {/* 비밀번호 입력 */}
                    <TextField
                      label="비밀번호"
                      variant="outlined"
                      color="secondary"
                      type={isVisiblePwd ? 'text' : 'password'}
                      placeholder="영문자, 숫자, 특수문자 포함 8~20자"
                      value={inputPw}
                      onChange={onChangePw}
                      onBlur={onBlurPw}
                      error={!isPw && pwMessage !== ''}
                      helperText={!isPw ? pwMessage : ''}
                      sx={{
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
                        '& .MuiFormHelperText-root': {
                          fontFamily: 'bold,sans-serif',
                          fontSize: '12px',
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton color="secondary" onClick={toggleVisiblePwd}>
                              {isVisiblePwd ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* 비밀번호 확인 */}
                    <TextField
                      label="비밀번호 확인"
                      variant="outlined"
                      color="secondary"
                      type={isVisibleConPwd ? 'text' : 'password'}
                      placeholder="비밀번호 확인"
                      value={inputConPw}
                      onChange={onChangeConPw}
                      onBlur={onBlurConPw}
                      error={!isConPw && conPwMessage !== ''}
                      helperText={!isConPw ? conPwMessage : ''}
                      autoComplete="off"
                      sx={{
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
                        '& .MuiFormHelperText-root': {
                          fontFamily: 'bold,sans-serif',
                          fontSize: '12px',
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton color="secondary" onClick={toggleVisibleConPwd}>
                              {isVisibleConPwd ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                )}

                {isSecurityAvailable ? (
                  <TextField
                    label="인증번호 입력"
                    variant="outlined"
                    color="secondary"
                    type="text"
                    value={inputSecurity}
                    onChange={onChangeSecurity}
                    error={!!securityMessage} // 인증 메시지가 있을 경우 에러 처리
                    helperText={securityMessage || ''} // 인증 메시지가 있을 경우 표시
                    autoComplete="off"
                    sx={{
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
                      '& .MuiFormHelperText-root': {
                        fontFamily: 'bold,sans-serif',
                        fontSize: '12px',
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={onClickVerifySecurity}
                            color="secondary"
                            disabled={!inputSecurity} // 입력값이 없으면 버튼 비활성화
                          >
                            <CheckIcon /> {/* 체크 아이콘 */}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                ) : null}

                {isEmail && isSecurity && inputPw && inputConPw ? (
                  <>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{ fontFamily: 'bold, sans-serif', fontSize: '14px', height: '53.13px' }}
                      onClick={onClickResetPw}
                    >
                      비밀번호 재설정
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{ fontFamily: 'bold, sans-serif', fontSize: '14px', height: '53.13px' }}
                      onClick={() => {
                        dispatch(openLoginModal());
                        navigate('/');
                      }}
                    >
                      뒤로가기
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{ fontFamily: 'bold, sans-serif', fontSize: '14px', height: '53.13px' }}
                      disabled
                    >
                      비밀번호 재설정
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{ fontFamily: 'bold, sans-serif', fontSize: '14px', height: '53.13px' }}
                      onClick={() => {
                        dispatch(openLoginModal());
                        navigate('/');
                      }}
                    >
                      뒤로가기
                    </Button>
                  </>
                )}

                {/* {isEmailAvailable ? (
                  <>
                    <Input
                      autoComplete="off"
                      placeholder="등록한 이메일 주소 입력"
                      icon="/images/icon/mail.png"
                      value={inputEmail}
                      isEmail={isEmail}
                      isEmailAvailable={isEmailAvailable}
                      isLoading={isLoading}
                      onChange={(e) => onChangeEmail(e)}
                      onBlur={() => onBlurEmail()}
                    ></Input>
                    
                    {isEmail &&
                    isEmailAvailable &&
                    !isSecurity &&
                    !isSecurityAvailable &&
                    !isLoading ? (
                      <FindPwButton isEmail={isEmail} onClick={(e) => onClickFindPw(e)}>
                        인증번호 받기
                      </FindPwButton>
                    ) : isEmail && isEmailAvailable && !isRunning && isLoading ? (
                      <FindPwButtonDiv>
                        <RotatingLines
                          visible={true}
                          width="30"
                          strokeColor="black"
                          strokeWidth="5"
                          animationDuration="0.75"
                          ariaLabel="rotating-lines-loading"
                        />
                      </FindPwButtonDiv>
                    ) : (
                      isEmail &&
                      isEmailAvailable &&
                      isSecurityAvailable &&
                      isRunning &&
                      !isLoading && (
                        <FindPwButtonDiv>
                          <FindPwButtonTimer>
                            {Math.floor(timeLeft / 60)}:
                            {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
                          </FindPwButtonTimer>
                          <FindPwButtonRefresh
                            onClick={(e) => {
                              onClickFindPw(e);
                            }}
                          ></FindPwButtonRefresh>
                        </FindPwButtonDiv>
                      )
                    )}
                    <ValidEmailMessage isEmail={isEmail}>{emailMessage}</ValidEmailMessage>
                  </>
                ) : (
                  <>
                    <InputEach>
                      <InputIndex>비밀번호 변경</InputIndex>
                      <InputPwDiv>
                        <InputPw
                          type={isVisiblePwd ? 'text' : 'password'}
                          placeholder="영문자, 숫자, 특수문자 포함 8~20자"
                          value={inputPw}
                          onChange={onChangePw}
                          onBlur={() => {
                            onBlurPw();
                            onBlurConPw();
                          }}
                          isPw={isPw}
                        ></InputPw>
                        <InputPwDivToggle
                          isVisible={isVisiblePwd}
                          onClick={() => toggleVisiblePwd()}
                        />
                      </InputPwDiv>
                      <ValidPwMessage>{pwMessage}</ValidPwMessage>
                    </InputEach>
                    <InputEach>
                      <InputPwDiv>
                        <InputPwConfirm
                          type={isVisibleConPwd ? 'text' : 'password'}
                          placeholder="비밀번호 확인"
                          value={inputConPw}
                          onChange={onChangeConPw}
                          onBlur={() => {
                            onBlurConPw();
                            onBlurPw();
                          }}
                          isConPw={isConPw}
                        ></InputPwConfirm>
                        <InputPwDivToggle
                          isVisible={isVisibleConPwd}
                          onClick={() => toggleVisibleConPwd()}
                        />
                      </InputPwDiv>
                      <ValidPwMessage>{conPwMessage}</ValidPwMessage>
                    </InputEach>
                  </>
                )}
                {isSecurityAvailable ? (
                  <>
                    <InputDiv>
                      <InputSecurity
                        autoComplete="off"
                        placeholder="인증번호 입력"
                        icon="/images/icon/mail.png"
                        onChange={onChangeSecurity}
                      ></InputSecurity>
                      <SecurityButton
                        isSecurity={isSecurity}
                        onClick={(e) => {
                          onClickVerifySecurity(e);
                        }}
                      >
                        이메일 인증
                      </SecurityButton>
                    </InputDiv>
                    <ValidSecurityMessage>{securityMessage}</ValidSecurityMessage>
                  </>
                ) : null}
                {isEmail && isSecurity && isPw && isConPw ? (
                  <ModifyPw onClick={(e) => onClickResetPw(e)}>비밀번호 재설정하기</ModifyPw>
                ) : (
                  <ModifyPw disabled>비밀번호 재설정하기</ModifyPw>
                )} */}
              </FloatingLeftResetContainer>
            </FloatingLeftContainer>
            <FloatingRightContainer>
              <FloatingRightTitle>Welcome to educoding!</FloatingRightTitle>
              <FloatingRightText>
                개발자의, 개발자에 의한, 개발자를 위한 공간!
                <br />
                educoding에서는 지식이 자산이 되고, 경험이 힘이 됩니다.
                <br />
                코드 한 줄이 혁신이 되고, 아이디어가 현실이 되는 곳!
                <br />
                지금 바로 로그인하고, 개발의 무한한 가능성을 열어보세요.
              </FloatingRightText>
            </FloatingRightContainer>
          </FloatingOuter>
          <BottomNoticeContainer>
            <BottomNoticeText onClick={() => navigate('/legal/Terms')}>
              서비스 이용약관
            </BottomNoticeText>
            <BottomNoticeText onClick={() => navigate('/legal/Privacy')}>
              개인정보 처리방침
            </BottomNoticeText>
          </BottomNoticeContainer>
        </BodyContainer>
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
          {dialogMessage === '비밀번호 변경에 성공했습니다.' ? (
            <>
              <Button
                sx={{ fontFamily: 'bold' }}
                color="secondary"
                onClick={() => {
                        dispatch(openLoginModal());
                        navigate('/');
                      }}
              >
                로그인
              </Button>
            </>
          ) : (
            <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleDialogClose}>
              닫기
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
export default FindPw;
