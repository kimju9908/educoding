import { JSX, useLayoutEffect, useState } from 'react';

import { useOutletContext } from 'react-router-dom';

import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  PageSubTitleBar,
} from '../../../../styles/mypage/MyPage_Main';
import Board_MentorList_MyPage from '../../components/Board/Mentor/Board_MentorList_MyPage';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';
import { OutletContextType } from '../../MyPageType';

const MyPage_MentorList = (): JSX.Element => {
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(5);
  const mainContentRef = useOutletContext<OutletContextType>();

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  // 페이지 변경 함수 추가
  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  return (
    <>
      <Wrap>
        <Container>
          <LeftContainer>
            <LeftTopProfile />
            <LeftMenus />
          </LeftContainer>
          <RightContainer>
            <PageTitleBar>멘토링 전용 페이지</PageTitleBar>
            <PageSubTitleBar>내 멘토 보기</PageSubTitleBar>
            <Board_MentorList_MyPage page={page} size={size} onPageChange={handlePageChange} />
          </RightContainer>
        </Container>
      </Wrap>
    </>
  );
};

export default MyPage_MentorList;
