import styled from 'styled-components';

export const CodingTest_CodeResultConsole = styled.div`
  display: flex;
  flex-direction: column;

  font-size: 14px;

  .console-outputs {
    display: flex;

    width: 100%;

    padding: 20px;

    box-sizing: border-box;

    color: var(--educoding-white);
    white-space: pre-wrap; /* 공백과 줄바꿈 유지 */
    word-break: break-all; /* width 초과 시 강제 줄바꿈 */
  }
`;
