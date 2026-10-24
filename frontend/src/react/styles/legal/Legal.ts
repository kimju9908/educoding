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
  padding-bottom: 100px;
`;

export const Container = styled.div.attrs({
  id: 'container',
})`
  max-width: 1280px;
  width: 100%;
  height: 100%;
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
  margin-bottom: 0;
  box-sizing: border-box;
  gap: 50px;
  @media (max-width: 768px) {
    margin-top: 20px;
    gap: 50px;
  }
`;
export const TermsTitleBox = styled.div.attrs({
  id: 'termstitlebox',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;
export const TermsTitle = styled.div.attrs({
  id: 'termstitle',
})`
  width: 100%;
  font-family: heavy, sans-serif;
  font-size: 30px;
  color: var(--educoding-white);
  text-align: center;
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;
export const TermsHR = styled.hr.attrs({
  id: 'termshr',
})`
  width: 300px;
  border-color: var(--educoding-purple);
  @media (max-width: 768px) {
    width: 200px;
  }
`;
export const Chapter = styled.div.attrs({
  id: 'chapter',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 50px;
  @media (max-width: 768px) {
    gap: 30px;
  }
`;
export const ChapterTitle = styled.div.attrs({
  id: 'chaptertitle',
})`
  width: 100%;
  font-family: extrabold, sans-serif;
  font-size: 24px;
  color: var(--educoding-white);
  text-align: center;
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;
export const Article = styled.div.attrs({
  id: 'article',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  @media (max-width: 768px) {
    gap: 10px;
  }
`;
export const ArticleTitle = styled.div.attrs({
  id: 'articletitle',
})`
  width: 100%;
  margin-bottom: 20px;
  font-family: bold, sans-serif;
  font-size: 20px;
  color: var(--educoding-white);
  text-align: center;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;
export const Item = styled.div.attrs({
  id: 'item',
})`
  width: 100%;
  font-family: regular, sans-serif;
  font-size: 16px;
  color: var(--educoding-white);
  line-height: 24px;
  text-align: left;
  @media (max-width: 768px) {
    font-size: 12px;
    line-height: 18px;
  }
`;
