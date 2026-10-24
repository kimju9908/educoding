import { JSX, useLayoutEffect, useState } from 'react';

import { useOutletContext } from 'react-router-dom';

import type { OutletContextType } from '../../MyPageType';

import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  PageSubTitleBar,
} from '../../../../styles/mypage/MyPage_Main';
import Board_PostList_MyPage from '../../components/Board/Community/Board_PostList_MyPage';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';

const MyPage_Community = (): JSX.Element => {
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(10);
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
            <PageTitleBar>작성한 게시글</PageTitleBar>
            <PageSubTitleBar>커뮤니티 게시판</PageSubTitleBar>
            <Board_PostList_MyPage page={page} size={size} onPageChange={handlePageChange} />
          </RightContainer>
        </Container>
      </Wrap>
    </>
  );
};

export default MyPage_Community;
