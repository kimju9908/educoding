import React, { useEffect, JSX } from 'react';

import { useOutletContext, useParams } from 'react-router-dom';

import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  MobileInner,
} from '../../../styles/codingtest/CodingTest_Main';
import { LevelTypeArray, LevelTypeObject, OutletContextType } from '../CodingTestType';
import CodingTest_QuestList from '../components/CodingTest_QuestList';
import Level_Explain from '../components/Level_Explain';
import Level_List from '../components/Level_List';
import Level_Title from '../components/Level_Title';

// User Nickname, 등급
// Coding Test 난이도 받아와야함
// 경로 받아와야함
const CodingTest_Main = (): JSX.Element => {
  const { level } = useParams();

  // const nickname = useAppSelector((state) => state.auth.nickname);
  const mainContentRef = useOutletContext<OutletContextType>();

  // 페이지 진입 시 스크롤 위치 초기화
  useEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  // const accessToken = useAppSelector((state) => state.auth.accesstoken);
  // const userId = accessToken ? JwtDecoding.getFieldFromToken(accessToken, 'sub') : null;

  // const profile = useAppSelector((state) => state.auth.profile);

  const levels: LevelTypeArray = [
    { name: 'practice' },
    { name: 'basic' },
    { name: 'intermediate' },
    { name: 'expert' },
  ];

  const levelNames: LevelTypeObject = {
    practice: '연습문제',
    basic: '1단계',
    intermediate: '2단계',
    expert: '3단계',
  };

  const currentLevel = levels.find((lvl) => lvl.name === level);

  return (
    <>
      <Wrap>
        <Container>
          <LeftContainer>
            {currentLevel ? (
              <Level_Title level={currentLevel.name} key={currentLevel.name} />
            ) : null}
            <Level_Explain level={level} />
            <Level_List level={level} />
          </LeftContainer>
          <RightContainer>
            <PageTitleBar>코딩테스트 {levelNames[level as keyof LevelTypeObject]}</PageTitleBar>
            <CodingTest_QuestList level={level} />
          </RightContainer>
          <MobileInner>
            <PageTitleBar>코딩테스트 {levelNames[level as keyof LevelTypeObject]}</PageTitleBar>
            {currentLevel ? (
              <Level_Title level={currentLevel.name} key={currentLevel.name} />
            ) : null}
            <CodingTest_QuestList level={level} />
          </MobileInner>
        </Container>
      </Wrap>
    </>
  );
};

export default CodingTest_Main;
