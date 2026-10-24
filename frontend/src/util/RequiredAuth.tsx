import { JSX, useEffect } from 'react';

import { Navigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../redux/hooks/reduxHooks';
import { openLoginModal } from '../redux/slice/LoginModalSlice';

interface RequiredAuthProps {
  children: JSX.Element;
}

// 로그인 페이지가 사라지고 전역 모달이 됐으므로, 인증이 필요한 라우트에 비로그인으로
// 들어오면 홈으로 보내면서 로그인 모달을 띄운다 (예전엔 /login으로 리다이렉트했음).
const RequiredAuth = ({ children }: RequiredAuthProps): JSX.Element => {
  const isAuth = useAppSelector((state) => state.auth.keynumber);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuth === null) {
      dispatch(openLoginModal());
    }
  }, [isAuth, dispatch]);

  return isAuth !== null ? children : <Navigate to="/" replace />;
};

export default RequiredAuth;
