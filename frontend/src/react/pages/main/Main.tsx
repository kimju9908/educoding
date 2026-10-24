import { JSX, useLayoutEffect } from 'react';

import { useOutletContext } from 'react-router-dom';

import Carousel from './Carousel';
import { Container, Wrap, MainBlockImg01 } from '../../styles/main/Main';
import MainSection1 from './MainSection1';
import MainSection2 from './MainSection2';
import MainSection3 from './MainSection3';
import MainSection4 from './MainSection4';
import { OutletContextType } from './MainType';

const Main = (): JSX.Element => {
  const mainContentRef = useOutletContext<OutletContextType>();

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  return (
    <>
      <Wrap>
        <Carousel />
        <Container>
          <MainSection1 />
          <MainSection2 />
          <MainBlockImg01 />
          <MainSection3 />
          <MainSection4 />
        </Container>
      </Wrap>
    </>
  );
};

export default Main;
