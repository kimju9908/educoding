import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

type FindPwProps = {
  isSecurityAvailable?: boolean;
  isEmailAvailable?: boolean;
  isLoading?: boolean;
  icon?: string | null;
  isEmail?: boolean;
  isPw?: boolean;
  isConPw?: boolean;
  isVisible?: boolean;
  isSecurity?: boolean;
};

export const Wrap = styled.div.attrs({
  id: 'wrap',
})`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--educoding-purple);
  justify-content: flex-start;
  align-items: center;
`;
export const BodyContainer = styled.div.attrs({
  id: 'bodycontainer',
})`
  width: 100%;
  height: 100%;
  padding-top: 50px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-bottom: 50px;
  background-color: rgba(0, 0, 0, 0.7);
`;

export const FloatingOuter = styled.div.attrs({
  id: 'floatingouter',
})`
  width: 90%;
  max-width: 900px;
  height: auto;
  display: flex;
  flex-direction: row;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  @media (max-width: 768px) {
    width: 360px;
  }
`;

export const FloatingLeftContainer = styled.div.attrs({
  id: 'floatingleftcontainer',
})`
  width: 360px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 10;
  gap: 50px;
  padding: 60px 0 60px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 10px;
    height: 100%;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.8);
    border-radius: 30px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }
`;
export const FloatingLeftResetContainer = styled.div.attrs({
  id: 'floatingleftResetcontainer',
})<FindPwProps>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 40px;
`;

export const InputDiv = styled.div.attrs({
  id: 'inputdiv',
})<FindPwProps>`
  width: 100%;
  height: 50px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  user-select: none;
  margin-top: 10px;
  &:focus {
    outline: none;
  }
`;
export const Input = styled.input.attrs({
  id: 'input',
})<FindPwProps>`
  width: 100%;
  height: 50px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  color: #313131;
  font-family: 'medium', sans-serif;
  font-size: 13px;
  padding-left: 40px;
  background-repeat: no-repeat;
  background-size: 10px auto;
  background-position: 20px center;
  background-image: url(${(props): string | null | undefined => props.icon});
  transition: all 0.3s ease-in-out;
  &:focus {
    outline: none;
  }
  ${(props) =>
    props.isEmail &&
    css`
      border: 2px solid black;
      width: 75%;
    `}
  ${(props) =>
    !props.isEmailAvailable &&
    css`
      border: 1px solid rgba(0, 0, 0, 0.5);
      width: 100%;
    `}
`;
export const InputSecurity = styled.input.attrs({
  id: 'inputsecurity',
})<FindPwProps>`
  width: 75%;
  height: 50px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  color: #313131;
  font-family: 'medium', sans-serif;
  font-size: 13px;
  padding-left: 40px;
  background-repeat: no-repeat;
  background-size: 10px auto;
  background-position: 20px center;
  background-image: url(${(props) => props.icon});
  transition: all 0.3s ease-in-out;
  &:focus {
    outline: none;
  }
  ${(props) =>
    props.isSecurity &&
    css`
      border: 2px solid black;
    `}
`;
export const FindIdOutput = styled.div.attrs({
  id: 'findoutput',
})`
  width: 100%;
  height: 100px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  color: #313131;
  font-family: 'medium', sans-serif;
  font-size: 13px;
  padding-left: 40px;
  transition: all 1s ease-in-out;
  margin-bottom: 40px;
`;
export const FindPwButton = styled.button.attrs({
  id: 'findpwbutton',
})<FindPwProps>`
  width: 25%;
  height: 50px;
  display: flex;
  position: relative;
  margin-left: 10px;
  align-items: center;
  justify-content: center;
  user-select: none;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  color: var(--educoding-white);
  font-family: 'medium', sans-serif;
  font-size: 13px;
  background-color: rgba(0, 0, 0, 0.8);
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  ${(props) =>
    props.isEmail === false &&
    css`
      display: none;
    `}
  ${(props) =>
    props.isEmail &&
    css`
      &:hover {
        background-color: var(--educoding-black);
      }
    `}
  border: none;
`;
export const FindPwButtonDiv = styled.div.attrs({
  id: 'findpwbutton',
})`
  width: 25%;
  height: 50px;
  display: flex;
  position: relative;
  margin-left: 10px;
  align-items: center;
  justify-content: center;
  user-select: none;
  color: var(--educoding-white);
  font-family: 'medium', sans-serif;
  font-size: 10px;
  border: none;
`;
export const FindPwButtonTimer = styled.div.attrs({
  id: 'findpwbuttontimer',
})`
  width: 50%;
  height: 50px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  user-select: none;
  color: var(--educoding-black);
  font-family: 'medium', sans-serif;
  font-size: 12px;
  border: none;
`;
export const FindPwButtonRefresh = styled.div.attrs({
  id: 'findpwbuttonrefresh',
})`
  width: 50%;
  height: 50px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  user-select: none;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  &::before {
    content: '';
    width: 50%;
    height: 50%;
    background-repeat: no-repeat;
    background-size: 15px 15px;
    background-position: center;
    background-image: url('/images/icon/refresh-1.png');
    position: absolute;
    z-index: 5;
    border-radius: 5px;
    transition: transform 0.3s ease-in-out;
  }
  &::after {
    content: '';
    width: 50%;
    height: 50%;
    position: absolute;
    background-color: #d6d6d6;
    border-radius: 5px;
  }
  &:hover::before {
    transform: rotate(180deg);
  }
`;
export const ValidEmailMessage = styled.span.attrs({
  id: 'validemailmessage',
})<FindPwProps>`
  width: 100%;
  min-height: 20px;
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  font-size: 10px;
  color: red;
  padding-bottom: 3px;
