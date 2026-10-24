import { EditorContent } from '@tiptap/react';
import { StylesConfig, GroupBase } from 'react-select';
import styled, { keyframes, css } from 'styled-components';

import { TagType } from '../../pages/community/CommunityType';

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
  @media (max-width: 768px) {
    padding: 0 10px;
  }
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
  @media (max-width: 768px) {
    padding: 0 10px;
  }
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
  background-color: var(--educoding-dark);
  border: none;
  &:focus {
    outline: none;
  }
`;
export const MentorOtherTagsLine = styled.div.attrs({
  id: 'mentorothertags',
})`
  width: 100%;
  height: 40px;
  display: flex;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--educoding-dark);
  border-bottom: 1px solid var(--educoding-line);
`;

export const MentorOtherTagsLeft = styled.input.attrs({
  id: 'mentorothertagsleft',
})`
  all: unset;
  width: 50%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: regular, sans-serif;
  font-size: 14px;
  border: none;
  padding: 0 15px;
  color: var(--educoding-white);
  background-color: var(--educoding-dark);
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: var(--educoding-white);
    opacity: 0.5;
    font-style: italic;
  }
`;
export const MentorOtherTagsRight = styled.input.attrs({
  id: 'mentorothertagsright',
})`
  all: unset;
  width: 50%;
  color: var(--educoding-white);
  background-color: var(--educoding-dark);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: regular, sans-serif;
  font-size: 14px;
  border: none;
  padding: 0 15px;
  border-left: 1px solid var(--educoding-line);
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: var(--educoding-white);
    opacity: 0.5;
    font-style: italic;
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
  height: calc(100vh - 202px);
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
export const MentorEditorArea = styled.div.attrs({
  id: 'editorarea',
})`
  width: 100%;
  height: calc(100vh - 322px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  border-bottom: 1px solid var(--educoding-line);
  flex-wrap: wrap;
  overflow-x: hidden;
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
  width: 100px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--educoding-purple);
  color: #f1f1f1;
  font-size: 12px;
  font-family: bold, sans-serif;
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

export const SelectStyle: StylesConfig<TagType, true, GroupBase<TagType>> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--educoding-dark)',
    borderColor: 'var(--educoding-white)',
    boxShadow: 'none',
    maxWidth: '1280px',
    border: 'none',
    borderBottom: '1px solid var(--educoding-line)', // 컨트롤 바에서 border-bottom 색상을 지정
    fontFamily: 'bold, sans-serif',
    fontSize: '16px',
    borderRadius: '0',
    width: '100%',
    height: '100%',
    margin: '0',
    padding: '0',
    '&:hover': {
      borderBottom: '1px solid var(--educoding-line)',
    },
  }),
  menuList: (provided) => ({
    ...provided,
    '&::-webkit-scrollbar': {
      width: '10px',
      height: '100%',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'var(--educoding-hover)',
      /* border-radius: 30px; */
    },
    '&::-webkit-scrollbar-track': {
      background: 'var(--educoding-dark)',
    },
  }),
  menu: (provided) => ({
    ...provided,
    margin: '0',
    top: '38px',
    backgroundColor: 'var(--educoding-dark)',
    zIndex: '50',
    maxWidth: '1280px',
    fontSize: '12px',
    fontFamily: 'bold, sans-serif',
    color: 'var(--educoding-white)',
  }),
  option: (provided, { isSelected, isFocused }) => ({
    ...provided,
    backgroundColor: isSelected
      ? 'black'
      : isFocused
        ? 'var(--educoding-hover)'
        : 'var(--educoding-dark)',
    color: 'var(--educoding-white)',
    cursor: 'pointer',
    zIndex: '50',
    margin: '0',
    '&:active': {
      backgroundColor: 'transparent',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'var(--educoding-hover)',
    alignItems: 'center',
    height: '100%',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'var(--educoding-white)',
    padding: '5px 10px',
    fontSize: '12px',
    fontFamily: 'bold, sans-serif',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: 'white',
    width: '15px',
    height: '15px',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '2px',
    marginRight: '5px',
    padding: '0',
    borderRadius: '50%',
    '&:hover': {
      backgroundColor: 'var(--educoding-white)', // hover 시 배경색 변경
      color: 'var(--educoding-black)', // hover 시 글자색 변경
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    fontFamily: 'bold, sans-serif',
    fontSize: '16px',
    color: 'var(--educoding-white)',
    opacity: '0.5',
    paddingLeft: '5px',
  }),
};
