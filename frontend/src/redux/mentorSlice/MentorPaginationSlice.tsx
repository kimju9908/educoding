import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 상태 타입 정의
interface MentorPaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

// 초기 상태 정의
const initialState: MentorPaginationState = {
  currentPage: 1,
  itemsPerPage: 12,
  totalPages: 1,
};

// 페이지네이션 슬라이스 생성
const mentorPaginationSlice = createSlice({
  name: 'mentorPagination',
  initialState,
  reducers: {
    // 현재 페이지 설정
    setCurrentPage(state: MentorPaginationState, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },

    // 페이지당 항목 수 설정
    setDetailItemsPerPage(state: MentorPaginationState, action: PayloadAction<number>) {
      state.itemsPerPage = action.payload;
    },

    // 전체 페이지 수 설정
    setTotalPages(state: MentorPaginationState, action: PayloadAction<number>) {
      state.totalPages = action.payload;
    },
  },
});

// 액션 내보내기 (setItemsPerPage 오타 수정)
export const { setCurrentPage, setDetailItemsPerPage, setTotalPages } =
  mentorPaginationSlice.actions;

// 리듀서 내보내기
export default mentorPaginationSlice.reducer;