`;
export const SecurityButton = styled.button.attrs({
  id: 'securitybutton',
})<FindPwProps>`
  width: 25%;
  height: 50px;
  display: flex;
  position: relative;
  margin-left: 10px;
  align-items: center;
  justify-content: center;
  user-select: none;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  color: var(--educoding-white);
  font-family: 'medium', sans-serif;
  font-size: 13px;
  background-color: rgba(0, 0, 0, 0.8);
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  ${(props) =>
    props.isSecurity &&
    css`
      &:hover {
        background-color: var(--educoding-black);
      }
    `}
  border: none;
`;
export const ValidSecurityMessage = styled.span.attrs({
  id: 'validsecuritymessage',
})`
  width: 100%;
  min-height: 20px;
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  font-size: 10px;
  color: red;
  padding-bottom: 3px;
`;
export const ModifyPw = styled.button.attrs({
  id: 'modifypw',
})`
  width: 100%;
  height: 50px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  user-select: none;
  border-radius: 5px;
  background-color: ${(props) => (props.disabled ? '#f1f1f1' : '#313131')};
  cursor: pointer;
  border: none;
  margin-top: 10px;
  color: ${(props) => (props.disabled ? '#313131' : 'white')};
  transition: all 0.3s ease-in-out;
  font-size: 14px;
  font-family: 'medium', sans-serif;
`;

export const InputEach = styled.div.attrs({
  id: 'inputeach',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;
export const InputIndex = styled.div.attrs({
  id: 'inputindex',
})`
  width: 100%;
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  font-size: 12px;
  font-family: 'medium', sans-serif;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 10px;
`;
export const InputPwDiv = styled.div.attrs({
  id: 'inputpwdiv',
})`
  width: 100%;
  display: flex;
  position: relative;
  align-items: center;
  border: none;
  user-select: none;
  border-radius: 5px;
`;
export const InputPw = styled.input.attrs({
  id: 'inputpw',
})<FindPwProps>`
  width: 100%;
  height: 50px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  color: #313131;
  font-family: 'medium', sans-serif;
  font-size: 13px;
  padding-left: 40px;
  background-repeat: no-repeat;
  background-size: 10px auto;
  background-position: 20px center;
  background-image: url('/images/icon/pwd.png');
  &:focus {
    outline: none;
  }
  ${(props) =>
    props.isPw &&
    css`
      border: 2px solid black;
    `}
`;
export const InputPwConfirm = styled.input.attrs({
  id: 'inputpwconfirm',
})<FindPwProps>`
  width: 100%;
  height: 50px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  color: #313131;
  font-family: 'medium', sans-serif;
  font-size: 13px;
  padding-left: 40px;
  background-repeat: no-repeat;
  background-size: 10px auto;
  background-position: 20px center;
  background-image: url('/images/icon/pwd.png');
  &:focus {
    outline: none;
  }
  ${(props) =>
    props.isConPw &&
    css`
      border: 2px solid black;
    `}
`;
export const InputPwDivToggle = styled.button.attrs({
  id: 'inputpwdivtoggle',
})<FindPwProps>`
  display: flex;
  position: absolute;
  align-items: center;
  border: none;
  background-color: transparent;
  border-radius: 5px;
  right: 10px;
  ${(props) =>
    props.isVisible
      ? css`
          &::before {
            content: '';
            position: absolute;
            background-repeat: no-repeat;
            background-size: contain;
            right: 10px;
            margin-top: 5px;
            width: 15px;
            height: 15px;
            background-image: url('/images/icon/eye_open.png');
            z-index: 5;
            cursor: pointer;
          }
        `
      : css`
          &::before {
            content: '';
            position: absolute;
            background-repeat: no-repeat;
            background-size: contain;
            right: 10px;
            top: -11px;
            margin-top: 5px;
            width: 15px;
            height: 15px;
            background-image: url('/images/icon/eye_close.png');
            z-index: 5;
            cursor: pointer;
          }
        `}
`;
export const ValidPwMessage = styled.span.attrs({
  id: 'validpwmessage',
})`
  width: 100%;
  min-height: 20px;
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  font-size: 10px;
  color: red;
  padding-bottom: 3px;
`;
export const FloatingRightContainer = styled.div.attrs({
  id: 'floatingrightcontainer',
})`
  width: calc(100% - 360px);
  height: auto;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
  align-items: left;
  padding: 0 70px;
  @media (max-width: 768px) {
    display: none;
  }
`;

export const FloatingRightTitle = styled.div.attrs({
  id: 'floatingrighttitle',
})`
  color: white;
  font-family: heavy, sans-serif;
  font-size: 40px;
  line-height: 140%;
  white-space: normal;
  word-wrap: break-word;
`;

export const FloatingRightText = styled.div.attrs({
  id: 'floatingrighttext',
})`
  color: white;
  font-family: regular, sans-serif;
  font-size: 14px;
  line-height: 160%;
  white-space: normal;
  word-wrap: break-word;
`;
export const BottomNoticeContainer = styled.div.attrs({
  id: 'bottomnoticecontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  position: absolute;
  justify-content: center;
  align-items: center;
  color: var(--educoding-white);
  bottom: 10px;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const BottomNoticeText = styled.div.attrs({
  id: 'bottomnoticetext',
})`
  width: 150px;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 12px;
  font-family: bold, sans-serif;
  user-select: none;
  cursor: pointer;
  & + &::before {
    content: '';
    position: absolute;
    left: -7px;
    bottom: 5px;
    width: 10px;
    height: 1px;
    background-color: #dadcdf;
    transform: rotate(90deg);
  }
`;
