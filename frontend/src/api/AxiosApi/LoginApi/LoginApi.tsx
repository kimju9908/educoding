import axios, { AxiosPromise } from 'axios';

import type {
  ResetPassword,
  UserLogin,
  ValidateNewPassword,
  VerifySecurity,
} from './LoginApiTypes';
import type { TokenResponseWithoutRefresh, CheckResponse } from '../../../types/CommonTypes';

import config from '../../config';
import { VerifyEmail } from '../JoinApi/JoinApiTypes';

const SPRING_DOMAIN = `${config.apiUrl}`;

const LoginApi = {
  login: async (request: UserLogin): AxiosPromise<TokenResponseWithoutRefresh> => {
    const response = await axios.post<TokenResponseWithoutRefresh>(
      SPRING_DOMAIN + '/auth/login',
      request,
    );
    return response;
  },
  autologin: async (): AxiosPromise<CheckResponse> => {
    const response = await axios.post<CheckResponse>(
      SPRING_DOMAIN + '/auth/autologin',
      {},
      { withCredentials: true },
    );
    return response;
  },

  findpw: async (email: string): AxiosPromise<CheckResponse> => {
    const encodedemail = encodeURIComponent(email);
    const response = await axios.post<CheckResponse>(
      SPRING_DOMAIN + `/auth/forgotpw/${encodedemail}`,
    );
    return response;
  },
  verifypwsecurity: async (request: VerifySecurity): AxiosPromise<CheckResponse> => {
    const { otp, email } = request;
    const encodedemail = encodeURIComponent(email);
    const response = await axios.post(SPRING_DOMAIN + `/auth/forgotpw/${otp}/${encodedemail}`);
    return response;
  },
  validatenewpassword: async (params: ValidateNewPassword): AxiosPromise<CheckResponse> => {
    // requestParam
    const response = await axios.post(SPRING_DOMAIN + '/auth/forgotpw/validate', null, { params });
    return response;
  },
  resetpassword: async (request: ResetPassword): AxiosPromise<CheckResponse> => {
    const { email, newpassword } = request;
    const encodedemail = encodeURIComponent(email);
    const reset = {
      params: {
        newPw: newpassword,
      },
    };
    const response = await axios.put(SPRING_DOMAIN + `/auth/resetpw/${encodedemail}`, null, reset);
    return response;
  },
};

export default LoginApi;
