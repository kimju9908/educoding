import styled from 'styled-components';

export const ChapterOuter = styled.div.attrs({
  id: 'chapterouter',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow-x: hidden;
  border-bottom: 1px solid var(--educoding-line);
`;
export const ChapterListTitle = styled.div.attrs({
  id: 'chapterlisttitle',
})`
  width: 100%;
  background-color: var(--educoding-header);
  box-shadow: inset 3px 0 0 var(--educoding-purple);
  height: 40px;
  font-family: extrabold, sans-serif;
  font-size: 14px;
  color: white;
  display: flex;
  align-items: center;
  padding-left: 15px;
`;
export const ChapterInner = styled.div.attrs({
  id: 'chapterinner',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--educoding-dark);
`;

export const ChapterName = styled.div.attrs({
  id: 'ChapterName',
})`
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 14px;
  font-family: bold, sans-serif;
  cursor: pointer;
  position: relative;
  padding-left: 15px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    padding-left 0.2s ease;
  &:hover {
    background-color: var(--educoding-accent-soft);
    color: var(--educoding-purple);
    padding-left: 21px;
  }
`;
