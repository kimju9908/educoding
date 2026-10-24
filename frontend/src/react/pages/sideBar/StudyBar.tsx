import React from 'react';

import { useNavigate } from 'react-router-dom';

import type { SideBarProps } from '../navBar/BarType';

import {
  Container,
  MenuContainer,
  MenuColumn,
  MenuTitle,
  MenuLink,
} from '../../styles/sideBar/StudyBar';

const StudyBar: React.FC<SideBarProps> = ({ isMenuOpen }) => {
  const navigate = useNavigate();

  const handleNavigation = (navigatepath: string): void => {
    navigate(navigatepath);
  };

  const subMenuData = [
    {
      title: 'Java',
      navigatepath: '/study/java',
    },
    {
      title: 'Python',
      navigatepath: '/study/python',
    },
    {
      title: 'C',
      navigatepath: '/study/c',
    },
    {
      title: 'C++',
      navigatepath: '/study/cplus',
    },
    {
      title: 'JavaScript',
      navigatepath: '/study/javascript',
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

export default StudyBar;
