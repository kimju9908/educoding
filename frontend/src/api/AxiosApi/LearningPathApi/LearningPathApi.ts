import type { CodeReviewApiError } from '../CodeReviewApi/CodeReviewApiType';

import AxiosInstance from '../../AxiosInstance';
import config from '../../config';
import { toApiError } from '../CodeReviewApi/CodeReviewApi';

export type LearningProfile = { language: string; level: string; goal: string };
export type LearningStep = {
  id: string;
  kind: 'LESSON' | 'PRACTICE' | 'RETRY';
  contentId: string;
  title: string;
  url: string;
  concept: string;
  reason: string;
  stage: number;
};
export type LearningPath = {
  id: number | null;
  rulesVersion: number;
  asOf: string;
  generatedAt: string | null;
  profile: LearningProfile;
  source: 'NONE' | 'PENDING' | 'AI' | 'RULES';
  stale: boolean;
  generating: boolean;
  evidence: { concept: string; attempted: number; unresolved: number; resolved: number; hintedUnresolved: number; score: number; evidence: string }[];
  steps: LearningStep[];
  notice: string;
};
const endpoint = `${config.apiUrl}/api/learning-path`;
const LearningPathApi = {
  get: async (profile: LearningProfile): Promise<LearningPath | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.get<LearningPath>(endpoint, { params: profile })).data;
    } catch (error) {
      return toApiError(error, '학습 경로를 불러오지 못했습니다.');
    }
  },
  generate: async (profile: LearningProfile, refresh: boolean): Promise<LearningPath | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.post<LearningPath>(endpoint, { ...profile, refresh })).data;
    } catch (error) {
      return toApiError(error, '학습 경로를 만들지 못했습니다. 잠시 후 다시 요청해주세요.');
    }
  },
};
export default LearningPathApi;
