import styled from 'styled-components';

export const RightChartContainer = styled.div.attrs({
  id: 'rightchartcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--educoding-line);
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const RightChartContainerEach = styled.div.attrs({
  id: 'rightchartcontainereach',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--educoding-line);
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
`;
