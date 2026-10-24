import { JSX, useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import type { MenuType } from '../AdminType';

import {
  LeftContainerEach,
  LeftContainerTitle,
  LeftContainerContents,
  LeftContainerContentsBox,
} from '../../../styles/admin/Admin_Main';

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
    { id: 'account', sort: '관리자 프로필', label: '계정 관리', link: '/admin/account' },
    { id: 'report', sort: '게시글 관리', label: '악성 사용자 신고', link: '/admin/report' },
    { id: 'search', sort: '회원 관리', label: '회원찾기', link: '/admin/search/users' },
    { id: 'data', sort: '회원 관리', label: '신규 가입자 추이', link: '/admin/data/user' },
    { id: 'study', sort: '콘텐츠 관리', label: '강의 관리', link: '/admin/study' },
  ];

  const activeSort = menus.find((menu) => menu.id === activeMenu)?.sort;

  return (
    <>
      {['관리자 프로필', '게시글 관리', '회원 관리', '콘텐츠 관리'].map((category) => {
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
