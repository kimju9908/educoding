// 로그인은 이메일 + 비밀번호
export type UserLogin = {
  email: string;
  password: string;
};

export type VerifySecurity = {
  otp: number;
  email: string;
};

export type ValidateNewPassword = {
  email: string;
  newpassword: string;
};

export type ResetPassword = {
  email: string;
  newpassword: string;
};
