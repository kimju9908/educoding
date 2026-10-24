import React from 'react';

import { useNavigate } from 'react-router-dom';

import type { ExamBarProps } from '../navBar/BarType';

import { useAppSelector } from '../../../redux/hooks/reduxHooks';
import {
  Container,
  MenuContainer,
  MenuColumn,
  MenuLink,
  MenuTitle,
} from '../../styles/sideBar/ExamBar';

const TestBar: React.FC<ExamBarProps> = ({ isMenuOpen, onValidDialogState, toggleMenu }) => {
  const navigate = useNavigate();
  const { nickname, keynumber } = useAppSelector((state) => state.auth);

  const handleMock = (): void => {
    if (nickname === '' || keynumber === '') {
      onValidDialogState?.(true);
      // toggleMenu('isExamOpen');
      return;
    }
    navigate('/exam/mock/random');
  };

  const handlePrevious = (): void => {
    if (nickname === '' || keynumber === '') {
      onValidDialogState?.(true);
      // toggleMenu('isExamOpen');
      return;
    }
    navigate('/exam/previous/220424');
  };

  return (
    <Container isMenuOpen={isMenuOpen}>
      <MenuContainer>
        <MenuColumn>
          <MenuLink
            onClick={() => {
              handleMock();
            }}
          >
            <MenuTitle>모의시험</MenuTitle>
          </MenuLink>
        </MenuColumn>
        <MenuColumn>
          <MenuLink
            onClick={() => {
              handlePrevious();
            }}
          >
            <MenuTitle>기출문제</MenuTitle>
          </MenuLink>
        </MenuColumn>
      </MenuContainer>
    </Container>
  );
};

export default TestBar;
