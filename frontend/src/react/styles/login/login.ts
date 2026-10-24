import { Link } from 'react-router-dom';

import styled, { css, keyframes } from 'styled-components';

type LoginProps = {
  icon?: string;
  isAvailable?: boolean | null;
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
  padding: 60px 0 0;
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
export const FloatingLeftLoginContainer = styled.div.attrs({
  id: 'floatingleftlogincontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 40px;
`;
export const FloatingLeftLoginExtra = styled.div.attrs({
  id: 'floatingleftloginextra',
})`
  width: 100%;
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  user-select: none;
`;
export const FloatingLeftExtraAutoLoginBox = styled.div.attrs({
  id: 'floatingleftextraautologinbox',
})`
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  user-select: none;
  gap: 5px;
`;
export const FloatingLeftExtraFindAccountBox = styled.div.attrs({
  id: 'floatingleftextrafindaccountbox',
})`
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  user-select: none;
`;

export const FloatingLeftExtraText = styled.p.attrs({
  id: 'floatingleftextratext',
})`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  font-family: bold, sans-serif;
  font-size: 12px;
  color: white;
  cursor: pointer;
`;
export const FloatingLeftExtraRightText = styled.p.attrs({
  id: 'floatingleftextrarighttext',
})`
  width: 80px;
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  user-select: none;
  font-family: bold, sans-serif;
  font-size: 12px;
  color: white;
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    font-weight: bold;
  }
  & + &::before {
    content: '';
    position: absolute;
    left: -15px;
    bottom: 11px;
    width: 11px;
    height: 1px;
    background-color: #313131;
    transform: rotate(90deg);
  }
`;

export const FloatingLeftSignupArea = styled.div.attrs({
  id: 'floatingleftsignuparea',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

export const FloatingLeftSignupLeftText = styled.div.attrs({
  id: 'floatingleftsignuplefttext',
})`
  color: white;
  font-family: regular, sans-serif;
  font-size: 12px;
`;

export const FloatingLeftSignupRightText = styled.div.attrs({
  id: 'floatingleftsignuprighttext',
})`
  color: var(--educoding-purple);
  font-family: extrabold, sans-serif;
  font-size: 12px;
  cursor: pointer;
`;

export const FloatingLeftSNSContainer = styled.div.attrs({
  id: 'floatingleftsnscontainer',
})`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: white;
  gap: 25px;
  position: static;
  left: 0;
  bottom: 0;
`;

export const FloatingLeftSNSText = styled.div.attrs({
  id: 'floatingleftsnstext',
})`
  color: black;
  font-family: bold, sans-serif;
  font-size: 12px;
`;

export const FloatingLeftSNSIconContainer = styled.div.attrs({
  id: 'floatingleftsnsiconcontainer',
})`
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

export const FloatingLeftSNSEachIcon = styled.div.attrs({
  id: 'floatingleftsnseachicon',
})`
  width: 15px;
  height: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: contain;
  background-position: center;
  opacity: 0.7;
  cursor: pointer;
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
