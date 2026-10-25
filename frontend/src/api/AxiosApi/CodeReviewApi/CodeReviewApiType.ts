// backend dto/response/CodeReviewContent.java, CodeReviewResponse.java, ReviewTargetResponse.java 와 같은 구조

export type CodeReviewStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type CodeReviewImprovement = {
  kind: 'suggestion' | 'bug';
  title: string;
  lineStart: number;
  lineEnd: number;
  detail: string;
  exampleCode: string | null;
};

export type CodeReviewContent = {
  summary: string;
  strengths: string[];
  complexity: { time: string; space: string; assumptions: string[] };
  observedMetrics: { maxElapsedTimeMs: number | null; maxMemoryUsageMb: number | null };
  improvements: CodeReviewImprovement[];
  lessons: { chunkId: string; title: string; url: string }[];
};

export type CodeReviewResponse = {
  judgmentId: number;
  reviewVersion: number;
  // null: 아직 리뷰를 요청한 적 없는 제출
  status: CodeReviewStatus | null;
  review: CodeReviewContent | null;
  errorMessage: string | null;
};

export type ReviewTargetResponse = {
  judgmentId: number;
  challengeId: number;
  passed: boolean;
};

// 요청 실패 정보 (status: HTTP 상태 코드, 응답이 없으면 0)
export type CodeReviewApiError = {
  error: string;
  status: number;
};
