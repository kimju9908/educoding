import axios, { AxiosResponse } from 'axios';

import {
  MenteeCheckResponse,
  MentorApiResponse,
  MentorContentData,
  MentorPageRenderingData,
  MentorPostData,
  PaginationResponse,
  PreviewRequest,
  PreviewResponse,
  ReviewData,
  SubmitReviewData,
  UpdatedReviewData,
} from './MentorApiTypes';
import AxiosInstance from '../../AxiosInstance';
import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`; // AxiosInstance 타입은 별도 파일에서 정의된다고 가정

const MentorApi = {
  // Mentor Main Page 읽어오기
  getContentData: async (
    mentorPageRenderingData: MentorPageRenderingData,
  ): Promise<AxiosResponse<MentorApiResponse>> => {
    const response = await axios.post<MentorApiResponse>(
      `${SPRING_DOMAIN}/mentor/contentData`,
      mentorPageRenderingData,
    );
    return response;
  },

  // 모달창 상세보기
  getModalDetail: async (mentorId: number): Promise<AxiosResponse<MentorContentData>> => {
    const response = await axios.get<MentorContentData>(
      `${SPRING_DOMAIN}/mentor/contentData/detail/${mentorId}`,
    );
    return response;
  },

  // 리뷰보기
  getModalReview: async (mentorId: number): Promise<AxiosResponse<ReviewData[]>> => {
    const response = await axios.get<ReviewData[]>(
      `${SPRING_DOMAIN}/mentorReview/reviewData/${mentorId}`,
    );
    return response;
  },

  // Mentor post 삭제 (void 대신 unknown 사용)
  deleteMentor: async (mentorId: number): Promise<AxiosResponse<unknown>> => {
    const response = await AxiosInstance.delete<unknown>(
      `${SPRING_DOMAIN}/mentor/delete/${mentorId}`,
    );
    return response;
  },

  // Mentor Post Data -> DB저장(등록)
  writeMentorPost: async (mentorPostData: MentorPostData): Promise<AxiosResponse<unknown>> => {
    const response = await AxiosInstance.post<unknown>(
      `${SPRING_DOMAIN}/mentor/postData`,
      mentorPostData,
    );
    return response;
  },

  // Mentor Post Data -> DB저장(수정)
  ModifyMentorPost: async (mentorPostData: MentorPostData): Promise<AxiosResponse<unknown>> => {
    const response = await AxiosInstance.post<unknown>(
      `${SPRING_DOMAIN}/mentor/modifyData`,
      mentorPostData,
    );
    return response;
  },

  // Mentor Post Page에서 미리보기 기능 (프로필, 닉네임 읽어오기)
  getPreviewData: async (userKey: PreviewRequest): Promise<AxiosResponse<PreviewResponse>> => {
    const key = userKey.userKey;
    const response = await AxiosInstance.get<PreviewResponse>(
      `${SPRING_DOMAIN}/mentor/previewRead/${key}`,
    );
    return response;
  },

  // 멘토 신청하기(이메일 발송)
  ApplyForMentor: async (
    mentorId: number,
    menteeKey: number | null,
    applyMenteeText: string,
  ): Promise<AxiosResponse<unknown>> => {
    const response = await AxiosInstance.post<unknown>(
      `${SPRING_DOMAIN}/mentor/apply/email`,
      null,
      {
        params: {
          mentorId,
          menteeKey,
          applyMenteeText,
        },
      },
    );
    return response;
  },

  // 멘토링 수락(멘티 리뷰 권한 부여)
  grantForMenteeReview: async (
    mentorId: string,
    menteeKey: string,
  ): Promise<AxiosResponse<unknown>> => {
    const response = await axios.post<unknown>(
      `${SPRING_DOMAIN}/mentor/grantForMenteeReview`,
      null,
      {
        params: {
          mentorId,
          menteeKey,
        },
      },
    );
    return response;
  },

  // 해당 멘토글의 멘티인지 유무 확인
  getMenteeCheck: async (
    mentorId: number,
    menteeKey: number,
  ): Promise<AxiosResponse<MenteeCheckResponse>> => {
    const response = await AxiosInstance.get<MenteeCheckResponse>(
      `${SPRING_DOMAIN}/mentorReview/menteeCheck`,
      {
        params: {
          mentorId,
          menteeKey,
        },
      },
    );
    return response;
  },

  // 리뷰 등록
  submitReview: async (reviewData: SubmitReviewData): Promise<AxiosResponse<unknown>> => {
    const response = await AxiosInstance.post<unknown>(
      `${SPRING_DOMAIN}/mentorReview/reviewSubmit`,
      reviewData,
    );
    return response;
  },

  // 리뷰 삭제
  deleteReview: async (
    reviewId: number,
    updatedReviewData: Partial<UpdatedReviewData>,
  ): Promise<AxiosResponse<unknown>> => {
    const response = await AxiosInstance.patch<unknown>(
      `${SPRING_DOMAIN}/mentorReview/deleteReview/${reviewId}`,
      updatedReviewData,
    );
    return response;
  },

  // 멘토 목록 리스트
  mentorCheck: async (
    userKey: number,
    currentPage: number,
    size: number,
  ): Promise<AxiosResponse<PaginationResponse>> => {
    const response = await AxiosInstance.get<PaginationResponse>(`/my/mentorList`, {
      params: {
        userKey: userKey,
        page: currentPage,
        size: size,
      },
    });
    return response;
  },

  // 내가 작성한 멘토링 글 정보
  myMentoringPost: async (
    userKey: number,
    currentPage: number,
    size: number,
  ): Promise<AxiosResponse<PaginationResponse>> => {
    const response = await AxiosInstance.get<PaginationResponse>(`my/myMentoringPost`, {
      params: {
        userKey: userKey,
        currentPage: currentPage,
        size: size,
      },
    });
    return response;
  },

  // 멘티 목록 리스트
  menteeCheck: async (
    userKey: number,
    currentPage: number,
    size: number,
  ): Promise<AxiosResponse<PaginationResponse>> => {
    const response = await AxiosInstance.get<PaginationResponse>(`/my/menteeList`, {
      params: {
        userKey: userKey,
        page: currentPage,
        size: size,
      },
    });
    return response;
  },
};

export default MentorApi;
