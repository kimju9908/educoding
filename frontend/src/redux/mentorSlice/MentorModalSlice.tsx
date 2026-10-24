import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 상태 타입 정의
interface MentorModalState {
  isOpen: boolean;
  selectedMentorId: number; // 또는 number
  modalType: string; // 또는 ModalType 열거형
}

// 초기 상태 정의
const initialState: MentorModalState = {
  isOpen: false,
  selectedMentorId: 0,
  modalType: '',
};

// openModal payload 타입 정의
interface OpenModalPayload {
  mentorId?: number; // 선택적, 필요에 따라 사용
  modalType: string; // 필수
}

// 슬라이스 생성
const mentorModalSlice = createSlice({
  name: 'mentorModal',
  initialState,
  reducers: {
    openModal(state: MentorModalState, action: PayloadAction<OpenModalPayload>) {
      state.isOpen = true;
      state.selectedMentorId = action.payload.mentorId || 0; // mentorId가 없으면 빈 문자열
      state.modalType = action.payload.modalType;
    },
    closeModal(state: MentorModalState) {
      state.isOpen = false;
      state.selectedMentorId = 0;
      state.modalType = '';
    },
  },
});

export const { openModal, closeModal } = mentorModalSlice.actions;
export default mentorModalSlice.reducer;
