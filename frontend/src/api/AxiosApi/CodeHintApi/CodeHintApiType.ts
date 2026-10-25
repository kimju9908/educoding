// backend dto/response/CodeHintContent.java, CodeHintStateResponse.java, HintSubmissionResponse.java 와 같은 구조

export type CodeHintStatus = 'READY' | 'GENERATING' | 'FAILED';

export type CodeHintLesson = { chunkId: string; title: string; url: string };

// 단계마다 채워지는 필드가 다르다 (1: concepts/guidingQuestions, 2: approach/dataStructures, 3: steps/pseudocode)
export type CodeHintContent = {
  level: number;
  summary: string;
  concepts: string[];
  guidingQuestions: string[];
  approach: string | null;
  dataStructures: { name: string; reason: string }[];
  steps: string[];
  pseudocode: string | null;
  // 오답 제출 기준 힌트에서만. speculative=true면 추정
  failureInsight: { text: string; speculative: boolean } | null;
  lessons: CodeHintLesson[];
};

export type CodeHintItem = {
  level: number;
  content: CodeHintContent | null;
  revealedAt: string;
  judgmentId: number | null;
  question: string | null;
};

export type CodeHintState = {
  // 아직 힌트를 요청한 적 없으면 null
  attemptId: number | null;
  challengeId: number;
  // 오답 제출 기준이면 그 제출, 제출 전(문제 조건만) 기준이면 null
  judgmentId: number | null;
  revealedLevel: number;
  maxLevel: number;
  status: CodeHintStatus;
  // 생성 중이거나 실패한 다음 단계
  pendingLevel: number | null;
  errorMessage: string | null;
  hints: CodeHintItem[];
};

export type HintSubmission = {
  judgmentId: number;
  submittedAt: string;
  language: string;
  failureCause: string | null;
};

export type CodeHintRequest = {
  challengeId: number;
  judgmentId: number | null;
  level: number;
  // CodeChallengeLanguage (제출 전 힌트의 관련 강의 검색용)
  language: string | null;
  question: string | null;
};
