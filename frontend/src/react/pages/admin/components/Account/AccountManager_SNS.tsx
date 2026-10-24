import { JSX } from 'react';

import { useTheme } from '@mui/material';
import Button from '@mui/material/Button';

import type { SNSListType } from '../../AdminType';

import {
  SNSTitle,
  RightSNSContentsEach,
  RightSNSContentsInner,
  SNSIcon,
  RightContainerEach,
} from '../../../../styles/admin/Admin_Account';

const AccountManager_SNS = (): JSX.Element => {
  const theme = useTheme();
  const snsList: SNSListType = [
    {
      name: 'Google',
      iconLight: '/images/sns/google_b.png',
      iconDark: '/images/sns/google_w.png',
    },
    {
      name: 'Kakao',
      iconLight: '/images/sns/kakao_b.png',
      iconDark: '/images/sns/kakao_w.png',
    },
    {
      name: 'Naver',
      iconLight: '/images/sns/naver_b.png',
      iconDark: '/images/sns/naver_w.png',
    },
  ];
  return (
    <RightContainerEach>
      {snsList.map((sns, index) => (
        <RightSNSContentsEach key={index}>
          <RightSNSContentsInner>
            <SNSIcon icon={theme.palette.mode === 'light' ? sns.iconLight : sns.iconDark}></SNSIcon>
            <SNSTitle>{sns.name}</SNSTitle>
            <Button
              variant="contained"
              color="secondary"
              sx={{
                fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                color: 'white',
              }}
            >
              연동
            </Button>
          </RightSNSContentsInner>
        </RightSNSContentsEach>
      ))}
    </RightContainerEach>
  );
};

export default AccountManager_SNS;
