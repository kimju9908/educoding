import styled from 'styled-components';

// 버튼 + Drawer를 한 덩어리로 묶는 칸. persistent Drawer는 포털이 아니라 제자리에 렌더링되므로,
// 이렇게 묶지 않으면 결과 출력 헤더(space-between)의 flex 자식이 늘어나 버튼이 가운데로 밀린다.
export const AiReviewSlot = styled.div`
  display: flex;
  align-items: center;
`;

// 결과 출력 헤더에 들어가는 버튼
export const AiReviewButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  font-family: bold, sans-serif;
  font-size: 13px;
  color: #fff;
  background: var(--educoding-gradient);
  cursor: pointer;

  &[data-state='failed'] {
    background: var(--educoding-orange);
  }
  &:focus-visible {
    outline: 2px solid var(--educoding-blue);
    outline-offset: 2px;
  }
`;

// Drawer 안쪽 (Drawer는 포털로 렌더링되므로 페이지 CssWrapper 밖)
export const AiReviewPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: regular, sans-serif;
  color: var(--educoding-white);
  background-color: var(--educoding-dark);

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    padding: 0 15px;
    background-color: var(--educoding-black);
    border-bottom: 1px solid var(--educoding-line);

    strong {
      font-family: heavy, sans-serif;
      font-size: 16px;
    }
    small {
      margin-left: 8px;
      color: var(--educoding-muted);
      font-size: 12px;
    }
    button {
      all: unset;
      cursor: pointer;
      font-size: 13px;
      color: var(--educoding-muted);
      &:hover {
        color: var(--educoding-white);
      }
    }
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 18px 24px;
    font-size: 14px;
    line-height: 1.6;
  }

  .status-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 10px;
    text-align: center;
    color: var(--educoding-muted);

    .error {
      color: var(--educoding-orange);
    }
  }

  section {
    margin-bottom: 20px;
  }

  h4 {
    margin: 0 0 8px;
    font-family: extrabold, sans-serif;
    font-size: 14px;
    color: var(--educoding-white);
  }

  ul {
    margin: 0;
    padding-left: 18px;
  }

  .note {
    margin-top: 6px;
    font-size: 12px;
    color: var(--educoding-muted);
  }

  .improvement {
    margin-bottom: 14px;
    padding: 12px;
    border: 1px solid var(--educoding-line);
    border-radius: 8px;
    background-color: var(--educoding-surface);

    .improvement-head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .badge {
      padding: 1px 8px;
      border-radius: 10px;
      font-size: 12px;
      font-family: bold, sans-serif;
      color: #fff;
      background-color: var(--educoding-purple);
      &.bug {
        background-color: #dc2626;
      }
    }
    .lines {
      font-size: 12px;
      color: var(--educoding-muted);
    }
    p {
      margin: 0;
      white-space: pre-wrap;
    }
    .example-label {
      margin: 10px 0 4px;
      font-size: 12px;
      color: var(--educoding-muted);
    }
    pre {
      margin: 0;
      padding: 10px;
      overflow-x: auto;
      border-radius: 6px;
      background-color: var(--educoding-black);
      font-size: 13px;
      white-space: pre;
    }
  }

  a {
    color: var(--educoding-blue);
  }

  .retry-btn {
    all: unset;
    padding: 6px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-family: bold, sans-serif;
    color: #fff;
    background: var(--educoding-gradient);
  }
`;
