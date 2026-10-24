import { Link } from 'react-router-dom';

import styled, { keyframes, css } from 'styled-components';

import { CssProps } from '../../pages/navBar/BarType';

export const Container = styled.div.attrs({
  id: 'container',
})<CssProps>`
  width: 100%;
  height: calc(100vh - 50px);
  position: absolute;
  margin-top: 49px;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  align-items: top;
  justify-content: center;
  z-index: 100;
  background-color: var(--educoding-dark);
  transition:
    transform 0.3s ease-out,
    opacity 0.3s ease-out;
  @media (min-width: 769px) {
    display: none;
  }
`;

export const LeftContainer = styled.div.attrs({
  id: 'leftcontainer',
})`
  width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: var(--educoding-dark);
  z-index: 100;
`;

export const LeftMenuEach = styled.div.attrs({
  id: 'leftmenueach',
})<{ isActive: boolean }>`
  width: 100%;
  height: 50px;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--educoding-white);
  cursor: pointer;
  background-color: ${(props) => (props.isActive ? 'var(--educoding-hover)' : 'transparent')};
  &:hover {
    background-color: var(--educoding-hover); // hover 시에도 배경색을 변경
  }
`;

export const LeftMenuText = styled.div.attrs({
  id: 'leftmenutext',
})`
  color: var(--educoding-white);
  font-family: extrabold, sans-serif;
  font-size: 14px;
`;

export const LeftMenuLogin = styled.div.attrs({
  id: 'leftmenulogin',
})`
  width: 100%;
  height: 50px;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--educoding-white);
  cursor: pointer;
  background-color: var(--educoding-purple);
`;

export const RightContainer = styled.div.attrs({
  id: 'rightcontainer',
})`
  width: calc(100% - 180px);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: left;
  background-color: var(--educoding-hover);
  padding: 20px;
  gap: 25px;
  z-index: 100;
  overflow-y: auto;
  padding-bottom: 100px;
  &::-webkit-scrollbar {
    width: 10px;
    height: 100%;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--educoding-hover);
  }
  &::-webkit-scrollbar-track {
    background: var(--educoding-dark);
  }
`;

export const RightMenuGroup = styled.div.attrs({
  id: 'rightmenugroup',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

export const RightMenuTitle = styled.div.attrs({
  id: 'rightmenutitle',
})`
  color: var(--educoding-white);
  font-family: extrabold, sans-serif;
  font-size: 14px;
`;

export const RightMenuItem = styled.div.attrs({
  id: 'rightmenuitem',
})`
  color: var(--educoding-white);
  font-family: bold, sans-serif;
  font-size: 12px;
  cursor: pointer;
`;

export const RightMenuHR = styled.hr.attrs({
  id: 'rightmenuhr',
})`
  width: 100%;
  height: 1px;
  border: 1px solid var(--educoding-line);
  background-color: var(--educoding-line);
  transform: scaleY(1);
`;
