import { createSlice } from '@reduxjs/toolkit';

import type { ThemeState } from '../../types/ReduxTypes';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: ThemeState = {
  mode: 'dark',
};

// 슬라이스 생성
export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.mode = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;

export default themeSlice.reducer;
