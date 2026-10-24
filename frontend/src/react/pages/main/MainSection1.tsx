import React, { JSX, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { MainSection1ContentsComponentProps } from './MainType';
import {
  MainSection1Container,
  MainSectionContents,
  MainSectionContentsContainer,
  MainSectionImg,
  MainSectionTextContainer,
  MainSectionTextContents,
  MainSectionTextTitle,
  MiddleTitle,
  MiddleTitleBar,
  MiddleTitleContainer,
} from '../../styles/main/Main';

const MainSection1 = (): JSX.Element => {
  const navigate = useNavigate();
  const MainSection1ContentsComponent: React.FC<MainSection1ContentsComponentProps> = ({
    title,
    contents,
    defaultImg,
    hoverImg,
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
        <MainSectionImg isHovered={isHovered} defaultImg={defaultImg} hoverImg={hoverImg} />
        <MainSectionTextContainer isHovered={isHovered}>
          <MainSectionTextTitle isHovered={isHovered}>{title}</MainSectionTextTitle>
          <MainSectionTextContents isHovered={isHovered}>{contents}</MainSectionTextContents>
        </MainSectionTextContainer>
      </MainSectionContents>
    );
  };

  return (
    <MainSection1Container>
      <MiddleTitleContainer>
        <MiddleTitleBar />
        <MiddleTitle>프로그래밍 언어 공부</MiddleTitle>
      </MiddleTitleContainer>
      <MainSectionContentsContainer>
        <MainSection1ContentsComponent
          title="Java 완전 정복!"
          contents="따라가다 보면 어느새 익숙해집니다!"
          defaultImg="/images/program/java_white.png"
          hoverImg="/images/program/java_full.png"
          navigateTo="/study/java"
        />
        <MainSection1ContentsComponent
          title="Python 마스터하기!"
          contents="강력한 기능을 배우고 실력을 키워보세요!"
          defaultImg="/images/program/python_white.png"
          hoverImg="/images/program/python_full.png"
          navigateTo="/study/python"
        />
        <MainSection1ContentsComponent
          title="C 프로그래밍 핵심 개념"
          contents="기초 문법부터 메모리 관리까지"
          defaultImg="/images/program/c_white.png"
          hoverImg="/images/program/c_full.png"
          navigateTo="/study/c"
        />
      </MainSectionContentsContainer>
    </MainSection1Container>
  );
};

export default MainSection1;
