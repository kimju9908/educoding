import { AxiosPromise } from 'axios';

import type { CheckResponse } from '../../../types/CommonTypes';

import {
  CsBoardRequest,
  CsPostRequest,
  DelCsPostRequest,
  DeleteUserRequest,
  EmailRequest,
  ImageUrlResponse,
  MyBoardResponse,
  MyReplyResponse,
  PageResponse,
  ProfileData,
  PwRequest,
  ReportBoardDataType,
  ReportReplyDataType,
  ReportReplyListRequest,
  ReportReplyListResponse,
  ReportReplyRequest,
  SearchUserData,
  SearchUserRequest,
  UserIncrementalData,
} from './AdminApiTypes';
import AxiosInstance from '../../AxiosInstance';
import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`;

const AdminApi = {
  // 토큰 전달시 헤더로 서버에서 userKey 추출출 반환 값은 response.data = AdminData
  adminProfile: async (): AxiosPromise<ProfileData> => {
    const response = await AxiosInstance.get<ProfileData>(`${SPRING_DOMAIN}/admin/profile`, {});
    return response;
  },

  // 변경 할 이메일을 전달 해 서버에 요청, 반환 값은 boolean - true/false
  modifyEmail: async (data: EmailRequest): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.put<CheckResponse>(
      `${SPRING_DOMAIN}/admin/modify/email`,
      data,
    );
    return response;
  },

  uploadprofile: async (formData: FormData): AxiosPromise<ImageUrlResponse> => {
    const response = await AxiosInstance.post<ImageUrlResponse>(
      SPRING_DOMAIN + '/my/profile/imageupload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response;
  },

  deleteprofile: async (): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.post<CheckResponse>(
      SPRING_DOMAIN + '/my/profile/imagedelete',
    );
    return response;
  },

  // 비밀번호 검사 Axios 요청 / 반환
  validatePw: async (data: PwRequest): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.post<CheckResponse>(
      `${SPRING_DOMAIN}/admin/check/pw`,
      data,
    );
    return response;
  },

  // 비밀번호 변경 Axios 요청 / 반환
  modifyPw: async (data: PwRequest): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.put<CheckResponse>(
      `${SPRING_DOMAIN}/admin/modify/pw`,
      data,
    );
    return response;
  },

  // 유저 검색 Axios 요청 / 반환
  searchUsers: async (params: SearchUserRequest): AxiosPromise<PageResponse<SearchUserData>> => {
    const response = await AxiosInstance.get<PageResponse<SearchUserData>>(
      `${SPRING_DOMAIN}/admin/list/users`,
      {
        params,
      },
    );
    return response;
  },

  // 유저 삭제
  deleteUsers: async (pathVariable: DeleteUserRequest): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.delete<CheckResponse>(
      SPRING_DOMAIN + `/admin/list/users/${pathVariable}`,
    );
    return response;
  },

  // 유저 증가량 Axios 요청 / 반환
  searchUserIncrementalData: async (): AxiosPromise<UserIncrementalData> => {
    const response = await AxiosInstance.get<UserIncrementalData>(
      `${SPRING_DOMAIN}/admin/data/user/increase`,
    );
    return response;
  },

  getMyReportPost: async (pathVariable: CsPostRequest): AxiosPromise<ReportBoardDataType> => {
    const response = await AxiosInstance.get<ReportBoardDataType>(
      SPRING_DOMAIN + `/admin/list/report/${pathVariable}`,
    );
    return response;
  },

  getMyReportBoard: async (
    params: CsBoardRequest,
  ): AxiosPromise<MyBoardResponse<ReportBoardDataType>> => {
    const response = await AxiosInstance.get<MyBoardResponse<ReportBoardDataType>>(
      SPRING_DOMAIN + '/admin/list/report',
      {
        params,
      },
    );
    return response;
  },

  getMyReportBoardQuery: async ({
    queryKey,
  }: {
    queryKey: [string, CsBoardRequest];
  }): AxiosPromise<MyBoardResponse<ReportBoardDataType>> => {
    const [, params] = queryKey;
    const response = await AxiosInstance.get<MyBoardResponse<ReportBoardDataType>>(
      SPRING_DOMAIN + '/admin/list/report',
      {
        params,
      },
    );
    return response;
  },

  writeReportReply: async (request: ReportReplyRequest): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.post<CheckResponse>(
      SPRING_DOMAIN + '/admin/reply/report',
      request, // POST 요청 본문
    );
    return response;
  },

  getMyReportComments: async (
    params: ReportReplyListRequest,
  ): AxiosPromise<MyReplyResponse<ReportReplyDataType>> => {
    const response = await AxiosInstance.get<MyReplyResponse<ReportReplyDataType>>(
      SPRING_DOMAIN + '/admin/list/report/comments',
      { params },
    );
    return response;
  },

  getMyReportCommentsQuery: async ({
    queryKey,
  }: {
    queryKey: [string, ReportReplyListRequest];
  }): AxiosPromise<ReportReplyListResponse> => {
    const [, params] = queryKey;
    const response = await AxiosInstance.get<ReportReplyListResponse>(
      SPRING_DOMAIN + '/admin/list/report/comments',
      { params },
    );
    return response;
  },

  deleteMyReportPost: async (pathVariable: DelCsPostRequest): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.delete<CheckResponse>(
      SPRING_DOMAIN + `/admin/delete/report/${pathVariable}`,
    );
    return response;
  },

};
export default AdminApi;
