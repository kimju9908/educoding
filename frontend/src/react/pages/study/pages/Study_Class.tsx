import { useState, useEffect, JSX, useLayoutEffect, useRef } from 'react';

import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';

import type { StudyLesson } from '../../../../api/AxiosApi/StudyApi/StudyApiType';
import type { LanguageArrange, OutletContextType } from '../StudyType';

import StudyApi, { getStudyApiErrorMessage } from '../../../../api/AxiosApi/StudyApi/StudyApi';
import {
  ArrowContainer,
  ChapterListTitle,
  ChapterOuter,
} from '../../../styles/study/Study_Components';
import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  MobileInner,
  PageTitleBar,
} from '../../../styles/study/Study_Main';
import Languages_ArrowNavigation from '../components/Languages_ArrowNavigation';
import Languages_ChapterScrollNav from '../components/Languages_ChapterScrollNav';
import Languages_ClassList from '../components/Languages_ClassList';
import Languages_LessonMarkdown from '../components/Languages_LessonMarkdown';
import Languages_List from '../components/Languages_List';
import Languages_Title from '../components/Languages_Title';
import useStudyChapters from '../useStudyChapters';

type LessonState =
  | { status: 'loading' }
  | { status: 'ok'; lesson: StudyLesson }
  | { status: 'error'; message: string };

// "01. 변수와 자료형" → "변수와 자료형" (강의 상단 제목 바에는 번호 없이)
const lessonTitle = (label: string): string => label.replace(/^\s*\d+\.\s*/, '');

const Study_Class = (): JSX.Element => {
  const mainContentRef = useOutletContext<OutletContextType>();
  const { language, cat1, cat2 } = useParams();
  const [searchParams] = useSearchParams();
  const { chapters } = useStudyChapters(language);
  const navigate = useNavigate();
  const rightContainerRef = useRef<HTMLDivElement | null>(null);
  // 화면이 좁아 챕터 내비게이터가 본문 안쪽에 겹쳐 놓일 때, 본문이 가려지지 않게 오른쪽 여백 확보
  const [isScrollNavInset, setIsScrollNavInset] = useState(false);

  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [language, cat1, cat2, mainContentRef]);

  const languages: LanguageArrange = [
    { name: 'Java' },
    { name: 'C' },
    { name: 'CPlus' },
    { name: 'JavaScript' },
    { name: 'Python' },
  ];

  const currentLanguage = languages.find(
    (lang) => lang.name.toLowerCase() === language?.toLowerCase(),
  );

  // 강의 본문(마크다운)을 서버에서 불러옴
  const [lessonState, setLessonState] = useState<LessonState>({ status: 'loading' });

  useEffect(() => {
    if (!language || !cat1 || !cat2) return undefined;
    let cancelled = false;
    setLessonState({ status: 'loading' });
    StudyApi.getLesson(language.toLowerCase(), cat1, cat2)
      .then((lesson) => {
        if (!cancelled) setLessonState({ status: 'ok', lesson });
      })
      .catch((error) => {
        if (!cancelled)
          setLessonState({
            status: 'error',
            message: getStudyApiErrorMessage(error, '강의를 불러오지 못했어요.'),
          });
      });
    return (): void => {
      cancelled = true;
    };
  }, [language, cat1, cat2]);

  // 챗봇 답변 등에서 ?headingIndex=N으로 들어오면 해당 섹션으로 스크롤한다.
  // N은 Languages_LessonMarkdown이 각 제목에 매긴 data-heading-index와 같은 순서로,
  // rag/chunking/chunk_lessons.py가 같은 마크다운을 훑어 chunk.headingIndex로 저장한 값이다.
  useEffect(() => {
    if (lessonState.status !== 'ok') return;
    const headingIndex = searchParams.get('headingIndex');
    if (headingIndex === null) return;

    const frame = requestAnimationFrame(() => {
      const scroller = mainContentRef?.current;
      const target = rightContainerRef.current?.querySelector<HTMLElement>(
        `[data-heading-index="${headingIndex}"]`,
      );
      if (!scroller || !target) return;

      const elRect = target.getBoundingClientRect();
      const delta = elRect.top - scroller.getBoundingClientRect().top;
      const centerOffset = scroller.clientHeight / 2 - elRect.height / 2;
      scroller.scrollTo({ top: scroller.scrollTop + delta - centerOffset, behavior: 'smooth' });
    });
    return (): void => cancelAnimationFrame(frame);
  }, [lessonState, searchParams, mainContentRef]);

  const renderLesson = (): JSX.Element => {
    if (lessonState.status === 'ok') {
      return (
        <Languages_LessonMarkdown
          key={`${language}-${cat1}-${cat2}`}
          title={lessonTitle(lessonState.lesson.label)}
          content={lessonState.lesson.content}
        />
      );
    }
    return (
      <div
        style={{
          color: 'var(--educoding-white)',
          fontFamily: 'bold',
          textAlign: 'center',
          paddingTop: '50px',
          fontSize: '14px',
        }}
      >
        {lessonState.status === 'loading' ? '😇 데이터 가져오는중' : `😥 ${lessonState.message}`}
      </div>
    );
  };

  const handleLanguageClick = (): void => {
    navigate(`/study/${language}`);
  };

  return (
    <Wrap>
      <Container>
        <LeftContainer>
          {currentLanguage ? (
            <Languages_Title
              language={currentLanguage.name}
              key={`${currentLanguage.name}-${cat1}-${cat2}`}
            />
          ) : null}
          <Languages_ClassList
            language={currentLanguage?.name ?? 'Unknown'}
            selectedChapters={chapters}
            key={`${currentLanguage?.name}-${cat1}`}
            filtered={true}
          />
          <Languages_List language={language} />
          <ChapterOuter>
            <ChapterListTitle
              onClick={() => handleLanguageClick()}
              style={{ cursor: 'pointer', paddingBottom: '3px' }}
            >
              👉 {currentLanguage?.name} 메인으로 이동
            </ChapterListTitle>
          </ChapterOuter>
        </LeftContainer>
        <RightContainer
          ref={rightContainerRef}
          style={isScrollNavInset ? { paddingRight: '56px' } : undefined}
        >
                    {renderLesson()}
          <ArrowContainer>
            <Languages_ArrowNavigation direction="left" language={language} />
            <Languages_ArrowNavigation direction="right" language={language} />
          </ArrowContainer>
        </RightContainer>
        <Languages_ChapterScrollNav
          scrollRef={mainContentRef}
          contentRef={rightContainerRef}
          onInsetChange={setIsScrollNavInset}
        />

        <MobileInner>
          <PageTitleBar style={{ cursor: 'pointer' }} onClick={() => handleLanguageClick()}>
            언어공부 {currentLanguage?.name}
          </PageTitleBar>
          <Languages_ClassList
            language={currentLanguage?.name ?? 'Unknown'}
            selectedChapters={chapters}
            key={`${currentLanguage?.name}-${cat1}`}
            filtered={true}
          />
          {renderLesson()}
        </MobileInner>
      </Container>
    </Wrap>
  );
};

export default Study_Class;
