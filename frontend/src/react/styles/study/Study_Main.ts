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

export const ArrowLeftPC = styled.div.attrs({
  id: 'arrowleftpc',
})`
  width: calc((100vw - 1280px) / 2);
  height: calc(100vh - 50px);
  position: absolute;
  background-color: var(--educoding-dark);
  top: 50px;
  left: 0;
  transition: 0.3s ease-in-out;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    background-color: var(--educoding-black);
    #arrowitems {
      opacity: 1;
      visibility: visible;
    }
  }
`;
export const ArrowRightPC = styled.div.attrs({
  id: 'arrowrightpc',
})`
  width: calc((100vw - 1280px) / 2);
  height: calc(100vh - 50px);
  position: absolute;
  background-color: var(--educoding-dark);
  top: 50px;
  right: 0;
  transition: 0.3s ease-in-out;
  cursor: pointer;
  &:hover {
    background-color: var(--educoding-black);
    #arrowitems {
      opacity: 1;
      visibility: visible;
    }
  }
`;

export const ArrowItems = styled.div.attrs({
  id: 'arrowitems',
})`
  width: 100%;
  height: 100%;
  display: flex;
  color: var(--educoding-white);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 10px;
  opacity: 0;
  visibility: hidden;
  transition:
    0.3s ease-in-out,
    visibility 0.3s ease-in-out;
`;
export const ArrowText = styled.div.attrs({
  id: 'arrowtext',
})`
  color: var(--educoding-white);
  font-family: extrabold, sans-serif;
  font-size: 14px;
  @media (max-width: 1450px) {
    display: none;
  }
`;

export const ArrowLink = styled.button.attrs({
  id: 'arrowlink',
})`
  text-decoration: none;
  border: none;
  background-color: transparent;
  cursor: pointer;
`;
