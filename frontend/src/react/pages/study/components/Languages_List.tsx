import React from 'react';

import { useNavigate, useOutletContext } from 'react-router-dom';

import {
  ChapterOuter,
  ChapterInner,
  ChapterName,
  ChapterListTitle,
} from '../../../styles/study/Study_Components';
import { LanguageArrange, LanguageListProps, OutletContextType } from '../StudyType';

const Languages_List: React.FC<LanguageListProps> = ({ language }) => {
  const navigate = useNavigate();
  const mainContentRef = useOutletContext<OutletContextType>();

  const languages: LanguageArrange = [
    { name: 'Java' },
    { name: 'C' },
    { name: 'CPlus' },
    { name: 'JavaScript' },
    { name: 'Python' },
  ];

  const handleLanguageClick = (lang: string): void => {
    navigate(`/study/${lang.toLowerCase()}`);
    setTimeout(() => {
      if (mainContentRef?.current) {
        mainContentRef.current.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }, 0); // 0ms 뒤에 실행하여 확실하게 스크롤 이동
  };

  return (
    <>
      <ChapterOuter>
        <ChapterListTitle>📚 전체 언어 보기</ChapterListTitle>
        <ChapterInner>
          {languages.map((lang, index) => (
            <ChapterName
              key={index}
              onClick={() => handleLanguageClick(lang.name)} // 클릭 시 핸들러 호출
              style={{
                color:
                  lang.name.toLowerCase() === language?.toLowerCase()
                    ? 'var(--educoding-purple)'
                    : 'var(--educoding-white)',
                cursor: 'pointer',
              }}
            >
              {lang.name}
            </ChapterName>
          ))}
        </ChapterInner>
      </ChapterOuter>
    </>
  );
};

export default React.memo(Languages_List);
