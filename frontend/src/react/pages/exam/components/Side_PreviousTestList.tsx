import { useNavigate, useOutletContext } from 'react-router-dom';

import {
  ChapterOuter,
  ChapterInner,
  ChapterName,
  ChapterListTitle,
} from '../../../styles/exam/Exam_Components';
import {
  ExamListProps,
  ExamTestDateArrange,
  ExamTestDateTypeObject,
  OutletContextType,
} from '../ExamType';

const Side_PreviousTestList: React.FC<ExamListProps> = ({ chapter, testdate }) => {
  const navigate = useNavigate();
  const mainContentRef = useOutletContext<OutletContextType>();

  const testdates: ExamTestDateArrange = [
    { name: '220424' },
    { name: '220305' },
    { name: '210814' },
    { name: '210515' },
    { name: '210307' },
    { name: '200926' },
    { name: '200822' },
    { name: '200606' },
  ];

  const dateNames: ExamTestDateTypeObject = {
    220424: '2022.04.24.',
    220305: '2022.03.05.',
    210814: '2021.08.14.',
    210515: '2021.05.15.',
    210307: '2021.03.07.',
    200926: '2020.09.26.',
    200822: '2020.08.22.',
    200606: '2020.06.06.',
  };

  const handleDateClick = (testdate: string): void => {
    navigate(`/exam/previous/${testdate}`);
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
        <ChapterListTitle>기출문제</ChapterListTitle>
        <ChapterInner>
          {testdates.map((td, index) => (
            <ChapterName
              key={index}
              onClick={() => handleDateClick(td.name)} // 클릭 시 핸들러 호출
              style={{
                color: td.name === testdate ? 'var(--educoding-purple)' : 'var(--educoding-white)',
                cursor: 'pointer',
              }}
            >
              {dateNames[td.name as keyof ExamTestDateTypeObject]}
            </ChapterName>
          ))}
        </ChapterInner>
      </ChapterOuter>
    </>
  );
};

export default Side_PreviousTestList;
