import { AxiosPromise } from 'axios';

import type { CheckResponse } from '../../../types/CommonTypes';

import {
  ImageUrlSchema,
  MyBoardListResponse,
  MyBoardListSchema,
  MyBoardRequestSchema,
  MyProfileSchema,
  type BoardDataType,
  type DelMyReportRequest,
  type ImageUrlResponse,
  type ModifyIntroductionRequest,
  type ModifyNicknameRequest,
  type MyBoardRequest,
  type MyBoardResponse,
  type MyProfileResponse,
  type MyReplyResponse,
  type MyReportBoardRequest,
  type MyReportCommentRequest,
  type MyReportCommentResponse,
  type MyReportPostRequest,
  type ReportBoardDataType,
} from './MyPageApiTypes';
import AxiosInstance from '../../AxiosInstance';
import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`;

const MyPageApi = {
  uploadprofile: async (formData: FormData): Promise<ImageUrlResponse> => {
    const response = await AxiosInstance.post<ImageUrlResponse>(
      SPRING_DOMAIN + '/my/profile/imageupload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    const parsed = ImageUrlSchema.safeParse(response.data);
    if (!parsed.success) {
      throw new Error('Invalid ImageUrl response');
    }
    return parsed.data;
  },
  deleteprofile: async (): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.post<CheckResponse>(
      SPRING_DOMAIN + '/my/profile/imagedelete',
    );
    return response;
  },

  getmyprofile: async (): Promise<MyProfileResponse> => {
    const response = await AxiosInstance.get<MyProfileResponse>(SPRING_DOMAIN + '/my/profile');
    console.log('API 호출 확인', response);

    const parsed = MyProfileSchema.safeParse(response.data);
    if (!parsed.success) {
      throw parsed.error;
    }
    return parsed.data;
  },

  getMyPosts: async (params: MyBoardRequest): Promise<MyBoardListResponse> => {
    const parsedData = MyBoardRequestSchema.safeParse(params);
    if (!parsedData.success) {
      throw parsedData.error;
    }
    const response = await AxiosInstance.get<MyBoardListResponse>(SPRING_DOMAIN + '/my/list/post', {
      params,
    });
    const parsedResponse = MyBoardListSchema.safeParse(response.data);
    if (!parsedResponse.success) {
      throw parsedResponse.error;
    }
    return parsedResponse.data;
  },

  getMyPostsQuery: async ({
    queryKey,
  }: {
    queryKey: [string, MyBoardRequest];
  }): Promise<MyBoardListResponse> => {
    const [, params] = queryKey;
    const parsedData = MyBoardRequestSchema.safeParse(params);
    if (!parsedData.success) {
      throw parsedData.error;
    }
    const response = await AxiosInstance.get<MyBoardListResponse>(SPRING_DOMAIN + '/my/list/post', {
      params,
    });
    const parsedResponse = MyBoardListSchema.safeParse(response.data);
    if (!parsedResponse.success) {
      throw parsedResponse.error;
    }
    return parsedResponse.data;
  },

  modifyProfile: async (
    request: ModifyNicknameRequest | ModifyIntroductionRequest,
  ): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.put<CheckResponse>(
      SPRING_DOMAIN + '/my/profile-modify',
      request,
    );
    return response;
  },

  getMyReportBoard: async (
    params: MyReportBoardRequest,
  ): AxiosPromise<MyBoardResponse<ReportBoardDataType>> => {
    const response = await AxiosInstance.get<MyBoardResponse<ReportBoardDataType>>(
      SPRING_DOMAIN + '/my/list/report',
      {
        params,
      },
    );
    return response;
  },

  getMyReportBoardQuery: async ({
    queryKey,
  }: {
    queryKey: [string, MyReportBoardRequest];
  }): AxiosPromise<MyBoardResponse<ReportBoardDataType>> => {
    const [, params] = queryKey;
    const response = await AxiosInstance.get<MyBoardResponse<ReportBoardDataType>>(
      SPRING_DOMAIN + '/my/list/report',
      {
        params,
      },
    );
    return response;
  },

  getMyReportPost: async (pathVariable: MyReportPostRequest): AxiosPromise<ReportBoardDataType> => {
    const response = await AxiosInstance.get<ReportBoardDataType>(
      SPRING_DOMAIN + `/my/list/report/${pathVariable}`,
    );
    return response;
  },

  getMyReportComments: async (
    params: MyReportCommentRequest,
  ): AxiosPromise<MyReplyResponse<MyReportCommentResponse>> => {
    const response = await AxiosInstance.get<MyReplyResponse<MyReportCommentResponse>>(
      SPRING_DOMAIN + '/my/list/report/comment',
      { params },
    );
    return response;
  },

  getMyReportCommentsQuery: async ({
    queryKey,
  }: {
    queryKey: [string, MyReportCommentRequest];
  }): AxiosPromise<MyReplyResponse<MyReportCommentResponse>> => {
    const [, params] = queryKey;
    const response = await AxiosInstance.get<MyReplyResponse<MyReportCommentResponse>>(
      SPRING_DOMAIN + '/my/list/report/comment',
      { params },
    );
    return response;
  },

  deleteMyReportPost: async (pathVariable: DelMyReportRequest): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.delete<CheckResponse>(
      SPRING_DOMAIN + `/my/delete/report/${pathVariable}`,
    );
    return response;
  },

  checkCurrentPassword: async (inputPw: string): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.post<CheckResponse>(
      SPRING_DOMAIN + '/my/profile-checkPw',
      null,
      {
        params: { inputPw },
      },
    );
    return response; // true or false 반환
  },

  changePassword: async (inputPw: string, newPw: string): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.put<CheckResponse>(
      SPRING_DOMAIN + '/my/profile-changePw',
      null,
      {
        params: { inputPw: inputPw || '', newPw }, // null인 경우 빈 문자열로 보냄
      },
    );
    return response;
  },

  changeNickname: async (newNickname: string): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.put<CheckResponse>(
      SPRING_DOMAIN + '/my/profile/change-nickname',
      null,
      {
        params: { newNickname },
      },
    );
    return response;
  },

  checkNicknameAvailability: async (nickname: string): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.get<CheckResponse>(
      SPRING_DOMAIN + '/my/profile/check-nickname',
      {
        params: { nickname },
      },
    );
    return response;
  },

  deRegister: async (): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.delete<CheckResponse>(
      SPRING_DOMAIN + '/my/profile/deregister',
    );
    return response;
  },
};

export default MyPageApi;
