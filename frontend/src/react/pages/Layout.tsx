import { useEffect, useLayoutEffect, useRef } from 'react';

import { Outlet } from 'react-router-dom';

import ChatbotWidget from './ChatbotWidget';
import { Background, Header, LayoutWrapper, MainContent } from '../styles/Layout';
import StyledFooter from './footer/StyledFooter';
import NavBar from './navBar/NavBar';

interface LayoutProps {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ mode, toggleTheme }) => {
  // useRef를 HTMLDivElement 타입으로 변경
  const mainContentRef = useRef<HTMLDivElement | null>(null); // MainContent 참조

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }, []);

  return (
    <>
      <LayoutWrapper>
        <Background>
          <Header>
            <NavBar mode={mode} toggleTheme={toggleTheme} />
          </Header>
          <MainContent ref={mainContentRef}>
            <Outlet context={mainContentRef} />
            <StyledFooter />
          </MainContent>
        </Background>
      </LayoutWrapper>
      <ChatbotWidget />
    </>
  );
};

export default Layout;
