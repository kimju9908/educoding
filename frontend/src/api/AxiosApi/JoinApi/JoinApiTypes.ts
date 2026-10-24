// 회원가입 요청 — 로그인은 이메일로 하므로 아이디 입력은 없음 (서버가 내부 아이디 자동 생성)
export type UserJoin = {
  email: string;
  name: string;
  birthDate: string; // yyyy-MM-dd
  nickname: string;
  phoneNumber: string;
  password: string;
  profileUrl?: string;
};

export type Validate = {
  key: string;
  value: string;
};

export type VerifyEmail = {
  email: string;
};

export type VerifyOtp = {
  otp: number;
  email: string;
};
