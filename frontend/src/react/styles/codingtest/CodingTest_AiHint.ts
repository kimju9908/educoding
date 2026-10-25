import styled from 'styled-components';

import { AiReviewPanel } from './CodingTest_AiReview';

// AI 코드 리뷰 패널과 같은 틀에 힌트 전용 요소만 더한다
export const AiHintPanel = styled(AiReviewPanel)`
  .basis {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    select {
      padding: 6px;
      border-radius: 6px;
      color: var(--educoding-white);
      background-color: var(--educoding-surface);
      border: 1px solid var(--educoding-line);
    }
  }
  .steps {
    display: flex;
    gap: 6px;
    margin: 14px 0;
    padding: 0;
    list-style: none;
    li {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px 0;
      border-radius: 8px;
      font-size: 12px;
      border: 1px solid var(--educoding-line);
      color: var(--educoding-muted);
      span {
        font-family: heavy, sans-serif;
        font-size: 14px;
      }
      &[data-state='done'] {
        color: var(--educoding-white);
        border-color: var(--educoding-purple);
      }
      &[data-state='generating'] {
        color: var(--educoding-blue);
        border-color: var(--educoding-blue);
      }
      &[data-state='failed'] {
        color: var(--educoding-orange);
        border-color: var(--educoding-orange);
      }
    }
  }
  .hint {
    padding: 12px;
    border: 1px solid var(--educoding-line);
    border-radius: 8px;
    background-color: var(--educoding-surface);
    p {
      margin: 0 0 6px;
      white-space: pre-wrap;
    }
    .label {
      margin-top: 10px;
      font-size: 12px;
      color: var(--educoding-muted);
    }
    .asked {
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
    }
  }
  .hint-head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    .level {
      font-family: extrabold, sans-serif;
    }
    small {
      color: var(--educoding-muted);
    }
  }
  .insight {
    margin-top: 10px;
    .badge {
      padding: 1px 8px;
      border-radius: 10px;
      font-size: 12px;
      color: #fff;
      background-color: var(--educoding-purple);
      &.guess {
        background-color: var(--educoding-orange);
      }
    }
  }
  .error {
    color: var(--educoding-orange);
  }
  .ask {
    display: flex;
    flex-direction: column;
    gap: 6px;
    textarea {
      min-height: 60px;
      padding: 8px;
      border-radius: 6px;
      resize: vertical;
      color: var(--educoding-white);
      background-color: var(--educoding-surface);
      border: 1px solid var(--educoding-line);
    }
    small {
      align-self: flex-end;
      color: var(--educoding-muted);
    }
  }
  .next-btn {
    all: unset;
    text-align: center;
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-family: bold, sans-serif;
    color: #fff;
    background: var(--educoding-gradient);
    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
`;
