import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';

import { rootReducer } from './reducer';

// LocalStorage에 저장

// "redux-persist/lib/storage" -> 브라우저 껏다 켜도 state 계속 저장 및 유지
// "redux-persist/lib/storage/session" -> 브라우저 껐다 켤 시 초기화

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export default store;
