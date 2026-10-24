import { EditorContent } from '@tiptap/react';
import styled from 'styled-components';

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

export const WriteWrap = styled.div.attrs({
  id: 'writewrap',
})`
  display: flex;
  flex-direction: column;
  background-color: var(--educoding-white);
  justify-content: flex-start;
  align-items: center;
  overflow: none;
  background-color: var(--educoding-dark);
  border-bottom: 1px solid var(--educoding-line);
`;
export const WriteContainer = styled.div.attrs({
  id: 'writecontainer',
})`
  max-width: 1280px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: none;
  border-left: 1px solid var(--educoding-line);
  border-right: 1px solid var(--educoding-line);
`;
export const WriteSortOuterContiner = styled.div.attrs({
  id: 'writesortoutercontainer',
})`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--educoding-line);
`;
export const WriteSortInnerContainer = styled.div.attrs({
  id: 'writesortinnercontainer',
})`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
`;
export const WriteSortTitleActive = styled.div.attrs({
  id: 'writesorttitleactive',
})`
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--educoding-white);
  font-size: 14px;
  font-family: extrabold, sans-serif;
  border-right: 1px solid var(--educoding-line);
  background-color: var(--educoding-black);
  padding: 0 15px;
`;
export const WriteSortTitleInactive = styled.div.attrs({
  id: 'writesorttitleinactive',
})`
  padding: 16px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--educoding-white);
  font-size: 14px;
  font-family: extrabold, sans-serif;
  border-right: 1px solid var(--educoding-line);
  background-color: var(--educoding-dark);
  padding: 0 15px;
`;

export const WriteBoardLink = styled.button.attrs({
  id: 'writeboardlink',
})`
  font-family: inherit;
  font-size: inherit;
  text-decoration: none;
  border: none;
  color: inherit;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

export const WriteTitleBox = styled.div.attrs({
  id: 'writetitlebox',
})`
  width: 100%;
  height: 40px;
  background-color: var(--educoding-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--educoding-line);
`;
export const WriteTitle = styled.input.attrs({
  id: 'writetitle',
})`
  width: 100%;
  padding: 0 15px;
  font-family: bold, sans-serif;
  font-size: 16px;
  color: var(--educoding-white);
  border: none;
  background-color: var(--educoding-dark);
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: var(--educoding-white);
    opacity: 0.5;
  }
`;
export const WriteTagBox = styled.div.attrs({
  id: 'writetagbox',
})`
  width: 100%;
  height: 40px;
  background-color: var(--educoding-dark);
  border-bottom: var(--educoding-line);
`;
export const WriteTags = styled.input.attrs({
  id: 'writetags',
})`
  width: 100%;
  font-family: bold, sans-serif;
  font-size: 16px;
  color: var(--educoding-white);
  border: none;
  &:focus {
    outline: none;
  }
`;
export const TipTapBox = styled.div.attrs({
  id: 'tiptapbox',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
export const EditorArea = styled.div.attrs({
  id: 'editorarea',
})`
  width: 100%;
  height: calc(100vh - 162px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  border-bottom: 1px solid var(--educoding-line);
  flex-wrap: wrap;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 10px;
    height: 100%;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--educoding-hover);
    border-radius: 30px;
  }
  &::-webkit-scrollbar-track {
    background: var(--educoding-dark);
  }
`;
export const StyledEditorContent = styled(EditorContent)`
  width: 100%;
  height: 100%;
  padding: 15px;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  margin-top: 40px;
  &::-webkit-scrollbar {
    width: 10px;
    height: 100%;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--educoding-hover);
    /* border-radius: 30px; */
  }
  &::-webkit-scrollbar-track {
    background: var(--educoding-dark);
  }
`;
export const WriteButtonsArea = styled.div.attrs({
  id: 'writebuttonsarea',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  border-bottom: 1px solid var(--educoding-line);
`;

export const PreviewButton = styled.div.attrs({
  id: 'previewButton',
})`
  width: 120px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  background-color: #f1f1f1;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  font-family: 'bold', sans-serif;
  cursor: pointer;
`;

export const WriteCancelButton = styled.div.attrs({
  id: 'writecancelbutton',
})`
  width: 100px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  color: rgba(0, 0, 0, 0.8);
  font-size: 12px;
  font-family: bold, sans-serif;
  border-left: 1px solid var(--educoding-line);
  border-right: 1px solid var(--educoding-line);
  cursor: pointer;
`;

export const WriteSubmitButton = styled.div.attrs({
  id: 'writesutmitbutton',
})`
  width: 100px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  color: #f1f1f1;
  font-size: 12px;
  font-family: bold, sans-serif;
  cursor: pointer;
  &:hover {
    background-color: var(--educoding-purple);
  }
`;
