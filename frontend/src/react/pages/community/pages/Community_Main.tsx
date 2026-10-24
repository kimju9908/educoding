import { JSX, useLayoutEffect, useState } from 'react';

import { useLocation, useOutletContext, useParams } from 'react-router-dom';

import Board_PostList from './Board_PostList';
import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  BoardContainer,
} from '../../../styles/community/Community_Main';
import { CourseType, LanguageType, OutletContextType, StudyType, TeamType } from '../CommunityType';
import Board_Coding_Search from '../components/coding/Board_Coding_Search';
import Board_Order from '../components/common/board/Board_Order';
import Boards_Title from '../components/common/board/Board_Title';
import Board_TopSort from '../components/common/board/Board_TopSort';
import Board_WriteButton from '../components/common/board/Board_WriteButton';
import Side_BoardList from '../components/common/side/Side_BoardList';
import Side_CodingPopularTags from '../components/common/side/Side_Coding_PopularTags';
import Side_CoursePopularTags from '../components/common/side/Side_Course_PopularTags';
import Side_StudyPopularTags from '../components/common/side/Side_Study_PopularTags';
import Side_TeamPopularTags from '../components/common/side/Side_Team_PopularTags';
import TopWriters from '../components/common/side/Side_TopWriters';
import WeeklyBest from '../components/common/side/Side_WeeklyBest';
import Board_Course_Search from '../components/course/Board_Course_Search';
import Board_Study_Search from '../components/study/Board_Study_Search';
import Board_Team_Search from '../components/team/Board_Team_Search';

const Community_Main = (): JSX.Element => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  // Pagination and sorting params
  const [page] = useState<number | string>(queryParams.get('page') || 1);
  const [size] = useState<number | string>(queryParams.get('size') || 10);
  const [sortBy, setSortBy] = useState<string>(queryParams.get('sortBy') || 'createdAt');
  const [order] = useState<string>(queryParams.get('order') || 'desc');
  const [status, setStatus] = useState<string | null>(queryParams.get('status') || null);
  const [enumFilter, setEnumFilter] = useState<
    LanguageType | StudyType | TeamType | CourseType | null
  >(null);
  const [search, setSearch] = useState<string | null>(queryParams.get('search') || null);
  const { boardType } = useParams<string>();

  const mainContentRef = useOutletContext<OutletContextType>();

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  const handleEnumFilterRefresh = (): void => {
    setEnumFilter(null);
  };

  const handleEnumFilterChange = (
    newEnumFilter: LanguageType | StudyType | TeamType | CourseType | null,
  ): void => {
    setEnumFilter(newEnumFilter);
  };

  return (
    <Wrap>
      <Container>
        <LeftContainer>
          <Boards_Title boardType={boardType} />
          <Side_BoardList boardType={boardType} />
          {boardType === 'coding' ? (
            <Side_CodingPopularTags
              enumFilter={enumFilter}
              onEnumFilterChange={handleEnumFilterChange}
            />
          ) : boardType === 'course' ? (
            <Side_CoursePopularTags
              enumFilter={enumFilter}
              onEnumFilterChange={handleEnumFilterChange}
            />
          ) : boardType === 'study' ? (
            <Side_StudyPopularTags
              enumFilter={enumFilter}
              onEnumFilterChange={handleEnumFilterChange}
            />
          ) : boardType === 'team' ? (
            <Side_TeamPopularTags
              enumFilter={enumFilter}
              onEnumFilterChange={handleEnumFilterChange}
            />
          ) : null}
          <WeeklyBest />
          <TopWriters />
        </LeftContainer>
        <RightContainer>
          <PageTitleBar>
            {boardType === 'coding'
              ? '코딩 질문 게시판'
              : boardType === 'course'
                ? '진로 질문 게시판'
                : boardType === 'study'
                  ? '스터디 게시판'
                  : boardType === 'team' && '팀 프로젝트 게시판'}
          </PageTitleBar>
          <BoardContainer>
            <Board_TopSort onStatusChange={setStatus} boardType={boardType} />
            {boardType === 'coding' ? (
              <Board_Coding_Search
                onEnumFilterRefresh={handleEnumFilterRefresh}
                onSearchChange={setSearch}
                enumFilter={enumFilter}
              />
            ) : boardType === 'course' ? (
              <Board_Course_Search
                onEnumFilterRefresh={handleEnumFilterRefresh}
                onSearchChange={setSearch}
                enumFilter={enumFilter}
              />
            ) : boardType === 'study' ? (
              <Board_Study_Search
                onEnumFilterRefresh={handleEnumFilterRefresh}
                onSearchChange={setSearch}
                enumFilter={enumFilter}
              />
            ) : boardType === 'team' ? (
              <Board_Team_Search
                onEnumFilterRefresh={handleEnumFilterRefresh}
                onSearchChange={setSearch}
                enumFilter={enumFilter}
              />
            ) : null}
            <Board_Order boardType={boardType} onSortChange={setSortBy} />
            <Board_PostList
              boardType={boardType}
              page={page}
              size={size}
              sortBy={sortBy}
              order={order}
              status={status}
              enumFilter={enumFilter}
              search={search}
            />
          </BoardContainer>
        </RightContainer>
      </Container>
      <Board_WriteButton boardType={boardType} />
    </Wrap>
  );
};

export default Community_Main;
