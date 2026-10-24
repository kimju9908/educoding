import React from 'react';

import { RightChartContainer } from '../../../../styles/admin/Admin_DataCenter';
import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  PageSubTitleBar,
} from '../../../../styles/admin/Admin_Main';
import DailyUserData from '../../components/DataCenter/DailyUserData';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';

const Admin_DataCentre: React.FC = () => {
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
            <PageSubTitleBar>신규 가입자 추이</PageSubTitleBar>
            <RightChartContainer>
              <DailyUserData />
            </RightChartContainer>
          </RightContainer>
        </Container>
      </Wrap>
    </>
  );
};

export default Admin_DataCentre;
