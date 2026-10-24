import { JSX, useLayoutEffect, useState } from 'react';

import { useOutletContext } from 'react-router-dom';

import {
  TopSortInnerContainer,
  TopSortOuterContiner,
  TopSortTitleActive,
  TopSortTitleInactive,
} from '../../../../styles/community/Community_Board';
import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  PageSubTitleBar,
} from '../../../../styles/mypage/MyPage_Main';
import Board_PostList_MyPage_Report from '../../components/Board/Report/Board_PostList_MyPage_Report';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';
import { OutletContextType } from '../../MyPageType';

// Board_TopSort 스타일 가져오기

const MyPage_Report = (): JSX.Element => {
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(10);
  const [status, setStatus] = useState<string>('ACTIVE'); // 기본값: 미해결
  const mainContentRef = useOutletContext<OutletContextType>();

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  // 정렬 버튼 클릭 시 status 값 변경
  const handleSortChange = (newStatus: string): void => {
    setStatus(newStatus);
    setPage(1); // 정렬 변경 시 첫 페이지로 이동
  };

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
            <PageSubTitleBar style={{ borderBottom: '1px solid var(--educoding-line' }}>
              악성 사용자 신고
            </PageSubTitleBar>
            {/* <CenterContainerTitle>악성 사용자 신고</CenterContainerTitle> */}
            {/* 정렬 버튼을 Board_TopSort 스타일로 변경 */}
            <TopSortOuterContiner>
              <TopSortInnerContainer>
                {status === 'ACTIVE' ? (
                  <TopSortTitleActive onClick={() => handleSortChange('ACTIVE')}>
                    미해결
                  </TopSortTitleActive>
                ) : (
                  <TopSortTitleInactive onClick={() => handleSortChange('ACTIVE')}>
                    미해결
                  </TopSortTitleInactive>
                )}
                {status === 'INACTIVE' ? (
                  <TopSortTitleActive onClick={() => handleSortChange('INACTIVE')}>
                    해결완료
                  </TopSortTitleActive>
                ) : (
                  <TopSortTitleInactive onClick={() => handleSortChange('INACTIVE')}>
                    해결완료
                  </TopSortTitleInactive>
                )}
              </TopSortInnerContainer>
            </TopSortOuterContiner>

            <Board_PostList_MyPage_Report
              page={page}
              size={size}
              status={status} // status 값 전달
              onPageChange={handlePageChange}
            />
          </RightContainer>
        </Container>

      </Wrap>
    </>
  );
};

export default MyPage_Report;
