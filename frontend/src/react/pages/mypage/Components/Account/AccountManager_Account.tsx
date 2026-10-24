import { JSX, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { ZodError } from 'zod';

import MyPageApi from '../../../../../api/AxiosApi/MyPageApi/MyPageApi';
import { useAppDispatch } from '../../../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../../../redux/slice/LoginModalSlice';
import { CheckResponse } from '../../../../../types/CommonTypes';
import {
  RightContainerEach,
  RightContentsContainer,
  AccountEachContainer,
  InputContainer,
} from '../../../../styles/mypage/MyPage_Account';

const AccountManager_Account = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [currentPw, setCurrentPw] = useState<string>(''); // 현재 비밀번호 입력
  const [newPw, setNewPw] = useState<string>(''); // 새로운 비밀번호 입력
  const [message, setMessage] = useState<string>(''); // 메시지 상태 추가
  const [isPwVerified, setIsPwVerified] = useState<boolean>(false); // 현재 비밀번호 확인 여부
  const [currentPwError, setCurrentPwError] = useState<boolean>(false); // 현재 비밀번호 오류 상태
  const [newPwError, setNewPwError] = useState<boolean>(false); // 새 비밀번호 오류 상태

  const { data, error } = useQuery({
    queryKey: ['myprofile'],
    queryFn: MyPageApi.getmyprofile,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error instanceof ZodError) {
      console.warn('Zod 에러 감지', error.format());
      alert('잘못된 접근입니다.');
      dispatch(openLoginModal());
      navigate('/', { replace: true });
    }
  }, [error, navigate, dispatch]);

  // const usePasswordCheck = (): UseMutationResult<AxiosResponse<CheckResponse>, Error, string> => {
  //   return useMutation({
  //     mutationFn: async (currentPw: string) => {
  //       return MyPageApi.checkCurrentPassword(currentPw || '');
  //     },
  //     onSuccess: (response) => {
  //       const isValid = response.data;
  //       if (isValid) {
  //         setIsPwVerified(true);
  //         setMessage('비밀번호가 확인되었습니다. 새 비밀번호를 입력하세요.');
  //         setCurrentPwError(false);
  //       } else {
  //         setIsPwVerified(false);
  //         setMessage('현재 비밀번호가 일치하지 않습니다.');
  //         setCurrentPwError(true);
  //       }
  //     },
  //     onError: (error) => {
  //       console.error('에러 발생', error);
  //       setMessage('비밀번호 확인 중 오류가 발생했습니다.');
  //     },
  //   });
  // };

  // const mutation = usePasswordCheck();

  // const handleCheck = (): void => {
  //   mutation.mutate(currentPw);
  // };

  // 현재 비밀번호 확인 요청 (checkCurrentPassword API 호출)
  const handlePasswordCheck = async (): Promise<void> => {
    try {
      const isMatch = await MyPageApi.checkCurrentPassword(currentPw || ''); // null이든 빈 문자열이든 그대로 요청 전송
      if (isMatch) {
        setIsPwVerified(true);
        setMessage('비밀번호가 확인되었습니다. 새 비밀번호를 입력하세요.');
        setCurrentPwError(false);
      } else {
        setIsPwVerified(false);
        setMessage('현재 비밀번호가 일치하지 않습니다.');
        setCurrentPwError(true);
      }
    } catch (error) {
      console.error('에러 발생', error);
      setMessage('비밀번호 확인 중 오류가 발생했습니다.');
    }
  };

  // 비밀번호 변경 요청 (changePassword API 호출)
  const handlePasswordChange = async (): Promise<void> => {
    if (!isPwVerified) {
      setMessage('현재 비밀번호 확인 후 진행하세요.');
      return;
    }

    if (!newPw) {
      setMessage('새 비밀번호를 입력하세요.');
      setNewPwError(true);
      return;
    }

    try {
      const success = await MyPageApi.changePassword(currentPw, newPw);
      if (success) {
        setMessage('비밀번호가 성공적으로 변경되었습니다.');
        setCurrentPw('');
        setNewPw('');
        setIsPwVerified(false);
        setNewPwError(false);
      } else {
        setMessage('비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('에러 발생', error);
      setMessage('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <RightContainerEach>
        <RightContentsContainer>
          <AccountEachContainer style={{ marginTop: '5px' }}>
            <TextField
              disabled
              id="id"
              label="아이디 (변경 불가능)"
              value={data?.userId}
              color="secondary"
              InputLabelProps={{
                shrink: true, // 강제로 label을 올려서 크기 오류 방지
              }}
              sx={{
                '& .MuiInputBase-input': { fontFamily: 'bold, sans-serif', fontSize: '14px' },
                '& .MuiInputLabel-root': { fontFamily: 'bold, sans-serif', fontSize: '14px' },
                '& .MuiOutlinedInput-notchedOutline legend': {
                  maxWidth: '108px', // legend 크기를 최소화해서 label만큼만 차지하도록 조정
                },
                width: '100%',
              }}
            />
          </AccountEachContainer>

          <AccountEachContainer>
            <InputContainer>
              <TextField
                id="email"
                label="이메일"
                value={data?.email}
                autoComplete="off"
                color="secondary"
                InputLabelProps={{
                  shrink: true, // 강제로 label을 올려서 크기 오류 방지
                }}
                sx={{
                  '& .MuiInputBase-input': { fontFamily: 'bold, sans-serif', fontSize: '14px' },
                  '& .MuiInputLabel-root': { fontFamily: 'bold, sans-serif', fontSize: '14px' },
                  '& .MuiOutlinedInput-notchedOutline legend': {
                    width: '44px', // legend 크기를 최소화해서 label만큼만 차지하도록 조정
                  },
                  width: '100%',
                }}
              />
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  width: '90px',
                  height: '53px',
                  fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                  fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                  color: 'white',
                }}
              >
                변경
              </Button>
            </InputContainer>
          </AccountEachContainer>

          <AccountEachContainer>
            <InputContainer style={{ marginBottom: currentPwError ? '20px' : '0' }}>
              <TextField
                id="currentpw"
                label="현재 비밀번호 입력"
                value={currentPw}
                autoComplete="off"
                type="password"
                onChange={(e) => setCurrentPw(e.target.value)}
                color="secondary"
                error={currentPwError} // 오류 상태에 따라 스타일 변경
                helperText={currentPwError ? message : ''} // 오류 메시지 표시
                // InputLabelProps={{
                //   shrink: true, // 강제로 label을 올려서 크기 오류 방지
                //   sx: { width: 'auto' }, // label 크기를 자동으로 조절
                // }}
                sx={{
                  '& .MuiInputBase-input': { fontFamily: 'bold, sans-serif', fontSize: '14px' },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'bold, sans-serif',
                    fontSize: '14px',
                    height: '50px',
                  },
                  '& .MuiFormHelperText-root': {
                    fontFamily: 'regular, sans-serif', // 폰트 패밀리 변경
                    fontSize: '12px', // 폰트 크기 변경
                    marginBottom: '16px', // helperText 아래 마진 추가
                  },
                  '& .MuiOutlinedInput-notchedOutline legend': {
                    width: '100px',
                  },
                  width: '100%',
                  height: '50px',
                }}
              />
              <Button
                onClick={handlePasswordCheck}
                variant="contained"
                color="secondary"
                sx={{
                  width: '90px',
                  height: '53px',
                  fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                  fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                  color: 'white',
                }}
              >
                확인
              </Button>
            </InputContainer>
          </AccountEachContainer>
          <AccountEachContainer style={{ marginBottom: '15px' }}>
            <InputContainer>
              <TextField
                id="newpw"
                label="새로운 비밀번호 입력"
                value={newPw}
                autoComplete="off"
                type="password"
                onChange={(e) => setNewPw(e.target.value)}
                color="secondary"
                error={newPwError} // 오류 상태에 따라 스타일 변경
                helperText={newPwError ? message : ''} // 오류 메시지 표시
                sx={{
                  '& .MuiInputBase-input': { fontFamily: 'bold, sans-serif', fontSize: '14px' },
                  '& .MuiInputLabel-root': { fontFamily: 'bold, sans-serif', fontSize: '14px' },
                  '& .MuiOutlinedInput-notchedOutline legend': {
                    width: '110px',
                  },
                  width: '100%',
                  height: '50px',
                }}
              />
              <Button
                onClick={handlePasswordChange}
                disabled={!isPwVerified}
                variant="contained"
                color="secondary"
                sx={{
                  width: '90px',
                  height: '53px',
                  fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                  fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                  color: 'white',
                }}
              >
                변경
              </Button>
            </InputContainer>
          </AccountEachContainer>
        </RightContentsContainer>
      </RightContainerEach>
    </>
  );
};

export default AccountManager_Account;
