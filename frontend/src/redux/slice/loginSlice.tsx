import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { LoginState } from '../../types/ReduxTypes';

const initialState: LoginState = {
  autologin: false,
};

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoginCondition: (state, action: PayloadAction<Partial<LoginState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    logoutCondition: (state) => {
      state.autologin = false;
    },
  },
});

export const { setLoginCondition, logoutCondition } = loginSlice.actions;

export default loginSlice.reducer;
