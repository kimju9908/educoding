import React from 'react';

import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material';

import {
  SubjectContainer,
  SubjectImgContainer,
  SubjectTitle,
  SubjectContents,
  SubjectTextContainer,
} from '../../../../../styles/community/Community_Components';
import {
  BoardExplainType,
  BoardImageType,
  BoardNameType,
  BoardTitleProps,
} from '../../../CommunityType';

const Board_Title: React.FC<BoardTitleProps> = ({ boardType }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isLightMode: boolean = theme.palette.mode === 'light';

  const boardImages: BoardImageType = {
    coding: isLightMode
      ? 'url(/images/community/coding_light.png)'
      : 'url(/images/community/coding.png)',
    course: isLightMode
      ? 'url(/images/community/course_light.png)'
      : 'url(/images/community/course.png)',
    study: isLightMode
      ? 'url(/images/community/study_light.png)'
      : 'url(/images/community/study.png)',
    team: isLightMode ? 'url(/images/community/team_light.png)' : 'url(/images/community/team.png)',
    mentor: isLightMode
      ? 'url(/images/community/mentor_light.png)'
      : 'url(/images/community/mentor.png)',
  };

  const boardNames: BoardNameType = {
    coding: '코딩 질문',
    course: '진로 질문',
    study: '스터디',
    team: '팀 프로젝트',
    mentor: '멘토링',
  };

  const boardExplain: BoardExplainType = {
    coding: `프로그래밍 관련 궁금증을 해결하세요!\n초보 개발자부터 전문가까지\n모두가 함께 성장하는 공간입니다.`,
    course: `개발자로서의 길을 고민하고 계신가요?\n다양한 분야의 진로를  탐색하고\n취업 및 커리어 관련 질문을 나누세요.`,
    study: `함께 공부할 동료를 찾아보세요!\n알고리즘, CS, 코딩 테스트, 특정 기술 스택 학습 등\n함께 공부할 팀원을 모집할 수 있는 공간입니다.`,
    team: `아이디어를 현실로 만들 팀을 모집하세요!\n사이드 프로젝트부터 스타트업까지\n다양한 기회가 기다리고 있습니다.`,
    mentor: `개발 멘토·멘티를 찾아보세요!\n기술, 취업, 커리어 개발 등\n다양한 분야에서 멘토링을 주고받으며 함께 성장하세요!`,
  };

  const handleNavigate = (): void => {
    navigate(`/community/${boardType}`);
  };

  return (
    <>
      <SubjectContainer onClick={handleNavigate}>
        <SubjectImgContainer
          style={{ backgroundImage: boardImages[boardType as string] || 'none' }}
        />
        <SubjectTextContainer>
          <SubjectTitle>{boardNames[boardType as string]} 게시판</SubjectTitle>
          <SubjectContents>{boardExplain[boardType as string]}</SubjectContents>
        </SubjectTextContainer>
      </SubjectContainer>
    </>
  );
};

export default Board_Title;
