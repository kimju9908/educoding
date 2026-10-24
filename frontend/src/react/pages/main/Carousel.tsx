import { useState, useEffect, JSX } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  CarouselContainer,
  CarouselOuter,
  CarouselInner,
  CarouselTextBox,
  CarouselTextTitle,
  CarouselTextContents,
  CarouselImage,
  ArrowBox,
  LeftArrow,
  ArrowText,
  ArrowSlash,
  RightArrow,
} from '../../styles/main/Carousel';

const Carousel = (): JSX.Element => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const slides: Record<string, string>[] = [
    {
      backgroundColor: '#4f46e5',
      title: `기초부터 차근차근!\n작은 성취가 쌓여 실력이 됩니다.`,
      contents: `쉬운 문제부터 단계별로 도전하며 알고리즘 기본기를 탄탄하게 다져보세요.\n하나씩 해결할 때마다 자신감이 붙고, 문제 해결 능력이 자연스럽게 길러집니다!`,
      image: '/images/main/bannerimg01.png',
      link: '/codingtest/practice',
    },
    {
      backgroundColor: '#1e293b',
      title: `실무 개발자에게 코드 리뷰 받기\n여러분을 기다리고 있어요!`,
      contents: `혼자 공부하는 것보다 전문가의 피드백이 중요합니다.\n코드 리뷰를 통해 더 나은 개발자로 성장하세요!`,
      image: '/images/main/bannerimg02.png',
      link: '/community/coding',
    },
    {
      backgroundColor: '#0e7490',
      title: `정보처리기사 완벽 대비!\n기출부터 예상 문제까지, 체계적으로 학습하세요.`,
      contents: `출제 경향을 반영한 문제로 실력을 점검하고, 부족한 개념을 확실히 보완하세요.\n기본 이론부터 실전 대비까지, 효과적인 학습을 위한 최적의 연습 공간입니다!`,
      image: '/images/main/bannerimg04.png',
      link: '/test/mock/random',
    },
    {
      backgroundColor: '#7c3aed',
      title: `개발자로 성장하는 가장 빠른 길!\n경험과 인사이트를 나누는 1:1 멘토링`,
      contents: `실무 경험이 있는 멘토와 함께 고민을 해결하고, 커리어 성장을 가속화하세요.\n코드 리뷰부터 기술 면접 준비까지, 당신만을 위한 맞춤형 가이드를 제공합니다!`,
      image: '/images/main/bannerimg05.png',
      link: '/community/mentor',
    },
  ];

  const handlePrev = (): void => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const handleNext = (): void => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return (): void => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return (): void => clearTimeout(timer);
  }, [currentIndex]);

  const currentSlide = slides[currentIndex as number];

  const handleSlideClick = (): void => {
    navigate(currentSlide.link);
  };

  return (
    <CarouselContainer>
      <CarouselOuter
        style={{
          backgroundColor: currentSlide.backgroundColor,
          // 단색 위에 은은한 빛 번짐을 얹어서 평평해 보이지 않게 (바탕색은 슬라이드마다 부드럽게 전환)
          backgroundImage:
            'radial-gradient(circle at 85% 20%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 45%), linear-gradient(120deg, rgba(0, 0, 0, 0.15) 0%, rgba(255, 255, 255, 0.06) 100%)',
          transition: 'background-color 0.6s ease',
        }}
      >
        <CarouselInner>
          <CarouselTextBox>
            <ArrowBox>
              <LeftArrow
                onClick={handlePrev}
                textColor={currentSlide.backgroundColor}
              >{`<`}</LeftArrow>
              <ArrowText>{currentIndex + 1}</ArrowText>
              <ArrowSlash>/</ArrowSlash>
              <ArrowText>{slides.length}</ArrowText>
              <RightArrow
                onClick={handleNext}
                textColor={currentSlide.backgroundColor}
              >{`>`}</RightArrow>
            </ArrowBox>
            <CarouselTextTitle style={{ cursor: 'pointer' }} onClick={handleSlideClick}>
              {currentSlide.title.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </CarouselTextTitle>
            <CarouselTextContents style={{ cursor: 'pointer' }} onClick={handleSlideClick}>
              {currentSlide.contents.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </CarouselTextContents>
          </CarouselTextBox>
          <CarouselImage
            style={{
              backgroundImage: `url(${currentSlide.image})`,
              transition: 'opacity 0.5s ease',
              cursor: 'pointer',
            }}
            onClick={handleSlideClick}
          />
        </CarouselInner>
      </CarouselOuter>
    </CarouselContainer>
  );
};

export default Carousel;
