import React from 'react';

import { useAppSelector } from '../../../../../redux/hooks/reduxHooks';
import {
  UserProfileBox,
  UserProfileImg,
  UserProfileTextBox,
  UserId,
  UserPostAmount,
} from '../../../../styles/community/Community_Post';

const Cs_Post_UserProfile: React.FC = () => {
  const { profile, nickname } = useAppSelector((state) => state.auth);
  // Get Post from Backend
  return (
    <>
      <UserProfileBox>
        <UserProfileImg isProfile={profile} />
        <UserProfileTextBox>
          <UserId>{nickname}</UserId>
          <UserPostAmount></UserPostAmount>
        </UserProfileTextBox>
      </UserProfileBox>
    </>
  );
};

export default Cs_Post_UserProfile;
