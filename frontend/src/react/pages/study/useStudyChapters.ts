import { useEffect, useState } from 'react';

import type { StudyChapter } from '../../../api/AxiosApi/StudyApi/StudyApiType';

import StudyApi from '../../../api/AxiosApi/StudyApi/StudyApi';

// 같은 페이지의 여러 컴포넌트(목록, 이전/다음 화살표 등)가 같은 언어의 챕터를 쓰므로
// 언어별로 한 번만 불러오고 요청 자체를 공유한다.
const cache = new Map<string, Promise<StudyChapter[]>>();

const loadChapters = (language: string): Promise<StudyChapter[]> => {
  const key = language.toLowerCase();
  let request = cache.get(key);
  if (!request) {
    request = StudyApi.getChapters(key).catch((error) => {
      cache.delete(key); // 실패한 요청은 캐시에 남기지 않아 다음에 다시 시도
      throw error;
    });
    cache.set(key, request);
  }
  return request;
};

// 관리자 페이지에서 챕터/강의를 수정한 뒤 호출 → 다음 조회 때 새로 불러옴
export const invalidateStudyChapters = (language?: string): void => {
  if (language) cache.delete(language.toLowerCase());
  else cache.clear();
};

type UseStudyChaptersResult = {
  chapters: StudyChapter[];
  loading: boolean;
  error: boolean;
};

const useStudyChapters = (language: string | undefined): UseStudyChaptersResult => {
  const [state, setState] = useState<UseStudyChaptersResult>({
    chapters: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    if (!language) {
      setState({ chapters: [], loading: false, error: false });
      return undefined;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: false }));
    loadChapters(language)
      .then((chapters) => {
        if (!cancelled) setState({ chapters, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ chapters: [], loading: false, error: true });
      });
    return (): void => {
      cancelled = true;
    };
  }, [language]);

  return state;
};

export default useStudyChapters;
