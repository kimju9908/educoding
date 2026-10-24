import { JSX, useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import type { MenuType } from '../MyPageType';

import {
  LeftContainerEach,
  LeftContainerTitle,
  LeftContainerContents,
  LeftContainerContentsBox,
} from '../../../styles/mypage/MyPage_Main';

const LeftMenus = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string>('');

  useEffect(() => {
    const currentPath: string = location.pathname.split('/')[2] || 'account';
    setActiveMenu(currentPath);
  }, [location.pathname]);

  const handleNavigation = (menuId: string, navigatepath: string): void => {
    setActiveMenu(menuId);
    navigate(navigatepath);
  };

  const menus: MenuType = [
    { id: 'account', sort: '내 프로필', label: '계정 관리', link: '/mypage/account' },
    { id: 'userfeed', sort: '내 프로필', label: '내 소개', link: '/mypage/userfeed' },
    { id: 'withdrawal', sort: '내 프로필', label: '️회원 탈퇴', link: '/mypage/withdrawal' },
    { id: 'study', sort: '공부방', label: '언어 공부', link: '/mypage/study' },
    { id: 'codingtest', sort: '공부방', label: '코딩테스트', link: '/mypage/codingtest' },
    { id: 'community', sort: '작성한 게시글', label: '커뮤니티 게시판', link: '/mypage/community' },
    { id: 'report', sort: '작성한 게시글', label: '악성 사용자 신고', link: '/mypage/report' },
    { id: 'mentor', sort: '멘토링 전용 페이지', label: '내 멘토 보기', link: '/mypage/mentor' },
    { id: 'mentee', sort: '멘토링 전용 페이지', label: '내 멘티 보기', link: '/mypage/mentee' },
  ];

  const activeSort = menus.find((menu) => menu.id === activeMenu)?.sort;

  return (
    <>
      {['내 프로필', '공부방', '작성한 게시글', '멘토링 전용 페이지'].map((category) => {
        const isActiveSort = category === activeSort;

        return (
          <LeftContainerEach key={category}>
            <LeftContainerTitle
              style={{ backgroundColor: isActiveSort ? 'var(--educoding-purple)' : 'var(--educoding-header)' }}
            >
              {category}
            </LeftContainerTitle>
            <LeftContainerContentsBox>
              {menus
                .filter((menu) => menu.sort === category)
                .map((menu) => {
                  const isActive = activeMenu === menu.id;

                  return (
                    <LeftContainerContents
                      key={menu.id}
                      onClick={() => handleNavigation(menu.id, menu.link)}
                      style={{
                        color: isActive ? 'var(--educoding-purple)' : 'var(--educoding-white)',
                        cursor: 'pointer',
                      }}
                    >
                      {menu.label}
                    </LeftContainerContents>
                  );
                })}
            </LeftContainerContentsBox>
          </LeftContainerEach>
        );
      })}
    </>
  );
};

export default LeftMenus;
