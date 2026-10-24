import { JSX } from 'react';

import { useNavigate } from 'react-router-dom';

import MainSection4_BoardList from './MainSection4_BoardList';
import {
  MainSection4EachContainer,
  MainSection4GridContainer,
  MiddleTitle,
  MiddleTitleBar,
  MiddleTitleContainer,
} from '../../styles/main/Main';

const MainSection4 = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <MainSection4GridContainer>
      <MainSection4EachContainer>
        <MiddleTitleContainer
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/community/coding')}
        >
          <MiddleTitleBar />
          <MiddleTitle>코딩 질문 게시판 최신 글</MiddleTitle>
        </MiddleTitleContainer>
        <MainSection4_BoardList boardType="coding" size={5} />
      </MainSection4EachContainer>
      <MainSection4EachContainer>
        <MiddleTitleContainer
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/community/study')}
        >
          <MiddleTitleBar />
          <MiddleTitle>스터디 게시판 최신 글</MiddleTitle>
        </MiddleTitleContainer>
        <MainSection4_BoardList boardType="study" size={5} />
      </MainSection4EachContainer>
      <MainSection4EachContainer>
        <MiddleTitleContainer
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/community/team')}
        >
          <MiddleTitleBar />
          <MiddleTitle>팀 프로젝트 게시판 최신 글</MiddleTitle>
        </MiddleTitleContainer>
        <MainSection4_BoardList boardType="team" size={5} />
      </MainSection4EachContainer>
    </MainSection4GridContainer>
  );
};

export default MainSection4;
