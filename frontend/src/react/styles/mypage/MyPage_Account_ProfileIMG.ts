import styled, { css } from 'styled-components';

import { CropSizeType } from '../../pages/mypage/MyPageType';

type AccountProfileProps = {
  isProfile?: string | null;
  isPreview?: string | null;
  isDragging?: boolean;
  image?: string | null;
  cropSize?: CropSizeType;
  theme?: 'light' | 'dark';
};

export const RightContainerEach = styled.div.attrs({
  id: 'rightcontainereach',
})`
  width: 100%;
  padding: 30px 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  box-sizing: border-box;
  border: 1px solid var(--educoding-line);
  @media (max-width: 768px) {
    gap: 30px;
    border: none;
    border-bottom: 1px solid var(--educoding-line);
  }
`;
export const RightContentsContainer = styled.div.attrs({
  id: 'rightcontentscontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  @media (max-width: 768px) {
    width: 200px;
  }
`;
export const RightProfileImage = styled.div.attrs({
  id: 'rightprofileimage',
})<AccountProfileProps>`
  width: 100px;
  height: 100px;
  display: flex;
  border-radius: 50%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 103%;
  background-color: white;
  border: 1px solid var(--educoding-line);
  ${(props) =>
    props.isProfile === null &&
    props.isPreview === null &&
    css`
      background-image: url('/images/general/default_profile.png');
    `}
  ${(props) =>
    props.isProfile === null &&
    props.isPreview !== null &&
    css`
      background-image: url(${props.isPreview});
    `}
  ${(props) =>
    props.isProfile !== null &&
    css`
      background-image: url(${props.isProfile});
    `}
      @media (max-width: 768px) {
    width: 200px;
    height: 200px;
  }
`;
export const HiddenInput = styled.input`
  display: none;
`;

export const ProfileEditButton = styled.div.attrs({
  id: 'profileeditbutton',
})`
  width: 30px;
  height: 30px;
  display: flex;
  border-radius: 50%;
  position: absolute;
  /* top: 128px;
  left: 132px; */
  right: 25%;
  bottom: 0;
  z-index: 3;
  cursor: pointer;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 40%;
  background-color: var(--educoding-purple);
  background-image: url('/images/icon/edit.png');
  &:hover {
    background-color: var(--educoding-header);
  }
  @media (max-width: 768px) {
    right: 0;
    bottom: 0;
    width: 50px;
    height: 50px;
  }
`;

export const Backdrop = styled.div.attrs({
  id: 'backdrop',
})`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;
export const ProfileModal = styled.div.attrs({
  id: 'profilemodal',
})`
  width: 400px;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--educoding-dark);
  justify-content: flex-start;
  align-items: center;
  z-index: 200;
  box-shadow: 1px 1px 10px 1px rgba(0, 0, 0, 0.05);
  padding-bottom: 30px;
  gap: 30px;
`;
export const ProfileModalHeader = styled.div.attrs({
  id: 'profilemodalheader',
})`
  width: 100%;
  height: 40px;
  background-color: var(--educoding-purple);
  color: white;
  font-family: bold, sans-serif;
  font-size: 14px;
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px 0 15px;
`;
export const ProfileModalCloseButton = styled.div.attrs({
  id: 'profilemodalclosebutton',
})`
  width: 30px;
  height: 30px;
  display: flex;
  position: relative;
  border-radius: 50%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 15px 15px;
  background-image: url('/images/icon/m_menu_close.png');
`;
export const ProfileModalTextContainer = styled.div.attrs({
  id: 'profilemodaltextcontainer',
})`
  width: 100%;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 15px;
  gap: 5px;
`;
export const ProfileModalTitle = styled.div.attrs({
  id: 'profilemodaltitle',
})`
  width: 100%;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-family: extrabold, sans-serif;
`;
export const ProfileModalContents = styled.div.attrs({
  id: 'profilemodalcontents',
})`
  display: flex;
  position: relative;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  text-align: center;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
`;
export const ProfileModalImage = styled.div.attrs({
  id: 'profilemodalimage',
})<AccountProfileProps>`
  width: 150px;
  height: 150px;
  display: flex;
  border-radius: 50%;
  border: 1px solid var(--educoding-line);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 102%;
  background-color: white;
  ${(props) =>
    props.isProfile === null &&
    props.isPreview === null &&
    css`
      background-image: url('/images/general/default_profile.png');
    `}
  ${(props) =>
    props.isProfile === null &&
    props.isPreview !== null &&
    css`
      background-image: url(${props.isPreview});
    `}
  ${(props) =>
    props.isProfile !== null &&
    css`
      background-image: url(${props.isProfile});
    `}
`;
export const ProfileModalButtonContainer = styled.div.attrs({
  id: 'profilemodalbuttoncontainer',
})`
  width: 100%;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;
export const ProfileModalButton = styled.button.attrs({
  id: 'profilemodalbutton',
})`
  width: 200px;
  height: 50px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  user-select: none;
  border-radius: 25px;
  border: 1px solid var(--educoding-line);
  color: #313131;
  font-family: bold, sans-serif;
  font-size: 15px;
  margin-top: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  &:hover {
    background-color: var(--educoding-purple);
    border: 1px solid var(--educoding-purple);
    color: var(--educoding-white);
    font-family: 'bold', sans-serif;
  }
`;

export const ProfileUploadModalContainer = styled.div.attrs({
  id: 'profileuploadmodalcontainer',
})<AccountProfileProps>`
  width: 80%;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: 0.3s;
  gap: 30px;
  ${({ isDragging }) => isDragging && 'background-color: #f1f1f1; border: 1px dashed black;'}
  // 드래그 중일 때 컨테이너를 덮는 오버레이
  .drag-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--educoding-white);
    font-size: 20px;
    font-family: bold, sans-serif;
    opacity: ${({ isDragging }) => (isDragging ? '1' : '0')};
    transition: opacity 0.3s ease;
  }
