// 백엔드 AskChatbotRequest / ChatbotAnswerResponse 와 같은 모양

export type AskChatbotRequest = {
  question: string;
  language?: string; // 지정하면 해당 언어 학습 자료로만 검색 범위를 제한
  // 챗봇 위젯이 열려 있는 동안 한 번 생성해서 매 질문마다 같이 보내는 값.
  // 백엔드가 이 값으로 이전 턴들을 불러와 멀티턴 대화로 이어간다 (RagChatbotService 참고).
  sessionId?: string;
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
