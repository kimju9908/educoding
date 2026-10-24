import { Link } from 'react-router-dom';

import styled from 'styled-components';

export const Wrap = styled.div.attrs({
  id: 'wrap',
})`
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: var(--educoding-dark);
`;

export const Container = styled.div.attrs({
  id: 'container',
})`
  max-width: 1280px;
  width: 100%;
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: row;
  justify-content: center;
  border-left: 1px solid var(--educoding-line);
  border-right: 1px solid var(--educoding-line);
  @media (max-width: 768px) {
    max-width: 768px;
  }
`;
export const MobileInner = styled.div.attrs({
  id: 'mobileinner',
})`
  display: none;
  @media (max-width: 768px) {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding-bottom: 50px;
  }
`;
export const LeftContainer = styled.div.attrs({
  id: 'leftcontainer',
})`
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 100px;
  @media (max-width: 768px) {
    display: none;
  }
`;

export const RightContainer = styled.div.attrs({
  id: 'rightcontainer',
})`
  width: 60%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--educoding-line);
  padding-bottom: 100px;
  box-sizing: border-box;
  @media (max-width: 768px) {
    display: none;
  }
`;

export const PageTitleBar = styled.div.attrs({
  id: 'pagetitlebar',
})`
  width: 100%;
  height: 40px;
  background: var(--educoding-gradient);
  color: white;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 15px;
  font-family: extrabold, sans-serif;
  font-size: 14px;
`;
