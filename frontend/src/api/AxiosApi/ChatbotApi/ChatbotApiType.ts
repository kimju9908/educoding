// 백엔드 AskChatbotRequest / ChatbotAnswerResponse 와 같은 모양

export type AskChatbotRequest = {
  question: string;
  language?: string; // 지정하면 해당 언어 학습 자료로만 검색 범위를 제한
};

export type ChatbotSource = {
  language: string;
  chapterTitle: string;
  lessonLabel: string;
  heading: string;
  headingIndex: number;
  // 프론트 라우트 기준 상대 경로. 예: /study/java/08/03?headingIndex=13
  // -> 해당 레슨 페이지로 이동 후 headingIndex가 가리키는 섹션까지 자동 스크롤
  url: string;
  score: number;
};

export type ChatbotAnswer = {
  answer: string;
  sources: ChatbotSource[];
};
