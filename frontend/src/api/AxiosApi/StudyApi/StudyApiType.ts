// 백엔드 StudyChapterResponse / StudyLessonResponse 와 같은 모양
// (id / title / contents[label, navigatepath, thirdpath]는 예전 하드코딩 ChapterType과 호환)

export type StudyLessonSummary = {
  lessonId: number;
  lessonKey: string;
  label: string;
  sortOrder: number;
  navigatepath: string;
  thirdpath: string;
  hasContent: boolean;
};

export type StudyChapter = {
  chapterId: number;
  id: string; // chapterKey ("02")
  title: string;
  sortOrder: number;
  contents: StudyLessonSummary[];
};

export type StudyLesson = {
  lessonId: number;
  chapterId: number;
  language: string;
  chapterKey: string;
  chapterTitle: string;
  lessonKey: string;
  label: string;
  sortOrder: number;
  content: string; // 마크다운 (빈 문자열이면 준비 중)
  updatedAt: string | null;
};

export type StudyChapterRequest = {
  language?: string;
  chapterKey?: string;
  title?: string;
  sortOrder?: number;
};

export type StudyLessonRequest = {
  chapterId?: number;
  lessonKey?: string;
  label?: string;
  sortOrder?: number;
  content?: string;
};
