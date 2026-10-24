import styled from 'styled-components';

import { CropSizeType } from '../../pages/mypage/MyPageType';

type MyPageAccountProps = {
  icon?: string;
  isDragging?: boolean;
  image?: string | null;
  crosSize?: CropSizeType;
};

export const RightAccountContainer = styled.div.attrs({
  id: 'rightaccountcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
export const RightAccountLeftContainer = styled.div.attrs({
  id: 'rightaccountleftcontainer',
})`
  width: 70%;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    order: 2;
  }
`;
export const RightAccountRightContainer = styled.div.attrs({
  id: 'rightaccountrightcontainer',
})`
  width: 30%;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    order: 1;
  }
`;
export const RightContainerEach = styled.div.attrs({
  id: 'rightcontainereach',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--educoding-line);
`;
export const RightContentsContainer = styled.div.attrs({
  id: 'rightcontentscontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: space-evenly;
`;
export const AccountEachContainer = styled.div.attrs({
  id: 'AccountEachContainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: space-evenly;
  gap: 10px;
  padding: 10px 15px;
`;
export const InputContainer = styled.div.attrs({
  id: 'inputcontainer',
})`
  width: 100%;
  height: 50px;
  display: flex;
  position: relative;
  user-select: none;
  flex-direction: row;
  font-family: 'medium', sans-serif;
  gap: 10px;
`;

export const AlertTitle = styled.div.attrs({
  id: 'alerttitle',
})`
  width: 100%;
  display: flex;
  position: relative;
  font-size: 14px;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
`;
export const AlertText = styled.div.attrs({
  id: 'alerttext',
})`
  position: relative;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  font-family: regular, sans-serif;
  color: var(--educoding-white);
`;
export const RightAlertContentsEach1 = styled.div.attrs({
  id: 'rightalertcontentseach1',
})`
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid var(--educoding-line);
  padding: 15px 15px;
`;
export const RightAlertContentsEach2 = styled.div.attrs({
  id: 'rightalertcontentseach2',
})`
  display: flex;
  flex-direction: row;
  padding: 15px 15px;
`;

export const RightAlertContentsInner = styled.div.attrs({
  id: 'rightalertcontentsinner',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
  gap: 10px;
`;

export const RightSNSContentsEach = styled.div.attrs({
  id: 'rightsnscontentseach',
})`
  display: flex;
  padding: 0 10px;
`;

export const RightSNSContentsInner = styled.div.attrs({
  id: 'rightsnscontentsinner',
})`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 20px;
`;

export const SNSIcon = styled.div.attrs({
  id: 'snsicon',
})<MyPageAccountProps>`
  width: 60px;
  height: 60px;
  display: flex;
  position: relative;
  background-repeat: no-repeat;
  background-size: 50%;
  background-position: center;
  background-image: url(${(props) => props.icon});
  opacity: 0.7;
`;
export const SNSTitle = styled.div.attrs({
  id: 'snstitle',
})`
  width: 100%;
  display: flex;
  position: relative;
  font-size: 14px;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
`;
export const SubjectContainer = styled.div.attrs({
  id: 'Subjectcontainer',
})`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  flex-direction: row;
  align-items: top;
  justify-content: center;
  gap: 25px;
`;
