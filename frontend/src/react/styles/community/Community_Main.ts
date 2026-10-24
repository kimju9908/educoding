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
  min-height: calc(100vh - 200px);
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  border-left: 1px solid var(--educoding-line);
  border-right: 1px solid var(--educoding-line);
  @media (max-width: 768px) {
    max-width: 768px;
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
    width: 100%;
    border-left: none;
  }
`;
export const PathLink = styled.button.attrs({
  id: 'pathlink',
})`
  display: inline-block;
  text-decoration: none;
  color: inherit;
  padding: 5px 10px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  &:hover {
    text-decoration: none;
    background-color: var(--educoding-purple);
    color: #ffffff;
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

export const BoardContainer = styled.div.attrs({
  id: 'boardcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: 40px;
`;
