// import { Middleware } from '@reduxjs/toolkit';

// import { RootState } from '../store/reducer';

// const loggerMiddleware: Middleware<{}, RootState> = (storeApi) => (next) => (action) => {
//   if (typeof action === 'object' && action !== null && 'type' in action) {
//     console.log('디스패치된 액션:', (action as { type: string }).type); // 안전하게 접근 가능
//   } else {
//     console.warn('알 수 없는 액션 디스패치됨:', action);
//   }
//   console.log('이전 상태:', storeApi.getState());
//   const result = next(action);
//   console.log('다음 상태 : ', storeApi.getState());
//   return result;
// };

// export default loggerMiddleware;
