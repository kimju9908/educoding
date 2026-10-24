import { EditorContent } from '@tiptap/react';
import styled from 'styled-components';

type UserFeedProps = {
  dangerouslySetInnerHTML?: string;
};

export const RightContainerEach = styled.div.attrs({
  id: 'rightcontainereach',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--educoding-line);
`;

export const RightFeedContainer = styled.div.attrs({
  id: 'rightfeedcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
`;
export const RightFeedContentsBox = styled.div.attrs({
  id: 'rightfeedcontentsbox',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
export const RightFeedIndex = styled.div.attrs({
  id: 'rightfeedindex',
})`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-family: extrabold, sans-serif;
  color: var(--educoding-white);
  text-align: center;
  justify-content: center;
  padding: 30px;
  border-bottom: 1px solid var(--educoding-line);
`;
export const RightFeedText = styled.div.attrs({
  id: 'rightfeedtext',
})`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-family: extrabold, sans-serif;
  color: var(--educoding-white);
  justify-content: flex-start;
  padding: 15px;
  border-bottom: 1px solid var(--educoding-line);
`;

export const TipTapBox = styled.div.attrs({
  id: 'tiptapbox',
})`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const EditorArea = styled.div.attrs({
  id: 'editorarea',
})`
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  border-bottom: 1px solid var(--educoding-line);
  overflow: auto;
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
  cursor: pointer;
  border-left: 1px solid var(--educoding-line);
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
