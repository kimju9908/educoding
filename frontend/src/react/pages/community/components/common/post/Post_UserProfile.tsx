import React from 'react';

import { useNavigate } from 'react-router-dom';

import {
  UserProfileBox,
  UserProfileImg,
  UserProfileTextBox,
  UserId,
  UserPostAmount,
} from '../../../../../styles/community/Community_Post';
import { PostUserProfileProps } from '../../../CommunityType';

const Post_UserProfile: React.FC<PostUserProfileProps> = ({ post }) => {
  const navigate = useNavigate();

  const handleUserProfile = (): void => {
    navigate(`/community/user/${post.userKey}`, {
      state: {
        writerKey: post.userKey,
      },
    });
  };

  return (
    <>
      <UserProfileBox style={{ cursor: 'pointer' }} onClick={() => handleUserProfile()}>
        <UserProfileImg isProfile={post.profileUrl} />
        <UserProfileTextBox>
          <UserId>{post.name}</UserId>
          <UserPostAmount>작성한 질문수 {post.postCnt}</UserPostAmount>
        </UserProfileTextBox>
      </UserProfileBox>
    </>
  );
};

export default Post_UserProfile;
