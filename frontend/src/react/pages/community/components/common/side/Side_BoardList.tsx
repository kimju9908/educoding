import React from 'react';

import { useNavigate, useOutletContext } from 'react-router-dom';

import type {
  BoardNameType,
  BoardType,
  OutletContextType,
  SideBoardListProps,
} from '../../../CommunityType';

import {
  ChapterOuter,
  ChapterInner,
  ChapterName,
  ChapterListTitle,
} from '../../../../../styles/community/Community_Components';

const Side_BoardList: React.FC<SideBoardListProps> = ({ boardType }) => {
  const navigate = useNavigate();
  const mainContentRef = useOutletContext<OutletContextType>();

  const boards: BoardType = [
    { name: 'coding' },
    { name: 'course' },
    { name: 'study' },
    { name: 'team' },
    { name: 'mentor' },
  ];

  const boardNames: BoardNameType = {
    coding: '코딩 질문',
    course: '진로 질문',
    study: '스터디',
    team: '팀 프로젝트',
    mentor: '멘토링',
  };

  const handleBoardClick = (boardType: string): void => {
    navigate(`/community/${boardType}`);
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
        <ChapterListTitle>👀 전체 게시판 보기</ChapterListTitle>
        <ChapterInner>
          {boards.map((board, index) => (
            <ChapterName
              key={index}
              onClick={() => handleBoardClick(board.name)} // 클릭 시 핸들러 호출
              style={{
                color: board.name === boardType ? 'var(--educoding-purple)' : 'var(--educoding-white)',
                cursor: 'pointer',
              }}
            >
              {boardNames[board.name]}
            </ChapterName>
          ))}
        </ChapterInner>
      </ChapterOuter>
    </>
  );
};

export default Side_BoardList;
