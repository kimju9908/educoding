import React, { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import {
  WriteSortInnerContainer,
  WriteSortOuterContiner,
  WriteSortTitleActive,
  WriteSortTitleInactive,
  WriteBoardLink,
} from '../../../../../styles/community/Community_Write';

const Post_ModifySort: React.FC = () => {
  const [activeBoard, setActiveBoard] = useState(''); // 초기 설정
  const location = useLocation();

  useEffect(() => {
    const currentBoard = location.state?.id || location.pathname.split('/')[2];
    setActiveBoard(currentBoard);
  }, [location.pathname, location.state]);

  const boards = [
    {
      id: 'coding',
      label: '코딩 질문',
      link: '/community/coding/write',
    },
    {
      id: 'course',
      label: '진로 질문',
      link: '/community/course/write',
    },
    {
      id: 'study',
      label: '스터디',
      link: '/community/study/write',
    },
    {
      id: 'team',
      label: '팀 프로젝트',
      link: '/community/team/write',
    },
    {
      id: 'mentor',
      label: '멘토링',
      link: '/community/mentor/write',
    },
  ];

  return (
    <>
      <WriteSortOuterContiner>
        <WriteSortInnerContainer>
          {boards.map((board) => {
            const isActive = activeBoard === board.id;
            const BoardComponent = isActive ? WriteSortTitleActive : WriteSortTitleInactive;

            return (
              <BoardComponent key={board.id}>
                <WriteBoardLink>{board.label}</WriteBoardLink>
              </BoardComponent>
            );
          })}
        </WriteSortInnerContainer>
      </WriteSortOuterContiner>
    </>
  );
};

export default Post_ModifySort;
