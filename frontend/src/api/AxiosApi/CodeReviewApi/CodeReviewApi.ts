import { AxiosError } from 'axios';

import type { CodeReviewApiError, CodeReviewResponse, ReviewTargetResponse } from './CodeReviewApiType';

import AxiosInstance from '../../AxiosInstance';
import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`;

export const toApiError = (error: unknown, fallback: string): CodeReviewApiError => {
  if (error instanceof AxiosError) {
    if (error.request && !error.response) {
      return { error: '서버가 응답하지 않습니다. 네트워크 연결 상태를 확인해주세요.', status: 0 };
    }
    if (error.response) {
      const message = (error.response.data as { message?: string } | undefined)?.message;
      return { error: message || fallback, status: error.response.status };
    }
  }
  return { error: fallback, status: 0 };
};

export const isCodeReviewApiError = (data: unknown): data is CodeReviewApiError =>
  typeof data === 'object' && data !== null && 'error' in data && 'status' in data;

const CodeReviewApi = {
  // SSE 채점 jobId → 그 채점으로 저장된 제출
  findTarget: async (jobId: string): Promise<ReviewTargetResponse | CodeReviewApiError> => {
    try {
      const url = `${SPRING_DOMAIN}/api/code-review/target`;
      const response = await AxiosInstance.get<ReviewTargetResponse>(url, { params: { jobId } });
      return response.data;
    } catch (error) {
      return toApiError(error, '채점된 제출을 찾지 못했습니다.');
    }
  },

  getReview: async (judgmentId: number): Promise<CodeReviewResponse | CodeReviewApiError> => {
    try {
      const url = `${SPRING_DOMAIN}/api/code-review/${judgmentId}`;
      const response = await AxiosInstance.get<CodeReviewResponse>(url);
      return response.data;
    } catch (error) {
      return toApiError(error, 'AI 코드 리뷰를 불러오지 못했습니다.');
    }
  },

  // 생성이 끝날 때까지(최대 수 분) 응답을 기다린다. 다른 요청이 생성 중이면 PENDING으로 바로 돌아온다.
  requestReview: async (judgmentId: number): Promise<CodeReviewResponse | CodeReviewApiError> => {
    try {
      const url = `${SPRING_DOMAIN}/api/code-review/${judgmentId}`;
      const response = await AxiosInstance.post<CodeReviewResponse>(url);
      return response.data;
    } catch (error) {
      return toApiError(error, 'AI 코드 리뷰를 요청하지 못했습니다.');
    }
  },
};

export default CodeReviewApi;
