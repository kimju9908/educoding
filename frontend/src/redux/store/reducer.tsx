import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import localStorage from 'redux-persist/lib/storage';
import sessionStorage from 'redux-persist/lib/storage/session';

import mentorModalSliceReducer from '../mentorSlice/MentorModalSlice';
import mentorPaginationSliceReducer from '../mentorSlice/MentorPaginationSlice';
import authReducer from '../slice/authSlice';
import loginModalReducer from '../slice/LoginModalSlice';
import loginReducer from '../slice/loginSlice';
import themeReducer from '../slice/themeSlice';
// LocalStorage에 저장

// "redux-persist/lib/storage" -> 브라우저 껏다 켜도 state 계속 저장 및 유지
// "redux-persist/lib/storage/session" -> 브라우저 껐다 켤 시 초기화

const persistAuthConfig = {
  key: 'auth',
  storage: sessionStorage,
};
const persistLoginConfig = {
  key: 'login',
  storage: localStorage,
};
const persistThemeConfig = {
  key: 'theme',
  storage: localStorage,
};

const persistedAuthReducer = persistReducer(persistAuthConfig, authReducer);
const persistedLoginReducer = persistReducer(persistLoginConfig, loginReducer);
const persistedThemeReducer = persistReducer(persistThemeConfig, themeReducer);

export const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  login: persistedLoginReducer,
  theme: persistedThemeReducer,
  mentorPagination: mentorPaginationSliceReducer,
  mentorModal: mentorModalSliceReducer,
  loginModal: loginModalReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
