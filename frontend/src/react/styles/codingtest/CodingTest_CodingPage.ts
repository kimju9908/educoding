import styled from 'styled-components';

export const CodingTest_CodingPage = styled.div`
  background-color: var(--educoding-dark);
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  font-family: 'regular', sans-serif;
  overflow-y: hidden;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    border-bottom: 1px solid var(--educoding-line);
    & > div:first-child {
      display: flex;

      .logo-container {
        display: flex;
        align-items: center;
        height: 50px;
        padding: 0 16px;
        border-right: 1px solid var(--educoding-line);
        justify-content: center;
        align-items: center;

        /* 로고 대신 홈으로 가는 텍스트 링크 */
        .logo {
          font-family: extrabold, sans-serif;
          font-size: 15px;
          text-decoration: none;
          background: var(--educoding-gradient);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      }

      .menu-tree-indicator {
        display: flex;
        align-items: center;
        height: 50px;
        border-right: 1px solid var(--educoding-line);
        padding: 0 25px;
        justify-content: center;
        align-items: center;
        font-family: extrabold, sans-serif;
        font-size: 14px;
        margin-bottom: 2px;
        color: var(--educoding-white);
        & > span:nth-child(2)::before {
          content: '〉';
          font-family: regular, sans-serif;
          font-size: 10px;
          margin: 0 10px;
        }

        span:first-child {
          cursor: pointer;
        }
        span:last-child {
          cursor: pointer;
        }
      }
    }

    & > div:last-child {
      display: flex;
      align-items: center;

      * {
        font-family: 'regular', sans-serif;
      }

      .leave-page-btn {
        all: unset;
        width: 80px;
        height: 50px;
        background-color: var(--educoding-dark);
        border-left: 1px solid var(--educoding-line);
        border-bottom: 1px solid var(--educoding-line);
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--educoding-white);
        font-size: 14px;
        font-family: extrabold, sans-serif;
        &:hover {
          background-color: var(--educoding-purple);
          color: var(--educoding-white);
        }
      }
    }
  }

  main {
    display: flex;
    height: 100%;
    min-height: calc(100vh - 100px);
    & > div:first-child {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: calc(100% - 480px);
      min-width: 440px;
      border-right: 1px solid var(--educoding-line);

      & > div:first-child {
        flex: 1;

        @media (max-width: 767px) {
          & > section {
            min-height: 320px;
          }
        }
      }

      & > div:nth-child(2) {
        display: flex;
        flex-direction: column;

        height: 300px;
      }
    }

    & > div:last-child {
      display: flex;
      flex-direction: column;

      width: 480px;
    }
  }

  footer {
    height: 20px;
  }

  @media (max-width: 768px) {
    main {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      &::-webkit-scrollbar {
        width: 10px;
        height: 100%;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--educoding-hover);
      }
      &::-webkit-scrollbar-track {
        background: var(--educoding-dark);
      }

      & > div:first-child {
        width: 100%;
      }
      & > div:nth-child(2) {
        width: 100%;
        border-right: 1px solid var(--educoding-line);
        min-height: 300px;
      }

      & > div:first-child {
        flex: 1;

        & > section {
          min-height: 300px;
        }
      }
    }
  }
`;
