// Refresh Token 받아오는 로직 구현해야함
import { JSX, useState } from 'react';

import { Dialog, DialogActions, DialogContent, Button } from '@mui/material';
import axios from 'axios';

import { useAppDispatch } from '../redux/hooks/reduxHooks';
import { openLoginModal } from '../redux/slice/LoginModalSlice';
import Common from '../util/Common';

const AxiosInstance = axios.create({
  baseURL: Common.SPRING_DOMAIN,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 추가
AxiosInstance.interceptors.request.use(
  async (config) => {
    // Access Token을 가져와서 Authorization 헤더에 추가
    const accessToken = Common.getAccessToken(); // Access Token
    const expirationTime = new Date(Common.getAccessTokenExpiresIn()); // 만료 시간
    if (accessToken && expirationTime) {
      const currentTime = new Date(Math.floor(new Date().getTime() / 1000)); // 자리수 차이로 인한 에러...
      if (currentTime > expirationTime) {
        Common.clearAccessToken();
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const ResponseInterceptors = (): JSX.Element => {
  const [openDialog, setOpenDialog] = useState(false); // Dialog 열기/닫기 상태
  const [dialogMessage, setDialogMessage] = useState(''); // Dialog에 표시할 메시지
  const dispatch = useAppDispatch();

  // 로그인 모달 열기 (예전엔 /login 페이지로 리디렉션했음)
  const openLogin = (): void => {
    setOpenDialog(false);
    dispatch(openLoginModal());
  };

  // 응답 인터셉터 추가
  AxiosInstance.interceptors.response.use(
    (response) => {
      return response; // 응답 성공 시 그대로 반환
    },
    async (error) => {
      const originalRequest = error.config; // 실패한 요청

      // 응답이 401 Unauthorized (유효하지 않거나 토큰이 없는 경우)인 경우
      // 토큰 재발급 시도
      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry // 재시도 방지
      ) {
        originalRequest._retry = true;

        const isAuthNickname: string | '' = Common.getNickName();
        const isAuthKeynumber: number | string = Common.getKeynumber();

        // 저장된 인증 정보가 없는 경우? (닉네임, sub값)
        if (isAuthNickname === '' && isAuthKeynumber === '') {
          setDialogMessage('로그인이 필요한 서비스입니다');
          setOpenDialog(true);
          return;
        }

        try {
          // Refresh Token을 사용하여 새로운 Access Token을 발급 받음
          const newAccessToken = await Common.refreshAccessToken();
          if (newAccessToken) {
            // 새로운 Access Token을 헤더에 설정
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // 원래의 요청을 새로운 Access Token으로 재요청
            return AxiosInstance.request(originalRequest);
          }
        } catch (refreshError) {
          if (refreshError) {
            setDialogMessage('로그인이 만료되었습니다. 로그인 후 다시 시도해주세요');
            setOpenDialog(true);
          }
        }
      }

      return Promise.reject(error); // 그 외 에러는 그대로 반환
    },
  );

  return (
    <>
      <Dialog
        open={openDialog}
        onClose={openLogin}
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
          <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={openLogin}>
            로그인하기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AxiosInstance;
