import React, { useLayoutEffect, useState } from 'react';

import { useOutletContext } from 'react-router-dom';

import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  PageSubTitleBar,
} from '../../../../styles/admin/Admin_Main';
import { OutletContextType } from '../../AdminType';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';
import UserList from '../../components/SearchUser/UserList';
import UserSearchBar from '../../components/SearchUser/UserSearchBar';

const Admin_SearchUser: React.FC = () => {
  const queryParams = new URLSearchParams(location.search);
  const [search, setSearch] = useState<string | null>(queryParams.get('search') || null);
  const mainContentRef = useOutletContext<OutletContextType>();
  const [page] = useState<number | string>(queryParams.get('page') || 1);
  const [size] = useState<number | string>(queryParams.get('size') || 10);
  const [sortBy, setSortBy] = useState<string>(queryParams.get('sortBy') || 'registeredAt');
  const [order] = useState<string>(queryParams.get('order') || 'desc');
  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  return (
    <>
      <Wrap>
        <Container>
          <LeftContainer>
            <LeftTopProfile />
            <LeftMenus />
          </LeftContainer>
          <RightContainer>
            <PageTitleBar>회원 관리</PageTitleBar>
            <PageSubTitleBar>회원찾기</PageSubTitleBar>
            <UserSearchBar onSearchChange={setSearch} />
            <UserList page={page} size={size} sortBy={sortBy} order={order} search={search} />
          </RightContainer>
        </Container>
      </Wrap>
    </>
  );
};

export default Admin_SearchUser;
