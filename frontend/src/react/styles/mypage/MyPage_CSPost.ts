import styled, { keyframes, css } from 'styled-components';

type CSPostProps = {
  theme?: 'light' | 'dark';
  isOpen?: boolean;
  isOpenOther?: boolean;
  boardType?: string;
  userLikeCnt?: number | string;
  userDisLikeCnt?: number | string;
  expanded?: boolean;
  isProfile?: string | null;
};

export const MainPostExtra = styled.div.attrs({
  id: 'mainpostextra',
})`
  width: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  justify-content: flex-end;
`;
export const MainPostExtraButton = styled.div.attrs({
  id: 'mainpostextrabutton',
})<CSPostProps>`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-direction: row;
  cursor: pointer;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/m_menu_open_light.png' : '/images/icon/m_menu_open.png'})`};
`;
export const MainPostExtraItemContainer = styled.div.attrs({
  id: 'mainpostextraitemcontainer',
})<CSPostProps>`
  width: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 60px;
  right: 0px;
  border-radius: 10px !important;
  border: 1px solid var(--educoding-line) !important;
  background-color: var(--educoding-dark);
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.25);
  ${(props) => css`
    animation: ${props.isOpen || props.boardType === 'report' ? expandHeight : collapseHeight} 0.3s
      ease-out forwards;
  `}

  ${(props) =>
    !props.isOpen &&
    css`
      cursor: none;
      pointer-events: none;
      display: none;
    `}
`;

const expandHeight = keyframes`
  0% {
    height: 0;
    opacity: 0;
  }
  100% {
    height: 40px;
    opacity: 1;
  }
`;
const collapseHeight = keyframes`
  0% {
    width: 40px;
    opacity: 1;
  }
  100% {
    height: 0;
    opacity: 0;

  }
`;
export const MainPostExtraItem = styled.div.attrs({
  id: 'mainpostextraitem',
})<CSPostProps>`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  font-size: 12px;
  font-family: extrabold, sans-serif;
  user-select: none;
  cursor: pointer;
  color: var(--educoding-white);
  &:hover {
    background-color: var(--educoding-hover);
  }
  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
  ${(props) =>
    !props.isOpen &&
    css`
      color: transparent;
    `}
`;
