import type { CodeReviewApiError } from '../CodeReviewApi/CodeReviewApiType';

import AxiosInstance from '../../AxiosInstance';
import config from '../../config';
import { toApiError } from '../CodeReviewApi/CodeReviewApi';

export type GithubRepo = {
  id: number;
  githubRepoId: number;
  owner: string;
  name: string;
  defaultBranch: string | null;
  selected: boolean;
};
export type GithubConnection = {
  loggedIn: boolean;
  githubLogin: string | null;
  installed: boolean;
  installationAccountLogin: string | null;
  repositories: GithubRepo[];
  manageUrl: string;
  writePermissionGranted: boolean;
  writePermissionUpgradeUrl: string | null;
};
export type AllowedRepoRef = { owner: string; repo: string; headSha: string | null };
export type EvidenceRef = {
  owner: string;
  repo: string;
  path: string;
  commitSha: string | null;
  lineStart: number | null;
  lineEnd: number | null;
};
export type ConfirmedItem = { concept: string; evidenceSummary: string; evidenceRefs: EvidenceRef[]; limits: string };
export type GapItem = { concept: string; note: string };
export type RecommendedTopic = {
  concept: string;
  reason: string;
  supported: boolean;
  lessonUrl: string | null;
  lessonTitle: string | null;
  challengeUrl: string | null;
  challengeTitle: string | null;
};
export type ActualScope = {
  reposAnalyzed: AllowedRepoRef[];
  listDirectoryCalls: number;
  fileReadCalls: number;
  commitCalls: number;
  truncated: boolean;
};
export type AnalysisStatus = 'NONE' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type GithubAnalysis = {
  id: number | null;
  status: AnalysisStatus;
  repos: AllowedRepoRef[];
  requestedAt: string | null;
  completedAt: string | null;
  generating: boolean;
  confirmed: ConfirmedItem[];
  gaps: GapItem[];
  recommendedTopics: RecommendedTopic[];
  scopeNote: string | null;
  actualScope: ActualScope | null;
  errorMessage: string | null;
  notice: string | null;
};

export type AutoSaveSetting = {
  configured: boolean;
  enabled: boolean;
  repositoryId: number | null;
  owner: string | null;
  name: string | null;
  branch: string | null;
  basePath: string;
  writePermissionGranted: boolean;
  writePermissionUpgradeUrl: string | null;
};
export type AutoCommitPreview = { path: string; solutionFileName: string; solutionContent: string; readmePreview: string };
export type AutoCommitJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
export type AutoCommitJob = {
  id: number;
  judgmentId: number;
  challengeId: number;
  status: AutoCommitJobStatus;
  errorCategory: string | null;
  errorMessage: string | null;
  owner: string;
  name: string;
  branch: string;
  path: string;
  commitSha: string | null;
  commitUrl: string | null;
  createdAt: string;
  updatedAt: string;
  attemptCount: number;
};

const endpoint = `${config.apiUrl}/api/github`;
const autoSaveEndpoint = `${endpoint}/auto-save`;

