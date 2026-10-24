import { AxiosError } from 'axios';

import type {
  StudyChapter,
  StudyChapterRequest,
  StudyLesson,
  StudyLessonRequest,
} from './StudyApiType';

import AxiosInstance from '../../AxiosInstance';
import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`;

// 서버가 내려준 메시지({ message })가 있으면 그걸, 없으면 기본 문구
export const getStudyApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    if (!error.response) return '서버가 응답하지 않습니다. 네트워크 연결 상태를 확인해주세요.';
    const message = (error.response.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  return fallback;
};

const StudyApi = {
  // ── 조회 (누구나) ──
  getChapters: async (language: string): Promise<StudyChapter[]> => {
    const response = await AxiosInstance.get<StudyChapter[]>(
      `${SPRING_DOMAIN}/study/content/${language}/chapters`,
    );
    return response.data;
  },

  getLesson: async (language: string, chapterKey: string, lessonKey: string): Promise<StudyLesson> => {
    const response = await AxiosInstance.get<StudyLesson>(
      `${SPRING_DOMAIN}/study/content/${language}/${chapterKey}/${lessonKey}`,
    );
    return response.data;
  },

  // ── 관리자 ──
  createChapter: async (request: StudyChapterRequest): Promise<StudyChapter> => {
    const response = await AxiosInstance.post<StudyChapter>(
      `${SPRING_DOMAIN}/admin/study/chapters`,
      request,
    );
    return response.data;
  },

  updateChapter: async (chapterId: number, request: StudyChapterRequest): Promise<StudyChapter> => {
    const response = await AxiosInstance.put<StudyChapter>(
      `${SPRING_DOMAIN}/admin/study/chapters/${chapterId}`,
      request,
    );
    return response.data;
  },

  deleteChapter: async (chapterId: number): Promise<void> => {
    await AxiosInstance.delete(`${SPRING_DOMAIN}/admin/study/chapters/${chapterId}`);
  },

  getLessonById: async (lessonId: number): Promise<StudyLesson> => {
    const response = await AxiosInstance.get<StudyLesson>(
      `${SPRING_DOMAIN}/admin/study/lessons/${lessonId}`,
    );
    return response.data;
  },

  createLesson: async (request: StudyLessonRequest): Promise<StudyLesson> => {
    const response = await AxiosInstance.post<StudyLesson>(
      `${SPRING_DOMAIN}/admin/study/lessons`,
      request,
    );
    return response.data;
  },

  updateLesson: async (lessonId: number, request: StudyLessonRequest): Promise<StudyLesson> => {
    const response = await AxiosInstance.put<StudyLesson>(
      `${SPRING_DOMAIN}/admin/study/lessons/${lessonId}`,
      request,
    );
    return response.data;
  },

  deleteLesson: async (lessonId: number): Promise<void> => {
    await AxiosInstance.delete(`${SPRING_DOMAIN}/admin/study/lessons/${lessonId}`);
  },
};

export default StudyApi;
