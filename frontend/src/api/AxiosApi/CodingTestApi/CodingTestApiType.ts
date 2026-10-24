export type ErrorDataType = {
  error?: string;
};

export type ChallengeSummaryType = {
  challengeId: number;
  title: string;
  category: string;
  difficulty: 'PRACTICE' | 'BASIC' | 'INTERMEDIATE' | 'EXPERT';
  passingRate: number;
  isUserPassedBefore: boolean | null;
};

export type GetChallengeDetailRequest = {
  challengeId: number;
};

export type GetChallengeDetailResponse = {
  title: string;
  description: string;
  cond: string;
  difficulty: 'PRACTICE' | 'BASIC' | 'INTERMEDIATE' | 'EXPERT';
  memoryLimitMb: number;
  timeLimitMs: number;
  lastSubmittedCode: string | null;
};

export type GetChallengeListRequest = {
  difficulty: 'practice' | 'basic' | 'intermediate' | 'expert' | null;
};

export type GetChallengeListResponse = {
  challengeSummaries: ChallengeSummaryType[];
};

export type ExecuteJobResponse = {
  totalTestCases: number;
  error: string;
};

export type CancelJobResponse = {
  success: boolean;
  error: string;
};

export type SubmitCodeRequest = {
  codeLanguage: string;
  code: string;
  challengeId: number;
};

export type SubmitCodeResponse = {
  jobId: string;
  error: string;
};