const GithubApi = {
  connection: async (): Promise<GithubConnection | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.get<GithubConnection>(`${endpoint}/connection`)).data;
    } catch (error) {
      return toApiError(error, 'GitHub 연결 상태를 불러오지 못했습니다.');
    }
  },
  disconnect: async (): Promise<true | CodeReviewApiError> => {
    try {
      await AxiosInstance.delete(`${endpoint}/connection`);
      return true;
    } catch (error) {
      return toApiError(error, '연결을 해제하지 못했습니다.');
    }
  },
  oauthStartUrl: async (): Promise<string | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.get<{ url: string }>(`${endpoint}/oauth/start`)).data.url;
    } catch (error) {
      return toApiError(error, 'GitHub 로그인을 시작하지 못했습니다.');
    }
  },
  installStartUrl: async (): Promise<string | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.get<{ url: string }>(`${endpoint}/install/start`)).data.url;
    } catch (error) {
      return toApiError(error, '저장소 접근 권한 연결을 시작하지 못했습니다.');
    }
  },
  selectRepositories: async (repoIds: number[]): Promise<GithubConnection | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.post<GithubConnection>(`${endpoint}/repositories/select`, { repoIds })).data;
    } catch (error) {
      return toApiError(error, '저장소 선택을 저장하지 못했습니다.');
    }
  },
  refreshRepositories: async (): Promise<GithubConnection | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.post<GithubConnection>(`${endpoint}/repositories/refresh`)).data;
    } catch (error) {
      return toApiError(error, '저장소 목록을 새로고침하지 못했습니다.');
    }
  },
  requestAnalysis: async (): Promise<GithubAnalysis | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.post<GithubAnalysis>(`${endpoint}/analysis`)).data;
    } catch (error) {
      return toApiError(error, '분석을 요청하지 못했습니다.');
    }
  },
  latestAnalysis: async (): Promise<GithubAnalysis | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.get<GithubAnalysis>(`${endpoint}/analysis/latest`)).data;
    } catch (error) {
      return toApiError(error, '분석 결과를 불러오지 못했습니다.');
    }
  },
  cancelAnalysis: async (id: number): Promise<GithubAnalysis | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.post<GithubAnalysis>(`${endpoint}/analysis/${id}/cancel`)).data;
    } catch (error) {
      return toApiError(error, '분석을 취소하지 못했습니다.');
    }
  },
  refreshWritePermission: async (): Promise<GithubConnection | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.post<GithubConnection>(`${endpoint}/write-permission/refresh`)).data;
    } catch (error) {
      return toApiError(error, '쓰기 권한 상태를 다시 확인하지 못했습니다.');
    }
  },
  autoSaveSettings: async (): Promise<AutoSaveSetting | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.get<AutoSaveSetting>(`${autoSaveEndpoint}/settings`)).data;
    } catch (error) {
      return toApiError(error, '자동 저장 설정을 불러오지 못했습니다.');
    }
  },
  saveAutoSaveSettings: async (repositoryId: number, branch: string, basePath: string): Promise<AutoSaveSetting | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.put<AutoSaveSetting>(`${autoSaveEndpoint}/settings`, { repositoryId, branch, basePath })).data;
    } catch (error) {
      return toApiError(error, '자동 저장 설정을 저장하지 못했습니다.');
    }
  },
  enableAutoSave: async (): Promise<AutoSaveSetting | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.post<AutoSaveSetting>(`${autoSaveEndpoint}/enable`)).data;
    } catch (error) {
      return toApiError(error, '자동 저장을 켜지 못했습니다.');
    }
  },
  disableAutoSave: async (): Promise<AutoSaveSetting | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.post<AutoSaveSetting>(`${autoSaveEndpoint}/disable`)).data;
    } catch (error) {
      return toApiError(error, '자동 저장을 끄지 못했습니다.');
    }
  },
  autoSavePreview: async (): Promise<AutoCommitPreview | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.get<AutoCommitPreview>(`${autoSaveEndpoint}/preview`)).data;
    } catch (error) {
      return toApiError(error, '미리보기를 불러오지 못했습니다.');
    }
  },
  autoSaveJobs: async (): Promise<AutoCommitJob[] | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.get<AutoCommitJob[]>(`${autoSaveEndpoint}/jobs`)).data;
    } catch (error) {
      return toApiError(error, '작업 기록을 불러오지 못했습니다.');
    }
  },
  retryAutoSaveJob: async (id: number): Promise<AutoCommitJob | CodeReviewApiError> => {
    try {
      return (await AxiosInstance.post<AutoCommitJob>(`${autoSaveEndpoint}/jobs/${id}/retry`)).data;
    } catch (error) {
      return toApiError(error, '작업을 다시 시도하지 못했습니다.');
    }
  },
};
export default GithubApi;
