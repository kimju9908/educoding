import styled from 'styled-components';

import { CssProps } from '../../pages/footer/FooterProps';

export const Wrap = styled.div.attrs({
  id: 'wrap',
})`
  width: 100vw;
  height: 150px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: var(--educoding-dark);
  padding-bottom: 10px;
  position: relative;
  border-top: 1px solid var(--educoding-line);
  @media (max-width: 768px) {
    height: 220px;
    padding-bottom: 0;
    padding: auto;
  }
`;

export const Container = styled.div.attrs({
  id: 'container',
})`
  width: 100%;
  max-width: 1280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  @media (max-width: 768px) {
    gap: 10px;
  }
`;
export const MainBox = styled.div.attrs({
  id: 'mainbox',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
export const MainMobileBox = styled.div.attrs({
  id: 'mainmobilebox',
})`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    width: 100%;
    color: var(--educoding-white);
    font-family: regular, sans-serif;
    font-size: 12px;
    line-height: 16px;
    padding: 10px;
  }
`;

export const MainLeftBox = styled.div.attrs({
  id: 'mainleftbox',
})`
  width: 70%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;
export const MainRightBox = styled.div.attrs({
  id: 'mainrightbox',
})`
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
`;

export const FooterContentsLeft = styled.div.attrs({
  id: 'footercontentsleft',
})`
  width: 100%;
  color: var(--educoding-white);
  font-family: regular, sans-serif;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  line-height: 16px;
  @media (max-width: 768px) {
    display: none;
  }
`;

export const FooterContentsRight = styled.div.attrs({
  id: 'footercontentsleft',
})`
  width: 100%;
  color: var(--educoding-white);
  font-family: regular, sans-serif;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  line-height: 16px;
  @media (max-width: 768px) {
    display: none;
  }
`;

export const TermsLink = styled.div.attrs({
  id: 'termslink',
})`
  display: flex;
  margin: 0 5px;
  cursor: pointer;
  &:hover {
    font-family: bold, sans-serif;
    text-decoration: underline;
    text-underline-offset: 5px;
  }
`;
