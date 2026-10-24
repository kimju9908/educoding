import styled from 'styled-components';

export const StudySubjectContainer = styled.div.attrs({
  id: 'studysubjectcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--educoding-line);
`;

export const StudyEachSubject = styled.div.attrs({
  id: 'studyeachsubject',
})`
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background-color: var(--educoding-dark);
  gap: 20px;
  padding: 0 30px 0 20px;
  transition: 0.3s ease-in-out;
  cursor: pointer;
  &:hover {
    background-color: var(--educoding-hover);
  }
`;

export const StudySubjectIMG = styled.div.attrs({
  id: 'studysubjectimg',
})`
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
`;

export const StudySubjectName = styled.div.attrs({
  id: 'studysubjectname',
})`
  width: 100px;
  color: var(--educoding-white);
  font-family: extrabold, sans-serif;
  font-size: 14px;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const StudySubjectRateContainer = styled.div.attrs({
  id: 'studysubjectratecontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const StudySubjectRateText = styled.div.attrs({
  id: 'studysubjectratetext',
})`
  color: var(--educoding-white);
  font-family: bold, sans-serif;
  font-size: 14px;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const StudySubjectRateDot = styled.div.attrs({
  id: 'studysubjectratedot',
})`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--educoding-purple);
`;

export const StudySubjectHoverContainer = styled.div.attrs({
  id: 'studysubjecthovercontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
`;

export const StudySubjectHoverText = styled.div.attrs({
  id: 'studysubjecthovertext',
})`
  color: var(--educoding-white);
  font-family: bold, sans-serif;
  font-size: 14px;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const StudySubjectHoverArrow = styled.div.attrs({
  id: 'studysubjecthoverarrow',
})`
  color: var(--educoding-white);
  font-family: light, sans-serif;
  font-size: 8px;
`;

export const PageSubContainer = styled.div.attrs({
  id: 'pagesubcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const PageSubTitleBarCodingTest = styled.div.attrs({
  id: 'pagesubtitlebarcodingtest',
})`
  width: 100%;
  height: 40px;
  background-color: var(--educoding-header);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
`;

export const PageSubTitleBarLeftBox = styled.div.attrs({
  id: 'pagesubtitlebarleftbox',
})`
  color: white;
  font-family: extrabold, sans-serif;
  font-size: 14px;
`;

export const PageSubTitleBarRightBox = styled.div.attrs({
  id: 'pagesubtitlebarrightbox',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
`;

export const PageSubTitleBarRightText = styled.div.attrs({
  id: 'pagesubtitlebarrighttext',
})`
  color: white;
  font-family: extrabold, sans-serif;
  font-size: 14px;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const PageSubTitleBarRightArrow = styled.div.attrs({
  id: 'pagesubtitlebarrightarrow',
})`
  color: white;
  font-family: regular;
  font-size: 10px;
`;

export const TableBox = styled.table.attrs({
  id: 'tablebox',
})`
  width: 100%;
  table-layout: fixed; // ★ 균등한 너비 분배
  border-collapse: collapse;
  border-bottom: 1px solid var(--educoding-line);
`;

export const StyledTH = styled.tr.attrs({
  id: 'styledth',
})`
  height: 40px;
  background-color: var(--educoding-dark);
  color: var(--educoding-white);
  font-family: extrabold, sans-serif;
  font-size: 14px;
  text-align: center;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const StyledTR = styled.tr.attrs({
  id: 'styledtr',
})`
  height: 40px;
  background-color: var(--educoding-hover);
  color: var(--educoding-white);
  font-family: regular, sans-serif;
  font-size: 14px;
  text-align: center;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const StyledTD = styled.td.attrs({
  id: 'styledtd',
})`
  width: 10%; // ★ 10개 컬럼 기준 (100% / 10)
  height: 40px;
  color: var(--educoding-white);
  text-align: center;
`;

export const PCInner = styled.div.attrs({
  id: 'pcinner',
})`
  display: block;
  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileInner = styled.div.attrs({
  id: 'mobileinner',
})`
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;
