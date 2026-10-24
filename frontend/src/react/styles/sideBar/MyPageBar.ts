import styled, { keyframes, css } from 'styled-components';

import { CssProps } from '../../pages/navBar/BarType';

export const ContainerBefore = styled.div.attrs({
  id: 'containerbefore',
})<CssProps>`
  position: absolute;
  width: 160px;
  display: flex;
  flex-direction: row;
  align-items: center;
  top: calc(100% - 7px);
  left: -60px;
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
          animation: ${expandHeightBefore} 0.3s ease-out forwards;
        `
      : css`
          animation: ${collapseHeightBefore} 0.3s ease-out forwards;
        `}
`;
const expandHeightBefore = keyframes`
  0% {
    height: 0;
    opacity: 0;
  }
  100% {
    height: 120px;
    opacity: 1;
  }
`;
const collapseHeightBefore = keyframes`
  0% {
    height: 120px;
    opacity: 1;
  }
  100% {
    height: 0;
    opacity: 0;
  }
`;

export const ContainerAfter = styled.div.attrs({
  id: 'containerafter',
})<CssProps>`
  position: absolute;
  width: 160px;
  display: flex;
  flex-direction: row;
  align-items: center;
  top: calc(100% - 7px);
  left: -60px;
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
          animation: ${expandHeightAfter} 0.3s ease-out forwards;
        `
      : css`
          animation: ${collapseHeightAfter} 0.3s ease-out forwards;
        `}
`;
const expandHeightAfter = keyframes`
  0% {
    height: 0;
    opacity: 0;
  }
  100% {
    height: 160px;
    opacity: 1;
  }
`;
const collapseHeightAfter = keyframes`
  0% {
    height: 160px;
    opacity: 1;
  }
  100% {
    height: 0;
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
export const MenuColumnNickname = styled.div.attrs({
  id: 'menucolumnnickname',
})`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: left;
  width: 100%;
  height: 40px;
`;
export const MenuColumnTheme = styled.div.attrs({
  id: 'menucolumntheme',
})`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: left;
  width: 100%;
  height: 40px;
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

export const MenuTitleNickname = styled.div.attrs({
  id: 'menutitlenickname',
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
  color: var(--educoding-purple);
`;
export const MenuTitleTheme = styled.div.attrs({
  id: 'menutitletheme',
})`
  width: 70%;
  height: 100%;
  display: flex;
  position: relative;
  font-family: extrabold, sans-serif;
  font-size: 12px;
  align-items: center;
  text-align: left;
  padding: 0 0 0 15px;
  color: var(--educoding-white);
`;
export const MenuBoxTheme = styled.div.attrs({
  id: 'menuboxtheme',
})`
  width: 30%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 15px 0 0;
`;
