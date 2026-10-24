export type CheckResponse = boolean;

export type StatusResponse = number;

export type TokenResponse = {
  grantType: string;
  accessToken: string;
  refreshToken?: null;
  profileUrl: string | null;
  newUser?: boolean;
  userKey: number;
  registeredAt: string;
};

export type TokenResponseWithoutRefresh = Omit<TokenResponse, 'refreshToken'>;

export type ParamData<T> = {
  params: T;
};
