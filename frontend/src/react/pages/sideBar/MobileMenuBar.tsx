import React, { useState, useRef, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import { useAppDispatch, useAppSelector } from '../../../redux/hooks/reduxHooks';
import { logoutAuth } from '../../../redux/slice/authSlice';
import { openLoginModal } from '../../../redux/slice/LoginModalSlice';
import { logoutCondition } from '../../../redux/slice/loginSlice';
import { menus } from '../../../util/mobilemenu/MobileMenu';
import {
  Container,
  LeftContainer,
  LeftMenuEach,
  LeftMenuLogin,
  LeftMenuText,
  RightContainer,
  RightMenuGroup,
  RightMenuHR,
  RightMenuItem,
  RightMenuTitle,
} from '../../styles/sideBar/MobileMenuBar';

interface SideBarProps {
  closeMobileMenu: () => void;
}

const MobileMenuBar: React.FC<SideBarProps> = ({ closeMobileMenu }) => {
  const [activeMenu, setActiveMenu] = useState<string>('about');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const nickname = useAppSelector((state) => state.auth.nickname);
  const [isUser, setIsUser] = useState<string | null>(null);

  useEffect(() => {
    if (isUser) {
      return;
    }
    if (nickname) {
      setIsUser(nickname);
    } else {
      setIsUser(null);
    }
  }, [nickname]);

  const isAuth = useAppSelector((state) => state.auth.accesstoken);

  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const handleScroll = (menuId: string): void => {
    const menuRef = menuRefs.current[menuId as string];
    if (menuRef && menuRef.parentElement) {
      menuRef.parentElement.scrollTo({
        top: menuRef.offsetTop - 50, // 여유
        behavior: 'smooth',
      });
    }
  };

  // 메뉴 클릭 시 스크롤
  const handleMenuClick = (menuId: string): void => {
    setActiveMenu(menuId);
    handleScroll(menuId);
  };

  // 로그인
  const handleLogin = (): void => {
    dispatch(openLoginModal());
    closeMobileMenu();
  };

  // 로그아웃
  const handleLogout = (): void => {
    dispatch(logoutAuth());
    dispatch(logoutCondition());
    setTimeout(() => navigate('/'), 0);
    closeMobileMenu();
  };

  const handleNavigation = (item: any): void => {
    // '랜덤문제풀이'나 '기출문제' 메뉴 클릭 시 로그인 상태 확인 후 다이얼로그 열기
    if (
      isAuth === '' && // isAuth가 null, undefined, 빈 문자열 또는 falsy 값일 경우
      (item.contents.index === '랜덤문제풀이' || item.contents.index === '기출문제')
    ) {
      dispatch(openLoginModal());
    } else {
      navigate(item.contents.link); // 링크로 이동
    }
    closeMobileMenu(); // 모바일 메뉴 닫기
  };

  return (
    <Container>
      <LeftContainer>
        {menus
          .filter((menu) => menu.id !== 'mypage' || isUser) // 로그인한 유저만 표시
          .map((menu) => (
            <LeftMenuEach
              key={menu.id}
              isActive={menu.id === activeMenu}
              onClick={() => handleMenuClick(menu.id)} // 메뉴 클릭 시 스크롤
            >
              <LeftMenuText>{menu.label}</LeftMenuText>
              {menu.id === activeMenu && <KeyboardDoubleArrowRightIcon />}
            </LeftMenuEach>
          ))}
        {isUser !== null ? (
          <LeftMenuLogin onClick={() => handleLogout()}>
            <LeftMenuText style={{ color: 'white' }}>로그아웃</LeftMenuText>
          </LeftMenuLogin>
        ) : (
          <LeftMenuLogin onClick={() => handleLogin()}>
            <LeftMenuText style={{ color: 'white' }}>로그인</LeftMenuText>
          </LeftMenuLogin>
        )}
      </LeftContainer>
      <RightContainer>
        {menus
          .filter((menu) => menu.id !== 'mypage' || isUser) // 오른쪽 메뉴에도 마이페이지 메뉴 표시 여부 필터링
          .map((menu, menuIndex) => (
            <React.Fragment key={menu.id}>
              <RightMenuGroup
                id={menu.id}
                ref={(el) => {
                  menuRefs.current[menu.id] = el;
                }}
              >
                <RightMenuTitle>{menu.label}</RightMenuTitle>
                {menu.list.map((item, index) => (
                  <RightMenuItem key={index} onClick={() => handleNavigation(item)}>
                    {item.contents.index}
                  </RightMenuItem>
                ))}
              </RightMenuGroup>
              {menuIndex < menus.length - 1 && <RightMenuHR />}
            </React.Fragment>
          ))}
      </RightContainer>
    </Container>
  );
};

export default MobileMenuBar;
