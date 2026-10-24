import React from 'react';

import { useNavigate } from 'react-router-dom';

import type { SideBarProps } from '../navBar/BarType';

import {
  Container,
  MenuContainer,
  MenuColumn,
  MenuTitle,
  MenuLink,
} from '../../styles/sideBar/CommunityBar';

const CommunityBar: React.FC<SideBarProps> = ({ isMenuOpen }) => {
  const navigate = useNavigate();

  const handleNavigation = (navigatepath: string): void => {
    navigate(navigatepath);
  };
  // 언어가 늘어난다면 다음과 같은 형식으로 맨 밑에 추가해주면 자동 생성이 됩니다.
  const subMenuData = [
    {
      title: '코딩 질문',
      navigatepath: '/community/coding',
    },
    {
      title: '진로 질문',
      navigatepath: '/community/course',
    },
    {
      title: '스터디',
      navigatepath: '/community/study',
    },
    {
      title: '팀 프로젝트',
      navigatepath: '/community/team',
    },
    {
      title: '멘토링',
      navigatepath: '/community/mentor',
    },
  ];

  return (
    <Container isMenuOpen={isMenuOpen}>
      <MenuContainer>
        {subMenuData.map((menu, index) => (
          <MenuColumn key={index}>
            <MenuLink onClick={() => handleNavigation(menu.navigatepath)}>
              <MenuTitle>{menu.title}</MenuTitle>
            </MenuLink>
          </MenuColumn>
        ))}
      </MenuContainer>
    </Container>
  );
};

export default CommunityBar;
