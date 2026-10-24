import { JSX, useLayoutEffect } from 'react';

import { useOutletContext } from 'react-router-dom';

import type { OutletContextType } from '../../AdminType';

import {
  RightAccountRightContainer,
  RightAccountLeftContainer,
  RightAccountContainer,
} from '../../../../styles/admin/Admin_Account';
import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  PageSubTitleBar,
} from '../../../../styles/admin/Admin_Main';
import AccountManager_Account from '../../components/Account/AccountManager_Account';
import AccountManager_Alert from '../../components/Account/AccountManager_Alert';
import AccountManager_ProfileIMG from '../../components/Account/AccountManager_ProfileIMG';
import AccountManager_SNS from '../../components/Account/AccountManager_SNS';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';

const Admin_Account = (): JSX.Element => {
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
        <Container>
          <LeftContainer>
            <LeftTopProfile />
            <LeftMenus />
          </LeftContainer>
          <RightContainer>
            <PageTitleBar>내 프로필</PageTitleBar>
            <PageSubTitleBar>계정 관리</PageSubTitleBar>
            <RightAccountContainer>
              <RightAccountLeftContainer>
                <AccountManager_Account />
              </RightAccountLeftContainer>
              <RightAccountRightContainer>
                <AccountManager_ProfileIMG />
              </RightAccountRightContainer>
            </RightAccountContainer>
            <PageSubTitleBar>알림 설정</PageSubTitleBar>
            <AccountManager_Alert />
            <PageSubTitleBar>SNS 연동</PageSubTitleBar>
            <AccountManager_SNS />
          </RightContainer>
        </Container>
      </Wrap>
    </>
  );
};

export default Admin_Account;
