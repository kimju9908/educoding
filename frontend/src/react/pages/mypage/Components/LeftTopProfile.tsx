import { JSX } from 'react';

import { useAppSelector } from '../../../../redux/hooks/reduxHooks';
import {
  ProfileImage,
  UserNickName,
  LeftContainerEach,
  UserSignupDate,
  UserProfileTextBox,
} from '../../../styles/mypage/MyPage_Main';

const LeftTopProfile = (): JSX.Element => {
  const { profile, nickname, registeredAt } = useAppSelector((state) => state.auth);

  return (
    <>
      <LeftContainerEach>
        <ProfileImage isProfile={profile}></ProfileImage>
        <UserProfileTextBox>
          <UserNickName>{nickname}</UserNickName>
          <UserSignupDate>
            가입일 : {new Date(registeredAt).toISOString().slice(0, 10).replace(/-/g, '.')}
          </UserSignupDate>
        </UserProfileTextBox>
      </LeftContainerEach>
    </>
  );
};

export default LeftTopProfile;
