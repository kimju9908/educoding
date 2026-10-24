export type AuthState = {
  keynumber: number | string;
  nickname: string;
  accesstoken: string;
  accesstokenexpiresin: string;
  authority: string;
  profile: string | null;
  error: string | unknown;
  status: 'idle' | 'loading' | 'succeeded' | 'failed' | 'auto-login-failed';
  registeredAt: string;
};

export type LoginState = {
  autologin: boolean;
};

export type ThemeState = {
  mode: 'light' | 'dark';
};

export type SetAutoLogin = Omit<AuthState, 'error' | 'status'>;

export type SetRefreshToken = Omit<
  AuthState,
  'error' | 'keynumber' | 'nickname' | 'authority' | 'profile' | 'status' | 'registeredAt'
>;
