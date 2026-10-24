import styled from 'styled-components';

export const RightContainerEach = styled.div.attrs({
  id: 'rightcontainereach',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
export const RightContentsContainer = styled.div.attrs({
  id: 'rightcontentscontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--educoding-line);
  padding: 50px 50px;
  gap: 30px;
`;

export const WithdrawalHeadline = styled.div.attrs({
  id: 'withdrawalheadline',
})`
  width: 100%;
  color: var(--educoding-white);
  font-family: extrabold, sans-serif;
  font-size: 16px;
  text-align: center;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;
export const WithdrawalText = styled.div.attrs({
  id: 'withdrawaltext',
})`
  position: relative;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-family: regular, sans-serif;
  line-height: 20px;
  color: var(--educoding-white);
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const CheckBoxGroup = styled.div.attrs({
  id: 'checkboxgroup',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

export const ContentsCheckText = styled.div.attrs({
  id: 'contentschecktext',
})`
  position: relative;
  font-size: 14px;
  font-family: extrabold, sans-serif;
  padding-bottom: 3px;
  color: var(--educoding-white);
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const WithdrawnContainer = styled.div.attrs({
  id: 'withdrawncontainer',
})`
  width: 100%;
  height: calc(100vh - 40vh - 18px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20vh;
  padding-bottom: 20vh;
`;
export const WithdrawnHeadline = styled.div.attrs({
  id: 'withdrawnheadline',
})`
  width: 100%;
  color: var(--educoding-white);
  font-family: extrabold, sans-serif;
  font-size: 20px;
  text-align: center;
  margin-bottom: 10px;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;
export const WithdrawnText = styled.div.attrs({
  id: 'withdrawntext',
})`
  position: relative;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  font-family: regular, sans-serif;
  text-align: center;
  line-height: 24px;
  color: var(--educoding-white);
  margin-bottom: 30px;
  @media (max-width: 768px) {
    font-size: 12px;
    line-height: 20px;
  }
`;
