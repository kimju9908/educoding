import { JSX, useEffect } from 'react';

import { useOutletContext, useParams } from 'react-router-dom';

import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  MobileInner,
} from '../../../styles/exam/Exam_Main';
import Exam_Mock_Data from '../components/Exam_Mock_Data';
import Exam_Mock_Random_Data from '../components/Exam_Mock_Random_Data';
import Side_MockTestList from '../components/Side_MockTestList';
import Side_PreviousTestList from '../components/Side_PreviousTestList';
import { OutletContextType } from '../ExamType';

const Exam_MockTest = (): JSX.Element => {
  const mainContentRef = useOutletContext<OutletContextType>();
  const { chapter = '' } = useParams();
  const { testdate = '' } = useParams();

  // 페이지 진입 시 스크롤 위치 초기화
  useEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  return (
    <>
      <Wrap>
        <Container>
          <LeftContainer>
            <Side_MockTestList chapter={chapter} testdate={testdate} />
            <Side_PreviousTestList chapter={chapter} testdate={testdate} />
          </LeftContainer>
          <RightContainer>
            <PageTitleBar>정보처리기사</PageTitleBar>
            {chapter === 'random' ? (
              <Exam_Mock_Random_Data chapter={chapter} testdate={testdate} />
            ) : (
              <Exam_Mock_Data chapter={chapter} testdate={testdate} />
            )}
          </RightContainer>
          <MobileInner>
            <PageTitleBar>정보처리기사</PageTitleBar>
            {chapter === 'random' ? (
              <Exam_Mock_Random_Data chapter={chapter} testdate={testdate} />
            ) : (
              <Exam_Mock_Data chapter={chapter} testdate={testdate} />
            )}
          </MobileInner>
        </Container>
      </Wrap>
    </>
  );
};

export default Exam_MockTest;
