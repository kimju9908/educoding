import { JSX } from 'react';

import { ChallengeSummaryType } from '../../../api/AxiosApi/CodingTestApi/CodingTestApiType';

export type OutletContextType = React.RefObject<HTMLDivElement>;

export type LevelTypeArray = {
  name: string;
}[];

export type LevelTypeObject = {
  practice: string;
  basic: string;
  intermediate: string;
  expert: string;
};

export type LevelTitleProps = {
  level: string;
};

export type LevelExplainProps = {
  level: string | undefined;
};

export type LevelListProps = {
  level: string | undefined;
};

export type QuestListProps = {
  level: string | undefined;
};

export type ProgressValueType = {
  practice: number;
  basic: number;
  intermediate: number;
  expert: number;
};

export type UseSSEProps = {
  jobId: string | null;
  onOpen: (num: number) => void;
  onMessage: (data: SSETestCaseResult) => void;
  onError: (errorMessage: string) => void;
  onComplete: () => void;
};

export type FailureCauseType =
  | 'COMPILE_ERROR'
  | 'COMPILE_TIMEOUT'
  | 'COMPILE_OUT_OF_MEMORY'
  | 'RUNTIME_ERROR'
  | 'RUNTIME_TIMEOUT'
  | 'RUNTIME_OUT_OF_MEMORY'
  | 'WRONG_ANSWER'
  | 'SANDBOX_TIMEOUT'
  | 'SANDBOX_OUT_OF_MEMORY';

export const FailureCauseMap: Record<FailureCauseType, string> = {
  COMPILE_ERROR: '컴파일 에러!',
  RUNTIME_ERROR: '런타임 에러!',
  COMPILE_TIMEOUT: '컴파일 최대 허용 시간 초과!',
  RUNTIME_TIMEOUT: '실행 시간 제한 초과!',
  SANDBOX_TIMEOUT: '채점 최대 허용 시간 초과!',
  COMPILE_OUT_OF_MEMORY: '메모리 제한 초과!',
  RUNTIME_OUT_OF_MEMORY: '메모리 제한 초과!',
  SANDBOX_OUT_OF_MEMORY: '메모리 제한 초과!',
  WRONG_ANSWER: '오답입니다!',
} as const;

export type SSETestCaseResult = {
  passed: boolean;
  testCaseIndex: number | null;
  elapsedTimeMs: number | null;
  memoryUsageMb: number | null;
  failureCause: FailureCauseType | null;
  failureDetail: string | null;
};

export type TestCaseResultWithoutIndex = Omit<SSETestCaseResult, 'testCaseIndex'>;

export type TestCaseResultMap = Record<number, TestCaseResultWithoutIndex | {}>;

export type CodeChallengeInfoProps = {
  level: string | undefined;
  setHeaderTitle: React.Dispatch<React.SetStateAction<string>>;
  setCodeEditorValue: React.Dispatch<React.SetStateAction<string>>;
};

export type CodeResultProps = {
  results: TestCaseResultMap | null;
};

export type CodeResultConsoleProps = {
  message: string | undefined;
};

export type CodeEditorProps = {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  handleSubmitButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  handleCancelButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  isConnectedRef: React.RefObject<boolean>;
};

export type CommonType = LevelTypeObject | ProgressValueType;

export const Difficulty_levels = ['practice', 'basic', 'intermediate', 'expert'] as const;
export type Difficulty = (typeof Difficulty_levels)[number];

export type ChallengeGroup = Record<string, ChallengeSummaryType[]>;

export type ChallengeExample = Record<string, JSX.Element>;
