import type { CodeHintRequest, CodeHintState, HintSubmission } from './CodeHintApiType';
import type { CodeReviewApiError } from '../CodeReviewApi/CodeReviewApiType';

import AxiosInstance from '../../AxiosInstance';
import config from '../../config';
import { toApiError } from '../CodeReviewApi/CodeReviewApi';

const SPRING_DOMAIN = `${config.apiUrl}`;

const CodeHintApi = {
  // 힌트 기준으로 고를 수 있는 본인의 오답 제출 (최근 10건)
  listSubmissions: async (challengeId: number): Promise<HintSubmission[] | CodeReviewApiError> => {
    try {
      const url = `${SPRING_DOMAIN}/api/code-hint/submissions`;
      const response = await AxiosInstance.get<HintSubmission[]>(url, { params: { challengeId } });
      return response.data;
    } catch (error) {
      return toApiError(error, '제출 목록을 불러오지 못했습니다.');
    }
  },

  getState: async (
    challengeId: number,
    judgmentId: number | null,
  ): Promise<CodeHintState | CodeReviewApiError> => {
    try {
      const url = `${SPRING_DOMAIN}/api/code-hint`;
      const params = judgmentId === null ? { challengeId } : { challengeId, judgmentId };
      const response = await AxiosInstance.get<CodeHintState>(url, { params });
      return response.data;
    } catch (error) {
      return toApiError(error, '힌트를 불러오지 못했습니다.');
    }
  },

  // 생성이 끝날 때까지(최대 2~3분) 기다린다. 다른 요청이 생성 중이면 GENERATING으로 바로 돌아온다.
  requestHint: async (request: CodeHintRequest): Promise<CodeHintState | CodeReviewApiError> => {
    try {
      const url = `${SPRING_DOMAIN}/api/code-hint`;
      const response = await AxiosInstance.post<CodeHintState>(url, request);
      return response.data;
    } catch (error) {
      return toApiError(error, 'AI 힌트를 요청하지 못했습니다.');
    }
  },
};

export default CodeHintApi;
