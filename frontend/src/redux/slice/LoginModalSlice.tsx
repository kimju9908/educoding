import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 로그인 페이지가 전역 모달로 바뀌면서, "로그인이 필요합니다" 같은 곳에서
// navigate('/login') 대신 이 슬라이스를 통해 모달을 연다 (Layout.tsx가 한 번만 렌더링).
interface LoginModalState {
  isOpen: boolean;
  // 회원가입 직후처럼, 모달을 열 때 이메일을 미리 채워줘야 하는 경우에 사용
  prefillEmail: string;
}

const initialState: LoginModalState = {
  isOpen: false,
  prefillEmail: '',
};

const loginModalSlice = createSlice({
  name: 'loginModal',
  initialState,
  reducers: {
    openLoginModal(state, action: PayloadAction<{ prefillEmail?: string } | undefined>) {
      state.isOpen = true;
      state.prefillEmail = action.payload?.prefillEmail ?? '';
    },
    closeLoginModal(state) {
      state.isOpen = false;
      state.prefillEmail = '';
    },
  },
});

export const { openLoginModal, closeLoginModal } = loginModalSlice.actions;
export default loginModalSlice.reducer;
