import styled from 'styled-components';

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

export const WriteButtonsArea = styled.div.attrs({
  id: 'writebuttonsarea',
})`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  border-bottom: 1px solid var(--educoding-line);
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
  color: black;
  font-size: 12px;
  font-family: bold, sans-serif;
  cursor: pointer;
  border-bottom: 1px solid var(--educoding-line);
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
  background-color: var(--educoding-header);
  color: white;
  font-size: 12px;
  font-family: bold, sans-serif;
  cursor: pointer;
  border-bottom: 1px solid var(--educoding-line);
  &:hover {
    background-color: var(--educoding-purple);
  }
`;
