import { useState, useEffect, useRef, JSX } from 'react';

import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useTheme } from '@mui/material/styles';

import { useAppDispatch, useAppSelector } from '../../../redux/hooks/reduxHooks';
import { logoutAuth } from '../../../redux/slice/authSlice';
import { openLoginModal } from '../../../redux/slice/LoginModalSlice';
import { logoutCondition } from '../../../redux/slice/loginSlice';
import {
  Wrap,
  Container,
  LogoContainer,
  Logo,
  StyledLink,
  MenuContainer,
  MenuTitle,
  MenuBox,
  MenuButtonDrop,
  MenuButtonMyPage,
  MobileMenuButton,
  StyledAddIcon,
} from '../../styles/navBar/NavBar';
import CodingTestBar from '../sideBar/CodingTestBar';
import CommunityBar from '../sideBar/CommunityBar';
import ExamBar from '../sideBar/ExamBar';
import MobileMenuBar from '../sideBar/MobileMenuBar';
import MyPageBar from '../sideBar/MyPageBar';
import StudyBar from '../sideBar/StudyBar';

interface NavBarProps {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ mode, toggleTheme }): JSX.Element => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { nickname } = useAppSelector((state) => state.auth);
  const [isUser, setIsUser] = useState<string | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState<boolean>(false);
  const [menuState, setMenuState] = useState<Record<string, boolean>>({
    // 사이드 메뉴 바 필요한 Components useState 설정
    isStudyOpen: false,
    isCodingTestOpen: false,
    isExamOpen: false,
    isCommunityOpen: false,
    isMyPageOpen: false,
  });
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const closePCMenu = (): void => {
    setMenuState((prev) =>
      Object.keys(prev).reduce(
        (acc, key) => {
          acc[key as string] = false;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    );
  };

  const toggleMenu = (menu: string): void => {
    setMenuState((prevState) => ({
      ...prevState,
      [menu]: !prevState[menu as string],
      ...(menu !== 'isStudyOpen' && { isStudyOpen: false }),
      ...(menu !== 'isCodingTestOpen' && { isCodingTestOpen: false }),
      ...(menu !== 'isExamOpen' && { isExamOpen: false }),
      ...(menu !== 'isCommunityOpen' && { isCommunityOpen: false }),
      ...(menu !== 'isMyPageOpen' && { isMyPageOpen: false }),
    }));
  };

  // 메뉴 외부 클릭 감지 이벤트 핸들러
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      // 메뉴의 어느 요소에도 포함되지 않으면 닫기
      if (
        Object.keys(menuRefs.current).some((key) => {
          const ref = menuRefs.current[key as string];
          return ref && ref.contains(event.target as Node);
        })
      ) {
        return;
      }
      closePCMenu();
    };

    // 이벤트 리스너 등록
    document.addEventListener('mousedown', handleClickOutside);

    // 언마운트 시 이벤트 제거
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoutDialogState = (state: boolean): void => {
    setLogoutDialogOpen(state);
  };

  const handleLogoutDialogClose = (): void => {
    setLogoutDialogOpen(false);
  };

  const handleConfirmLogout = (): void => {
    setLogoutDialogOpen(false);
    dispatch(logoutAuth());
    dispatch(logoutCondition());
    setIsUser(null);
    navigate('/');
  };

  const [loginDialogOpen, setLoginDialogOpen] = useState(false); // 다이얼로그 상태 관리

  const handleLoginRedirect = (): void => {
    dispatch(openLoginModal());
    setLoginDialogOpen(false);
  };

  const handleLoginDialogState = (state: boolean): void => {
    setLoginDialogOpen(state);
  };

  const handleLoginDialogClose = (): void => {
    setLoginDialogOpen(false);
  };

  useEffect(() => {
    if (isUser) {
      return;
    }
    if (nickname) {
      setIsUser(nickname);
    } else {
      setIsUser(null);
    }
  }, [nickname, isUser]);

  // 모바일 메뉴바 설정
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const toggleMobileMenu = (): void => {
    setMobileMenuOpen((prev) => !prev);
  };
  const closeMobileMenu = (): void => {
    setMobileMenuOpen(false);
  };

  return (
    <Wrap>
      <Container>
        <LogoContainer>
          <Logo theme={theme.palette.mode}>
            educoding
            <StyledLink
              to="/"
              className={mobileMenuOpen ? 'open' : 'closed'}
              onClick={() => {
                closeMobileMenu();
                closePCMenu();
              }}
            ></StyledLink>
          </Logo>
        </LogoContainer>
        <MenuContainer>
          <MobileMenuButton>
            <StyledAddIcon
              className={mobileMenuOpen ? 'open' : 'closed'}
              onClick={toggleMobileMenu}
              open={mobileMenuOpen}
              fontSize="large"
            />
          </MobileMenuButton>
          <MenuTitle
            ref={(el) => {
              menuRefs.current['isStudyOpen'] = el;
            }}
            onClick={() => toggleMenu('isStudyOpen')}
          >
            <MenuBox isMenuOpen={menuState.isStudyOpen}>
              <MenuButtonDrop isMenuOpen={menuState.isStudyOpen}>언어공부</MenuButtonDrop>
            </MenuBox>
            {menuState.isStudyOpen ? <StudyBar isMenuOpen={menuState.isStudyOpen} /> : null}
          </MenuTitle>
          <MenuTitle
            ref={(el) => {
              menuRefs.current['isCodingTestOpen'] = el;
            }}
            onClick={() => toggleMenu('isCodingTestOpen')}
          >
            <MenuBox isMenuOpen={menuState.isCodingTestOpen}>
              <MenuButtonDrop isMenuOpen={menuState.isCodingTestOpen}>코딩테스트</MenuButtonDrop>
            </MenuBox>
            {menuState.isCodingTestOpen ? (
              <CodingTestBar isMenuOpen={menuState.isCodingTestOpen} />
            ) : null}
          </MenuTitle>
          <MenuTitle
            ref={(el) => {
              menuRefs.current['isExamOpen'] = el;
            }}
            onClick={() => toggleMenu('isExamOpen')}
          >
            <MenuBox isMenuOpen={menuState.isExamOpen}>
              <MenuButtonDrop isMenuOpen={menuState.isExamOpen}>정보처리기사</MenuButtonDrop>
            </MenuBox>
            {menuState.isExamOpen ? (
              <ExamBar
                isMenuOpen={menuState.isExamOpen}
                onValidDialogState={handleLoginDialogState}
                toggleMenu={toggleMenu}
              />
            ) : null}
          </MenuTitle>
          {!menuState.isExamOpen && loginDialogOpen ? (
            <Dialog
              open={loginDialogOpen}
              onClose={handleLoginDialogClose}
              PaperProps={{
                sx: {
                  fontFamily: 'regular',
                  minWidth: '400px', // 최소 가로 너비 설정
                  maxWidth: '500px', // 최대 가로 너비 설정
                },
              }}
            >
              <DialogContent
                sx={{
                  fontFamily: 'bold',
                  fontSize: '14px',
                  textAlign: 'center', // 가로 정렬
                  display: 'flex',
                  justifyContent: 'center', // 세로 정렬
                  alignItems: 'center', // 세로 정렬
                }}
              >
                로그인이 필요한 서비스입니다.
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'right' }}>
                <Button
                  sx={{ fontFamily: 'bold' }}
                  color="secondary"
                  onClick={handleLoginDialogClose}
                >
                  취소
                </Button>
                <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleLoginRedirect}>
                  로그인
                </Button>
              </DialogActions>
            </Dialog>
          ) : null}
          <MenuTitle
            ref={(el) => {
              menuRefs.current['isCommunityOpen'] = el;
            }}
            onClick={() => toggleMenu('isCommunityOpen')}
          >
            <MenuBox isMenuOpen={menuState.isCommunityOpen}>
              <MenuButtonDrop isMenuOpen={menuState.isCommunityOpen}>커뮤니티</MenuButtonDrop>
            </MenuBox>
            {menuState.isCommunityOpen ? (
              <CommunityBar isMenuOpen={menuState.isCommunityOpen} />
            ) : null}
          </MenuTitle>
          <MenuTitle
            ref={(el) => {
              menuRefs.current['isMyPageOpen'] = el;
            }}
            // onClick={() => toggleMenu('isMyPageOpen')}
          >
            <MenuBox isMenuOpen={menuState.isMyPageOpen}>
              <MenuButtonMyPage
                theme={theme.palette.mode}
                isMenuOpen={menuState.isMyPageOpen}
                onClick={() => toggleMenu('isMyPageOpen')}
              />
            </MenuBox>
            {menuState.isMyPageOpen ? (
              <MyPageBar
                mode={mode}
                toggleTheme={toggleTheme}
                isMenuOpen={menuState.isMyPageOpen}
                onValidDialogState={handleLogoutDialogState}
                toggleMenu={toggleMenu}
              />
            ) : null}
          </MenuTitle>
          {!menuState.isMyPageOpen && logoutDialogOpen ? (
            <Dialog
              open={logoutDialogOpen}
              onClose={handleLogoutDialogClose}
              PaperProps={{
                sx: {
                  fontFamily: 'regular',
                  minWidth: '400px', // 최소 가로 너비 설정
                  maxWidth: '500px', // 최대 가로 너비 설정
                },
              }}
            >
              <DialogContent
                sx={{
                  fontFamily: 'bold',
                  fontSize: '14px',
                  textAlign: 'center', // 가로 정렬
                  display: 'flex',
                  justifyContent: 'center', // 세로 정렬
                  alignItems: 'center', // 세로 정렬
                }}
              >
                정말 로그아웃하시겠습니까?
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'right' }}>
                <Button
                  sx={{ fontFamily: 'bold' }}
                  onClick={handleLogoutDialogClose}
                  color="secondary"
                >
                  취소
                </Button>
                <Button sx={{ fontFamily: 'bold' }} onClick={handleConfirmLogout} color="secondary">
                  확인
                </Button>
              </DialogActions>
            </Dialog>
          ) : null}
        </MenuContainer>
      </Container>
      {mobileMenuOpen ? <MobileMenuBar closeMobileMenu={closeMobileMenu} /> : null}
    </Wrap>
  );
};

export default NavBar;
