import styled, { css, keyframes } from 'styled-components';

// 챕터 = 검정, 챕터 안의 세부 항목 = 연한 회색.
// 다크 테마 배경에서도 검정이 보이도록 트랙은 밝은 캡슐 패널 위에 올린다 (테마와 무관하게 고정 색상)
const CHAPTER_COLOR = '#111111';
const ITEM_COLOR = '#c9c9c9';
const PANEL_COLOR = 'rgba(250, 250, 250, 0.96)';

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
`;

const popIn = keyframes`
  0% { opacity: 0; transform: translate(8px, -50%) scale(0.85); }
  70% { opacity: 1; transform: translate(-2px, -50%) scale(1.03); }
  100% { opacity: 1; transform: translate(0, -50%) scale(1); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.55); }
  70% { box-shadow: 0 0 0 7px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const ripple = keyframes`
  from { opacity: 0.6; transform: translate(50%, -50%) scale(0.2); }
  to { opacity: 0; transform: translate(50%, -50%) scale(1); }
`;

// 강의 본문 오른쪽에 떠 있는 캡슐 모양 챕터 내비게이터
export const ScrollNavRail = styled.nav.attrs({
  id: 'scrollnavrail',
})`
  position: fixed;
  z-index: 5;
  width: 44px;
  padding: 14px 0;
  border-radius: 22px;
  background-color: ${PANEL_COLOR};
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  animation: ${slideIn} 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition:
    width 0.25s ease,
    box-shadow 0.25s ease;
  &:hover {
    box-shadow: 0 6px 26px rgba(0, 0, 0, 0.28);
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

// 마커가 놓이는 실제 영역 (패널의 위아래 여백을 뺀 부분)
export const ScrollNavInner = styled.div.attrs({
  id: 'scrollnavinner',
})`
  position: relative;
  width: 100%;
  height: 100%;
`;

export const ScrollNavTrack = styled.div.attrs({
  id: 'scrollnavtrack',
})`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 9px;
  width: 2px;
  border-radius: 2px;
  background-color: #e4e4e4;
  pointer-events: none;
`;

// 지금 읽고 있는 위치까지 차오르는 진행선
export const ScrollNavProgress = styled.div.attrs({
  id: 'scrollnavprogress',
})`
  position: absolute;
  top: 0;
  right: 9px;
  width: 2px;
  border-radius: 2px;
  background: linear-gradient(to bottom, rgba(99, 102, 241, 0.35), var(--educoding-purple));
  pointer-events: none;
  transition: height 0.15s linear;
`;

export const ScrollNavProgressHead = styled.div.attrs({
  id: 'scrollnavprogresshead',
})`
  position: absolute;
  right: 6px;
  width: 8px;
  height: 8px;
  margin-top: -4px;
  border-radius: 50%;
  background-color: var(--educoding-purple);
  pointer-events: none;
  animation: ${pulse} 1.8s ease-out infinite;
  transition: top 0.15s linear;
`;

type MarkerProps = {
  $level: 1 | 2;
  $active: boolean;
  $hovered: boolean;
};

// 마커 하나 = 트랙에서 왼쪽으로 뻗는 '-' (길이는 마우스와의 거리에 따라 인라인 style로 조절)
export const ScrollNavMarker = styled.button.attrs({
  id: 'scrollnavmarker',
})<MarkerProps>`
  position: absolute;
  right: 11px;
  height: ${(props) => (props.$level === 1 ? '3px' : '2px')};
  margin-top: ${(props) => (props.$level === 1 ? '-1.5px' : '-1px')};
  padding: 0;
  border: none;
  border-radius: 2px;
  background-color: ${(props) => (props.$level === 1 ? CHAPTER_COLOR : ITEM_COLOR)};
  pointer-events: none; /* 클릭은 패널이 가장 가까운 마커를 골라서 처리 */
  z-index: ${(props) => (props.$level === 1 ? 2 : 1)};
  transition:
    width 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.2s ease;
  ${(props) =>
    props.$hovered &&
    css`
      background-color: ${props.$level === 1 ? CHAPTER_COLOR : '#9a9a9a'};
    `}
  /* 현재 읽고 있는 챕터: 앞쪽에 보라색 점 */
  ${(props) =>
    props.$active &&
    css`
      &::before {
        content: '';
        position: absolute;
        left: -7px;
        top: 50%;
        width: 4px;
        height: 4px;
        margin-top: -2px;
        border-radius: 50%;
        background-color: var(--educoding-purple);
      }
    `}
  &:focus-visible {
    outline: 2px solid var(--educoding-purple);
    outline-offset: 2px;
  }
`;

type TooltipProps = {
  $level: 1 | 2;
};

// 마우스를 올린 항목 이름 (패널 왼쪽에 말풍선으로)
export const ScrollNavTooltip = styled.div.attrs({
  id: 'scrollnavtooltip',
})<TooltipProps>`
  position: absolute;
  right: 54px;
  padding: 6px 12px;
  border-radius: 8px;
  pointer-events: none;
  font-size: 12px;
  line-height: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  animation: ${popIn} 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
  ${(props) =>
    props.$level === 1
      ? css`
          font-family: bold, sans-serif;
          color: #ffffff;
          background-color: ${CHAPTER_COLOR};
        `
      : css`
          font-family: regular, sans-serif;
          color: #555555;
          background-color: #f4f4f4;
          border: 1px solid #dddddd;
        `}
  &::after {
    content: '';
    position: absolute;
    right: -5px;
    top: 50%;
    width: 10px;
    height: 10px;
    margin-top: -5px;
    transform: rotate(45deg);
    background-color: inherit;
    border-right: inherit;
    border-top: inherit;
  }
`;

export const ScrollNavTooltipText = styled.span`
  display: block;
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// 세부 항목 말풍선 위에 작게 붙는 "챕터 이름 ›" (어느 챕터 소속인지)
export const ScrollNavTooltipParent = styled.span`
  display: block;
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 10px;
  color: #999999;
`;

export const ScrollNavRipple = styled.span.attrs({
  id: 'scrollnavripple',
})`
  position: absolute;
  right: 10px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--educoding-purple);
  pointer-events: none;
  animation: ${ripple} 0.5s ease-out forwards;
`;
