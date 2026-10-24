import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import type { AuthState } from '../../types/ReduxTypes';
import type { PayloadAction } from '@reduxjs/toolkit';

import LoginApi from '../../api/AxiosApi/LoginApi/LoginApi';
import Common from '../../util/Common';
import { RootState } from '../store/reducer';

const initialState: AuthState = {
  keynumber: '',
  nickname: '',
  accesstoken: '',
  accesstokenexpiresin: '',
  authority: '',
  profile: null,
  error: '',
  status: 'idle',
  registeredAt: '',
};

export const checkAutoLogin = createAsyncThunk<
  Partial<AuthState>,
  undefined,
  { state: RootState; rejectValue: string }
>('auth/checkAutoLogin', async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const isAutoLogin = state.login.autologin;
  const currentStatus = state.auth.status;
  if (currentStatus === 'succeeded') return thunkAPI.rejectWithValue('로그인된 유저');
  if (currentStatus === 'failed') return thunkAPI.rejectWithValue('수동 로그인 필요');
  if (!isAutoLogin) return thunkAPI.rejectWithValue('자동 로그인 대상 아님');

  if (currentStatus === 'loading') {
    try {
      const available = await LoginApi.autologin();

      if (available) {
        const response = await Common.setAutoLogin();

        return response;
      }
      return initialState;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('error 확인 : ', error);

        return thunkAPI.rejectWithValue('자동 로그인 실패');
      }
    }
  }
  return thunkAPI.rejectWithValue('알 수 없는 오류 발생');
});

// 슬라이스 생성
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginData: (state, action: PayloadAction<Partial<AuthState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    setError: (state, action: PayloadAction<string | unknown>) => {
      state.error = action.payload;
    },
    logoutAuth: () => initialState,
    clearAccessToken: (state) => {
      state.accesstoken = '';
      state.accesstokenexpiresin = '';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkAutoLogin.pending, (state, action) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      checkAutoLogin.fulfilled,
      (state, action: PayloadAction<Partial<AuthState>>) => {
        const filteredPayload = Object.fromEntries(
          Object.entries(action.payload).filter(([_, value]) => value !== undefined),
        );
        Object.assign(state, filteredPayload);
        state.status = action.payload === initialState ? 'auto-login-failed' : 'succeeded';
        state.error = null;
      },
    );
    builder.addCase(checkAutoLogin.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    });
  },
});

export const { setLoginData, setError, logoutAuth, clearAccessToken } = authSlice.actions;

export default authSlice.reducer;