`;
export const ProfileUploadModalImage = styled.div.attrs({
  id: 'profileuploadmodalimage',
})<AccountProfileProps>`
  width: 150px;
  height: 150px;
  display: flex;
  border-radius: 50%;
  border: 1px solid var(--educoding-line);
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  background-color: white;
  ${(props) =>
    props.isProfile === null &&
    props.isPreview === null &&
    css`
      background-image: url('/images/general/default_profile.png');
    `}
  ${(props) =>
    props.isProfile === null &&
    props.isPreview !== null &&
    css`
      background-image: url(${props.isPreview});
    `}
  ${(props) =>
    props.isProfile !== null &&
    props.isPreview === null &&
    css`
      background-image: url(${props.isProfile});
    `}
    ${(props) =>
    props.isProfile !== null &&
    props.isPreview !== null &&
    css`
      background-image: url(${props.isPreview});
    `}
`;
export const ProfileCropModalTitle = styled.div.attrs({
  id: 'profilecropmodaltitle',
})`
  display: flex;
  position: relative;
  justify-content: flex-start;
  align-items: center;
  font-size: 25px;
  font-weight: bold;
  margin-left: 10px;
  color: var(--educoding-white);
`;
export const ProfileCropModalContainer = styled.div.attrs({
  id: 'profilecropmodalcontainer',
})`
  width: 100%;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
`;
export const ProfileCropContainer = styled.div.attrs({
  id: 'profilecropcontainer',
})`
  width: 300px;
  height: 300px;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;
export const ProfileCropOverlay = styled.div<AccountProfileProps>`
  position: absolute;
  width: ${(props) => props.cropSize?.width}px;
  height: ${(props) => props.cropSize?.height}px;
  border-radius: 50%;
  pointer-events: none;
`;
export const ProfileCropModalButtonContainer = styled.div.attrs({
  id: 'profilecropmodalcontainer',
})`
  width: 100%;
  height: 90px;
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const Controls = styled.div.attrs({
  id: 'controls',
})`
  margin-top: 10px;
  display: flex;
  gap: 10px;
`;
export const Input = styled.input.attrs({
  id: 'input',
})`
  width: 100%;
`;

export const Button = styled.button`
  padding: 8px 12px;
  background-color: #4a90e2;
  color: var(--educoding-white);
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #357ab7;
  }
`;
export const Preview = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-top: 10px;
  border: 2px solid #4a90e2;
`;

export const RightNicknameBox = styled.div.attrs({
  id: 'rightnicknamebox',
})`
  width: 80%;
  height: 50px;
  border-radius: 5px;
  border: 1px solid var(--educoding-line);
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  @media (max-width: 768px) {
    width: 80vw;
  }
`;
export const RightNicknameText = styled.div.attrs({
  id: 'rightnicknametext',
})`
  max-width: 90%;
  font-family: bold, sans-serif;
  font-size: 14px;
  color: var(--educoding-white);
`;

export const RightNicknameIcon = styled.div.attrs({
  id: 'rightnicknameicon',
})<AccountProfileProps>`
  width: 10px;
  height: 10px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/edit_b.png' : '/images/icon/edit.png'})`};
`;
export const RightNicknameInput = styled.input`
  width: 100%;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  outline: none;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
  background-color: var(--educoding-dark);
`;

export const RightNicknameButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const NicknameErrorText = styled.p`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;
