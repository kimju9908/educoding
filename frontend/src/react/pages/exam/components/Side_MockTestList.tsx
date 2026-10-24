import { useNavigate, useOutletContext } from 'react-router-dom';

import {
  ChapterOuter,
  ChapterInner,
  ChapterName,
  ChapterListTitle,
} from '../../../styles/exam/Exam_Components';
import {
  ExamChapterArrange,
  ExamListProps,
  ExamChapterTypeObject,
  OutletContextType,
} from '../ExamType';

const Side_MockTestList: React.FC<ExamListProps> = ({ chapter, testdate }) => {
  const navigate = useNavigate();
  const mainContentRef = useOutletContext<OutletContextType>();

  const chapters: ExamChapterArrange = [
    { name: 'random' },
    { name: '01' },
    { name: '02' },
    { name: '03' },
    { name: '04' },
    { name: '05' },
  ];

  const chapterNames: ExamChapterTypeObject = {
    random: '랜덤문제풀이',
    '01': '01. 소프트웨어 설계',
    '02': '02. 소프트웨어 개발',
    '03': '03. 데이터베이스 구축',
    '04': '04. 프로그래밍 언어 활용',
    '05': '05. 정보시스템 구축관리',
  };

  const handleChapterClick = (chapter: string): void => {
    navigate(`/exam/mock/${chapter}`);
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
        <ChapterListTitle>모의시험</ChapterListTitle>
        <ChapterInner>
          {chapters.map((cpt, index) => (
            <ChapterName
              key={index}
              onClick={() => handleChapterClick(cpt.name)} // 클릭 시 핸들러 호출
              style={{
                color: cpt.name === chapter ? 'var(--educoding-purple)' : 'var(--educoding-white)',
                cursor: 'pointer',
              }}
            >
              {chapterNames[cpt.name]}
            </ChapterName>
          ))}
        </ChapterInner>
      </ChapterOuter>
    </>
  );
};

export default Side_MockTestList;
