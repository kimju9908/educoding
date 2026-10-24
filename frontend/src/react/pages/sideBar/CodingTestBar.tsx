import React from 'react';

import { useNavigate } from 'react-router-dom';

import type { SideBarProps } from '../navBar/BarType';

import {
  Container,
  MenuContainer,
  MenuColumn,
  MenuLink,
  MenuTitle,
} from '../../styles/sideBar/CodingTestBar';

const CodingTestBar: React.FC<SideBarProps> = ({ isMenuOpen }) => {
  const navigate = useNavigate();

  const handleNavigation = (navigatepath: string): void => {
    navigate(navigatepath);
  };

  const subMenuData = [
    {
      title: '연습문제',
      navigatepath: '/codingtest/practice',
    },
    {
      title: '1단계',
      navigatepath: '/codingtest/basic',
    },
    {
      title: '2단계',
      navigatepath: '/codingtest/intermediate',
    },
    {
      title: '3단계',
      navigatepath: '/codingtest/expert',
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

export default CodingTestBar;
