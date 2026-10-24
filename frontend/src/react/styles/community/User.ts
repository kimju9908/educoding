import styled, { css } from 'styled-components';

type UserProps = {
  isProfile?: string | null;
};

export const FeedContainer = styled.div.attrs({
  id: 'feedcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--educoding-line);
`;

export const FeedContents = styled.div.attrs({
  id: 'feedcontents',
})`
  width: 100%;
  font-family: bold, sans-serif;
  font-size: 12px;
  color: var(--educoding-white);
  display: flex;
  justify-content: flex-start;
  line-height: 20px;
  padding: 15px;
`;

export const PostContainer = styled.div.attrs({
  id: 'postcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
`;
export const UserProfileBox = styled.div.attrs({
  id: 'userprofilebox',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background-color: var(--educoding-dark);
  position: relative;
  border-bottom: 1px solid var(--educoding-line);
  padding: 10px 20px 20px;
  cursor: pointer;
`;
export const UserProfileImg = styled.div.attrs({
  id: 'userprofileimg',
})<UserProps>`
  width: 80px;
  height: 80px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 50%;
  border: 1px solid var(--educoding-line);
  margin-top: 10px;
  margin-bottom: 10px;
  ${(props) =>
    props.isProfile === null &&
    css`
      background-image: url('/images/general/default_profile.png');
    `}
  ${(props) =>
    props.isProfile !== null &&
    css`
      background-image: url(${props.isProfile});
    `}
`;
export const UserProfileTextBox = styled.div.attrs({
  id: 'userprofiletextbox',
})`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
export const UserId = styled.div.attrs({
  id: 'userid',
})`
  width: 100%;
  font-family: extrabold, sans-serif;
  color: var(--educoding-white);
  font-size: 16px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const UserPostAmount = styled.div.attrs({
  id: 'userpostamount',
})`
  width: 100%;
  font-family: regular, sans-serif;
  font-size: 14px;
  color: var(--educoding-white);
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;
