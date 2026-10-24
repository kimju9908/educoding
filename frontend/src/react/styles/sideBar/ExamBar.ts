import { Link } from 'react-router-dom';

import styled, { keyframes, css } from 'styled-components';

import { CssProps } from '../../pages/navBar/BarType';

export const Container = styled.div.attrs({
  id: 'container',
})<CssProps>`
  position: absolute;
  width: 160px;
  display: flex;
  flex-direction: row;
  align-items: center;
  top: calc(100% - 7px);
  left: 15px;
  justify-content: center;
  transform: translateX(-50%);
  background-color: var(--educoding-white);
  overflow: hidden;
  z-index: 100;
  background-color: var(--educoding-dark);
  border: 1px solid var(--educoding-line);
  border-radius: 10px;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.25);
  ${(props) =>
    props.isMenuOpen
      ? css`
          animation: ${expandHeight} 0.3s ease-out forwards;
        `
      : css`
          animation: ${collapseHeight} 0.3s ease-out forwards;
        `}
`;
const expandHeight = keyframes`
  0% {
    height: 0;
    opacity: 0;
  }
  100% {
    height: 80px;
    opacity: 1;
  }
`;
const collapseHeight = keyframes`
  0% {
    height: 80px;
    opacity: 1;
  }
  100% {
    height: 0;
    opacity: 0;
  }
`;
const fadeInOpacity = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;
const fadeOutOpacity = keyframes`
  0% {
    opacity: 1;
  }
  10% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
`;

export const MenuContainer = styled.div.attrs({
  id: 'menucontainer',
})`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  justify-content: space-between;
`;

export const MenuColumn = styled.div.attrs({
  id: 'menucolumn',
})`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: left;
  width: 100%;
  height: 40px;
  &:hover {
    background-color: var(--educoding-hover);
  }
`;
export const MenuLink = styled.button.attrs({
  id: 'menulink',
})`
  width: 100%;
  height: 100%;
  display: inline-block;
  text-decoration: none;
  color: inherit;
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

export const MenuTitle = styled.div.attrs({
  id: 'menutitle',
})`
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  font-family: extrabold, sans-serif;
  font-size: 12px;
  align-items: center;
  text-align: left;
  padding: 0 15px;
  color: var(--educoding-white);
`;
