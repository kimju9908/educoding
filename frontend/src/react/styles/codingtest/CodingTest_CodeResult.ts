import styled from 'styled-components';

export const CodingTest_CodeResult = styled.div`
  width: 100%;

  box-sizing: border-box;

  & > div:first-child {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 15px;
    background-color: var(--educoding-black);
    height: 40px;
    border-bottom: 1px solid var(--educoding-line);
    & > span {
      display: inline-block;
      padding: 10px 0;
      font-size: 16px;
      font-family: heavy, sans-serif;
      color: var(--educoding-white);
    }
  }

  & > div:last-child {
    display: flex;
    flex-direction: column;

    width: 100%;
    height: 100%;

    padding: 20px;

    overflow-y: auto;

    background-color: var(--educoding-dark);

    color: var(--educoding-white);

    & > p {
      font-size: 14px;
    }

    .error-title {
      display: inline-block;

      padding-bottom: 1em;

      font-size: 16px;
    }

    ul {
      list-style: none;
    }

    li {
      margin-bottom: 15px;

      & > p {
        font-size: 16px;
      }

      & > span {
        margin-right: 12px;
      }
    }

    li:not(ul > li:last-child) {
      margin-bottom: 2em;
    }
  }

  ::-webkit-scrollbar {
    width: 14px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  ::-webkit-scrollbar-track {
    background-color: transparent; /* 배경을 투명으로 설정 */
  }

  ::-webkit-scrollbar-button {
    display: none; /* 화살표 제거 */
  }
`;
