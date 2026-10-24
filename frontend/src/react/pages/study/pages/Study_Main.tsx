import { JSX, useLayoutEffect, useRef, useState } from 'react';

import { useOutletContext, useParams } from 'react-router-dom';

import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  MobileInner,
} from '../../../styles/study/Study_Main';
import Languages_ChapterScrollNav from '../components/Languages_ChapterScrollNav';
import Languages_ClassList from '../components/Languages_ClassList';
import Languages_List from '../components/Languages_List';
import Languages_Title from '../components/Languages_Title';
import { LanguageArrange, OutletContextType } from '../StudyType';
import useStudyChapters from '../useStudyChapters';

// 언어 메인 페이지: "01. Java 시작" 같은 챕터 헤더 + 그 안의 강의 항목을 트랙에 표시
const MAIN_HEADING_SELECTOR = '[id="classheadertitle"], [id="classname"]';
const MAIN_CHAPTER_IDS = ['classheadertitle'];

const Study_Main = (): JSX.Element => {
  const mainContentRef = useOutletContext<OutletContextType>();
  const { language } = useParams(); // url language 가져오기
  const { chapters } = useStudyChapters(language);

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [language, mainContentRef]);

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

  const rightContainerRef = useRef<HTMLDivElement | null>(null);
  // 화면이 좁아 챕터 내비게이터가 목록 안쪽에 붙을 때, 목록이 가려지지 않게 오른쪽 여백 확보
  const [isScrollNavInset, setIsScrollNavInset] = useState(false);


  return (
    <>
      <Wrap>
        <Container className="StudyMain">
          <LeftContainer>
            {currentLanguage ? (
              <Languages_Title language={currentLanguage.name} key={currentLanguage.name} />
            ) : null}
            <Languages_List language={language} />
          </LeftContainer>
          <RightContainer
            ref={rightContainerRef}
            style={isScrollNavInset ? { paddingRight: '56px' } : undefined}
          >
            <PageTitleBar>언어공부 {currentLanguage?.name}</PageTitleBar>
            <Languages_ClassList
              language={currentLanguage?.name ?? 'Unknown'}
              selectedChapters={chapters}
              key={currentLanguage?.name ?? 'Unknown'}
            />
          </RightContainer>
          <Languages_ChapterScrollNav
            scrollRef={mainContentRef}
            contentRef={rightContainerRef}
            onInsetChange={setIsScrollNavInset}
            headingSelector={MAIN_HEADING_SELECTOR}
            chapterIds={MAIN_CHAPTER_IDS}
          />

          <MobileInner>
            <PageTitleBar>언어공부 {currentLanguage?.name}</PageTitleBar>
            {currentLanguage ? (
              <Languages_Title
                language={currentLanguage.name}
                key={`${currentLanguage.name}_MOTITLE`} // key에 'MO' 추가
              />
            ) : null}
            <Languages_ClassList
              language={currentLanguage?.name ?? 'Unknown'}
              selectedChapters={chapters}
              key={`${currentLanguage?.name}_MOCLASSLIST`} // key에 'MO' 추가
            />
          </MobileInner>
        </Container>
      </Wrap>
    </>
  );
};

export default Study_Main;
