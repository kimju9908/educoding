import styled from 'styled-components';

export const ExamContainer = styled.div.attrs({
  id: 'examcontainer',
})`
  width: 100%;
  background-color: var(--educoding-dark);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
export const ExamHeader = styled.div.attrs({
  id: 'examheader',
})`
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--educoding-header);
  transition:
    border-radius 1s ease-in-out,
    background-color 1s ease-in-out;
`;

export const ExamHeaderTitle = styled.div.attrs({
  id: 'examheadertitle',
})`
  width: 90%;
  padding-left: 15px;
  color: white;
  font-size: 14px;
  font-family: extrabold, sans-serif;
`;
export const ExamContentsContainer = styled.div.attrs({
  id: 'examcontentscontainer',
})`
  width: 100%;
  gap: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
`;
export const EachQuest = styled.div.attrs({
  id: 'eachquest',
})`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: baseline;
  border-bottom: 1px solid var(--educoding-line);
`;
export const QuestTitleArea = styled.div.attrs({
  id: 'questtitlearea',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding-top: 20px;
  padding-left: 15px;
  gap: 5px;
  padding-bottom: 20px;
  @media (max-width: 768px) {
    padding-bottom: 10px;
  }
`;
export const QuestTitleLeft = styled.div.attrs({
  id: 'questtitleleft',
})`
  display: flex;
  justify-content: flex-start;
  font-family: extrabold, sans-serif;
  font-size: 14px;
  color: var(--educoding-white);
`;
export const QuestTitleRight = styled.div.attrs({
  id: 'questtitleright',
})`
  font-family: extrabold, sans-serif;
  font-size: 14px;
  color: var(--educoding-white);
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
export const QuestExamplesArea = styled.div.attrs({
  id: 'questexamplesarea',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-left: 25px;
  padding-bottom: 20px;
  gap: 5px;
  @media (max-width: 768px) {
    padding-left: 10px;
    padding-bottom: 10px;
  }
`;
export const QuestEachExample = styled.div.attrs({
  id: 'questeachexample',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
`;
export const QuestEachExampleLeft = styled.div.attrs({
  id: 'questeachexampleleft',
})`
  display: flex;
  justify-content: center;
  align-items: top;
`;
export const QuestEachExampleRight = styled.div.attrs({
  id: 'questeachexampleright',
})`
  width: 100%;
  color: var(--educoding-white);
  font-family: extrabold, sans-serif;
  font-size: 13px;
  line-height: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  padding-right: 20px;
`;
export const QuestAnswerArea = styled.div.attrs({
  id: 'questanswerarea',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  border-top: 1px solid var(--educoding-line);
  @media (max-width: 768px) {
    border-bottom: 1px solid var(--educoding-line);
    flex-direction: column;
    height: 100%;
  }
`;
export const QuestAnswerText = styled.div.attrs({
  id: 'questanswertext',
})`
  width: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  align-items: center;
  padding: 10px;
  @media (max-width: 768px) {
    height: 70px;
    width: 100%;
  }
`;

export const QuestAnswerTextEachLine = styled.div.attrs({
  id: 'questanswertexteachline',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 5px;
`;
export const QuestAnswerTextLeft = styled.div.attrs({
  id: 'questanswertextleft',
})`
  color: var(--educoding-white);
  font-family: extrabold, sans-serif;
  font-size: 12px;
  display: flex;
  white-space: no-wrap;
  min-width: 25px;
`;
export const QuestAnswerTextRight = styled.div.attrs({
  id: 'questanswertextright',
})`
  color: var(--educoding-white);
  font-family: bold, sans-serif;
  font-size: 12px;
  word-break: break-word;
  overflow-wrap: break-word;
`;
