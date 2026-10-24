export type OutletContextType = React.RefObject<HTMLDivElement>;

export type ExamListProps = {
  chapter: string;
  testdate: string;
};

export type ExamChapterArrange = Record<string, string>[];

export type ExamTestDateArrange = Record<string, string>[];

export type ExamChapterTypeObject = Record<string, string>;

export type ExamTestDateTypeObject = {
  [key: string]: string; // 이 라인이 추가된 부분
  220424: string;
  220305: string;
  210814: string;
  210515: string;
  210307: string;
  200926: string;
  200822: string;
  200606: string;
};

export type ExamResponse<T> = {
  // data: T;
  data: T[];
  message: string;
};

export type AnswerVisibility = Record<number, boolean>;

export type SelectedAnswers = Record<number, string>;
