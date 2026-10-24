import axios, { AxiosPromise } from 'axios';

import type { UserJoin, VerifyEmail, VerifyOtp, Validate } from './JoinApiTypes';
import type { CheckResponse } from '../../../types/CommonTypes';

import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`;

const JoinApi = {
  join: async (request: UserJoin): AxiosPromise<CheckResponse> => {
    // requestBody
    const response = await axios.post<CheckResponse>(SPRING_DOMAIN + '/auth/join', request);
    return response;
  },
  validate: async (params: Validate): AxiosPromise<CheckResponse> => {
    // requestParam
    const response = await axios.post<CheckResponse>(SPRING_DOMAIN + '/auth/join/validate', null, {
      params,
    });
    return response;
  },
  verifyemail: async (params: VerifyEmail): AxiosPromise<CheckResponse> => {
    const response = await axios.post<CheckResponse>(SPRING_DOMAIN + '/auth/join/verify', null, {
      params,
    });
    return response;
  },
  verifyotp: async (request: VerifyOtp): AxiosPromise<CheckResponse> => {
    const { otp, email } = request;
    const encodedemail = encodeURIComponent(email);
    const response = await axios.post<CheckResponse>(
      SPRING_DOMAIN + `/auth/join/${otp}/${encodedemail}`,
    );
    return response;
  },
  // 휴대폰 인증번호 발송 / 확인
  sendPhoneCode: async (phone: string): AxiosPromise<CheckResponse> =>
    axios.post<CheckResponse>(SPRING_DOMAIN + '/auth/join/phone/send', null, { params: { phone } }),
  verifyPhoneCode: async (phone: string, code: string): AxiosPromise<CheckResponse> =>
    axios.post<CheckResponse>(SPRING_DOMAIN + '/auth/join/phone/verify', null, {
      params: { phone, code },
    }),
  // 가입 전 프로필 이미지 업로드 → 이미지 URL
  uploadProfileImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const response = await axios.post<{ url: string }>(
      SPRING_DOMAIN + '/auth/join/profile-image',
      form,
    );
    return response.data.url;
  },
};

// 서버가 내려준 { message } 를 꺼냄 (없으면 기본 문구)
export const getJoinErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return '서버가 응답하지 않습니다. 네트워크 연결을 확인해 주세요.';
    const message = (error.response.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  return fallback;
};

export default JoinApi;
