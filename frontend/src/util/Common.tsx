import axios from 'axios';

import type { TokenResponseWithoutRefresh } from '../types/CommonTypes';
import type { SetAutoLogin, SetRefreshToken } from '../types/ReduxTypes';

import config from '../api/config';
import JwtDecoding from '../api/JwtDecode';
import { setLoginData, clearAccessToken } from '../redux/slice/authSlice'; // Redux 액션 가져오기
import store from '../redux/store/store';

const Common = {
  SPRING_DOMAIN: `${config.apiUrl}` as const,

  // 저장되어 있는 access token 가져오기
  getAccessToken: (): string => {
    // console.log('accessToken', store.getState().auth);
    const accesstoken = store.getState().auth.accesstoken; // Redux store에서 토큰 가져오기
    return accesstoken;
  },

  // 저장되어 있는 access token 만료시간 가져오기
  getAccessTokenExpiresIn: (): number => {
    const accesstokenexpiresin = parseInt(store.getState().auth.accesstokenexpiresin);
    return accesstokenexpiresin;
  },

  // 들어온 토큰 기반 만료 시간 추출하기
  getNewAccessTokenExpiresIn: (token: string): string => {
    // 들어오는 token은 accesstoken
    const newaccesstokenexpiresin = JwtDecoding.getFieldFromToken(token, 'exp');
    // console.log(JwtDecoding.getFieldFromToken(token, 'exp'));
    return typeof newaccesstokenexpiresin === 'string'
      ? newaccesstokenexpiresin
      : String(newaccesstokenexpiresin ?? '');
  },

  // 들어온 토큰 기반 키값 추출하기
  getNewUserKeyNumber: (token: string): number => {
    // 들어오는 token은 accesstoken
    const newKeynumber = JwtDecoding.getFieldFromToken(token, 'sub');
    return typeof newKeynumber === 'number' ? newKeynumber : Number(newKeynumber ?? '');
  },
  getNickName: (): string => {
    const nickname = store.getState().auth.nickname;
    return nickname;
  },
  getKeynumber: (): string | number => {
    const keynumber = store.getState().auth.keynumber;
    return keynumber;
  },
  // 들어온 토큰 기반 닉네임 추출하기
  getNewNickname: (token: string): string => {
    // 들어오는 token은 accesstoken
    const newNickname = JwtDecoding.getFieldFromToken(token, 'nickname');
    return typeof newNickname === 'string' ? newNickname : String(newNickname ?? '');
  },

  getNewAuthority: (token: string): string => {
    const newAuthority = JwtDecoding.getFieldFromToken(token, 'authorities');
    if (Array.isArray(newAuthority) && newAuthority.length > 0) {
      return newAuthority[0].authority;
    }
    return String(newAuthority ?? '');
  },
  setAccessToken: (token: string): void => {
    store.dispatch(setLoginData({ accesstoken: token })); // Redux store에 토큰 저장
  }, // accesstoken 데이터는 (response.data.accessToken) -> response는 지정한 변수명

  setAccessTokenExpiresIn: (expirationtime: string): void => {
    store.dispatch(setLoginData({ accesstokenexpiresin: expirationtime }));
  }, // accesstoken expiretime 데이터는 getNewAccessTokenExpiresIn 함수를 거친 데이터

  setKeyNumber: (keynumber: number): void => {
    store.dispatch(setLoginData({ keynumber: keynumber }));
  },

  setNickname: (nickname: string): void => {
    store.dispatch(setLoginData({ nickname: nickname }));
  },

  // // 추가
  // setRegistered_at: (registered_at) => {
  //   store.dispatch(setLoginData({ registered_at: registered_at }));
  // },

  setProfile: (profile: string | null): void => {
    store.dispatch(setLoginData({ profile: profile }));
  },

  setRefreshData: (data: SetRefreshToken): void => {
    store.dispatch(setLoginData(data));
  },

  clearAccessToken: (): void => {
    store.dispatch(clearAccessToken());
  },

  refreshAccessToken: async (): Promise<string> => {
    const response = await axios.post<TokenResponseWithoutRefresh>(
      `${Common.SPRING_DOMAIN}/auth/reissue`,
      {},
      {
        withCredentials: true,
      },
    );
    const accessToken = response.data.accessToken;
    const accessTokenExpirationTime = Common.getNewAccessTokenExpiresIn(response.data.accessToken);
    const data: SetRefreshToken = {
      accesstoken: accessToken,
      accesstokenexpiresin: accessTokenExpirationTime,
    };
    Common.setRefreshData(data);
    return accessToken;
  },

  setAutoLogin: async (): Promise<SetAutoLogin> => {
    const response = await axios.post<TokenResponseWithoutRefresh>(
      `${Common.SPRING_DOMAIN}/auth/reissue`,
      {},
      {
        withCredentials: true,
      },
    );
    const accessToken = response.data.accessToken;
    const accessTokenExpirationTime = Common.getNewAccessTokenExpiresIn(response.data.accessToken);
    const profile = response.data.profileUrl;
    const nickname = Common.getNewNickname(accessToken);
    const keynumber = Common.getNewUserKeyNumber(accessToken);
    const authority = Common.getNewAuthority(accessToken);
    const registeredAt = response.data.registeredAt;
    const data: SetAutoLogin = {
      keynumber,
      nickname,
      accesstoken: accessToken,
      accesstokenexpiresin: accessTokenExpirationTime,
      authority,
      profile,
      registeredAt,
    };
    return data;
  },
};

export default Common;
