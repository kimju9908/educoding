import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import type { MyPageBarProps } from '../navBar/BarType';

import { useAppDispatch, useAppSelector } from '../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../redux/slice/LoginModalSlice';
import {
  ContainerBefore,
  ContainerAfter,
  MenuContainer,
  MenuColumn,
  MenuLink,
  MenuTitle,
  MenuColumnNickname,
  MenuTitleNickname,
  MenuColumnTheme,
  MenuTitleTheme,
  MenuBoxTheme,
} from '../../styles/sideBar/MyPageBar';
import ThemeToggle from '../ThemeToggle';

const MyPageBar: React.FC<MyPageBarProps> = ({
  isMenuOpen,
  onValidDialogState,
  mode,
  toggleTheme,
  toggleMenu,
}) => {
  const { nickname, authority } = useAppSelector((state) => state.auth);
  const [isUser, setIsUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUser) {
      return;
    }
    if (nickname) {
      setIsUser(nickname);
    } else {
      setIsUser(null);
    }
    setIsLoading(false);
  }, [isUser, nickname]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogin = (): void => {
    dispatch(openLoginModal());
  };

  const handleSignup = (): void => {
    navigate('/signup');
  };

  const handleMyPage = (): void => {
    navigate('/mypage/account');
  };

  const handleAdminPage = (): void => {
    navigate('/admin/account');
  };

  const handleLogout = (): void => {
    onValidDialogState?.(true);
  };

  return (
    <>
      {!isLoading && (
        <>
          {isUser !== null ? (
            <ContainerAfter isMenuOpen={isMenuOpen}>
              <MenuContainer>
                <MenuColumnNickname>
                  <MenuTitleNickname>{nickname}</MenuTitleNickname>
                </MenuColumnNickname>
                {authority === 'USER' ? (
                  <MenuColumn>
                    <MenuLink
                      onClick={() => {
                        handleMyPage();
                        toggleMenu('isMyPageOpen');
                      }}
                    >
                      <MenuTitle>마이페이지</MenuTitle>
                    </MenuLink>
                  </MenuColumn>
                ) : (
                  authority === 'ADMIN' && (
                    <MenuColumn>
                      <MenuLink
                        onClick={() => {
                          handleAdminPage();
                          toggleMenu('isMyPageOpen');
                        }}
                      >
                        <MenuTitle>관리자페이지</MenuTitle>
                      </MenuLink>
                    </MenuColumn>
                  )
                )}
                <MenuColumn>
                  <MenuLink
                    onClick={() => {
                      handleLogout();
                      toggleMenu('isMyPageOpen');
                    }}
                  >
                    <MenuTitle>로그아웃</MenuTitle>
                  </MenuLink>
                </MenuColumn>
                <MenuColumnTheme>
                  <MenuTitleTheme>테마 변경</MenuTitleTheme>
                  <MenuBoxTheme>
                    <ThemeToggle mode={mode} toggleTheme={toggleTheme} />
                  </MenuBoxTheme>
                </MenuColumnTheme>
              </MenuContainer>
            </ContainerAfter>
          ) : (
            <ContainerBefore isMenuOpen={isMenuOpen}>
              <MenuContainer>
                <MenuColumn>
                  <MenuLink onClick={handleLogin}>
                    <MenuTitle>로그인</MenuTitle>
                  </MenuLink>
                </MenuColumn>
                <MenuColumn>
                  <MenuLink onClick={handleSignup}>
                    <MenuTitle>회원가입</MenuTitle>
                  </MenuLink>
                </MenuColumn>
                <MenuColumnTheme>
                  <MenuTitleTheme>테마 변경</MenuTitleTheme>
                  <MenuBoxTheme>
                    <ThemeToggle mode={mode} toggleTheme={toggleTheme} />
                  </MenuBoxTheme>
                </MenuColumnTheme>
              </MenuContainer>
            </ContainerBefore>
          )}
        </>
      )}
    </>
  );
};

export default MyPageBar;
