import React, { JSX, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';

import { MainSection2ContentsComponentProps } from './MainType';
import {
  MainSectionContents,
  MainSectionContentsContainer,
  MainSectionImg,
  MainSectionTextContainer,
  MainSectionTextContents,
  MainSectionTextTitle,
  MiddleTitle,
  MiddleTitleBar,
  MiddleTitleContainer,
  MainSection2Container,
} from '../../styles/main/Main';

const MainSection2 = (): JSX.Element => {
  const navigate = useNavigate();
  const theme = useTheme();

  const MainSection2ContentsComponent: React.FC<MainSection2ContentsComponentProps> = ({
    title,
    contents,
    defaultImg,
    hoverImg,
    lightImg,
    navigateTo,
  }) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const handleClick = (): void => {
      navigate(navigateTo); // 클릭 시 navigate로 경로 변경
    };
    return (
      <MainSectionContents
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <MainSectionImg
          isHovered={isHovered}
          defaultImg={defaultImg}
          hoverImg={hoverImg}
          lightImg={lightImg}
          theme={theme.palette.mode}
        />
        <MainSectionTextContainer isHovered={isHovered}>
          <MainSectionTextTitle isHovered={isHovered}>{title}</MainSectionTextTitle>
          <MainSectionTextContents isHovered={isHovered}>{contents}</MainSectionTextContents>
        </MainSectionTextContainer>
      </MainSectionContents>
    );
  };

  return (
    <MainSection2Container>
      <MiddleTitleContainer>
        <MiddleTitleBar />
        <MiddleTitle>코딩테스트</MiddleTitle>
      </MiddleTitleContainer>
      <MainSectionContentsContainer>
        <MainSection2ContentsComponent
          title="1단계: 기초 다지기"
          contents="알고리즘의 기초를 확실히 다져보세요."
          defaultImg="/images/codingtest/basic_white.png"
          hoverImg="/images/codingtest/basic_full.png"
          lightImg="/images/codingtest/basic_full_light.png"
          navigateTo="/codingtest/basic"
        />
        <MainSection2ContentsComponent
          title="2단계: 문제 해결 능력 키우기"
          contents="문제 해결 능력을 끌어올리세요."
          defaultImg="/images/codingtest/intermediate_white.png"
          hoverImg="/images/codingtest/intermediate_full.png"
          lightImg="/images/codingtest/intermediate_full_light.png"
          navigateTo="/codingtest/intermediate"
        />
        <MainSection2ContentsComponent
          title="3단계: 실전 준비"
          contents="최종 점검을로 시험에 임할 준비를 마칩니다!"
          defaultImg="/images/codingtest/expert_white.png"
          hoverImg="/images/codingtest/expert_full.png"
          lightImg="/images/codingtest/expert_full_light.png"
          navigateTo="/codingtest/expert"
        />
      </MainSectionContentsContainer>
    </MainSection2Container>
  );
};

export default MainSection2;
