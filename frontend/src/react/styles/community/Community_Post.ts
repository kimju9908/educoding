import styled, { keyframes, css } from 'styled-components';

type CommunityPostProps = {
  theme?: 'light' | 'dark';
  isOpen?: boolean;
  isOpenOther?: boolean;
  boardType?: string;
  userLikeCnt?: number | string;
  userDisLikeCnt?: number | string;
  expanded?: boolean;
  isProfile?: string | null;
};

export const MainPostContainer = styled.div.attrs({
  id: 'mainpostcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
export const MainPostTop = styled.div.attrs({
  id: 'mainposttop',
})`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid var(--educoding-line);
`;
export const MainPostTopTextContainer = styled.div.attrs({
  id: 'mainposttoptextcontainer',
})`
  width: calc(100% - 50px);
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
export const MainPostTitleArea = styled.div.attrs({
  id: 'mainposttitlearea',
})`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  gap: 10px;
`;
export const MainPostPending = styled.div.attrs({
  id: 'mainpostpending',
})`
  height: 20px;
  display: flex;
`;
export const MainPostTitle = styled.div.attrs({
  id: 'mainposttitle',
})`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  text-align: left;
  font-size: 14px;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
  flex-wrap: wrap;
`;
export const MainPostDiv = styled.div.attrs({
  id: 'mainpostdiv',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  position: relative;
`;
export const MainPostInformation = styled.div.attrs({
  id: 'mainpostinformation',
})`
  width: 80%;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  gap: 5px;
  flex-wrap: wrap;
`;
export const MainPostDate = styled.div.attrs({
  id: 'mainpostdate',
})`
  font-family: regular, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
`;
export const MainPostEditedText = styled.div.attrs({
  id: 'mainposteditedtext',
})`
  font-family: regular, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
`;
export const MainPostViewsBox = styled.div.attrs({
  id: 'mainpostviewsbox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: center;
  align-items: center;
`;
export const MainPostViewsImg = styled.div.attrs({
  id: 'mainpostviewsimg',
})<CommunityPostProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 14px;
  height: 14px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/views_light.png' : '/images/icon/views.png'})`};
`;
export const MainPostViewsText = styled.div.attrs({
  id: 'mainpostviewstext',
})`
  font-family: regular, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
`;
export const MainPostRepliesBox = styled.div.attrs({
  id: 'mainpostrepliesbox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: center;
  align-items: center;
`;
export const MainPostRepliesImg = styled.div.attrs({
  id: 'mainpostrepliesimg',
})<CommunityPostProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 14px;
  height: 14px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/replies_light.png' : '/images/icon/replies.png'})`};
`;
export const MainPostRepliesText = styled.div.attrs({
  id: 'mainpostrepliestext',
})`
  font-family: regular, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
`;
export const MainPostThumbsUpBox = styled.div.attrs({
  id: 'mainpostthumbsupbox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: center;
  align-items: center;
`;
export const MainPostThumbsUpImg = styled.div.attrs({
  id: 'mainpostthumbsupimg',
})<CommunityPostProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10px;
  height: 10px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/thumbsup_g.png' : '/images/icon/thumbsup_w.png'})`};
`;
export const MainPostThumbsUpText = styled.div.attrs({
  id: 'mainpostthumbsuptext',
})`
  font-family: regular, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
`;
export const MainPostThumbsDownBox = styled.div.attrs({
  id: 'mainpostthumbsdownbox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: center;
  align-items: center;
`;
export const MainPostThumbsDownImg = styled.div.attrs({
  id: 'mainpostthumbsdownimg',
})<CommunityPostProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10px;
  height: 10px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/thumbsdown_r.png' : '/images/icon/thumbsdown_w.png'})`};
`;
export const MainPostThumbsDownText = styled.div.attrs({
  id: 'mainpostthumbsdowntext',
})`
  font-family: regular, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
`;
export const MainPostContentsPending = styled.div.attrs({
  id: 'mainpostcontentspending',
})`
  border-radius: 50px;
  background-color: var(--educoding-white);
  font-size: 10px;
  font-family: 'bold', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--educoding-black);
  padding: 5px 10px;
`;
export const MainPostContentsSolved = styled.div.attrs({
  id: 'mainpostcontentssolved',
})`
  border-radius: 50px;
  background-color: var(--educoding-black);
  font-size: 10px;
  font-family: 'bold', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--educoding-white);
  padding: 5px 10px;
`;
export const MainPostExtra = styled.div.attrs({
  id: 'mainpostextra',
})`
  width: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  justify-content: flex-end;
`;
export const MainPostExtraButton = styled.div.attrs({
  id: 'mainpostextrabutton',
})<CommunityPostProps>`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-direction: row;
  cursor: pointer;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/m_menu_open_light.png' : '/images/icon/m_menu_open.png'})`};
`;
export const MainPostExtraItemContainer = styled.div.attrs({
  id: 'mainpostextraitemcontainer',
})<CommunityPostProps>`
  width: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 60px;
  right: 0px;
  border-radius: 10px !important;
  border: 1px solid var(--educoding-line) !important;
  background-color: var(--educoding-dark);
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.25);
  z-index: 100;
  ${(props) =>
    props.isOpen && props.boardType !== 'course'
      ? css`
          animation: ${expandHeight} 0.3s ease-out forwards;
        `
      : !props.isOpen && props.boardType !== 'course'
        ? css`
            animation: ${collapseHeight} 0.3s ease-out forwards;
          `
        : props.isOpen && props.boardType === 'course'
          ? css`
              animation: ${expandHeightCourse} 0.3s ease-out forwards;
            `
          : !props.isOpen &&
            props.boardType === 'course' &&
            css`
              animation: ${collapseHeightCourse} 0.3s ease-out forwards;
            `}
  ${(props) =>
    !props.isOpen &&
    css`
      cursor: none;
      pointer-events: none;
    `}
`;
export const MainPostExtraItemOtherContainer = styled.div.attrs({
  id: 'mainpostextraitemothercontainer',
})<CommunityPostProps>`
  width: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 60px;
  right: 0px;
  border-radius: 10px !important;
  border: 1px solid var(--educoding-line);
  background-color: var(--educoding-dark);
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.25);
  z-index: 100;
  ${(props) =>
    props.isOpenOther
      ? css`
          animation: ${expandHeightOther} 0.3s ease-out forwards;
        `
      : css`
          animation: ${collapseHeightOther} 0.3s ease-out forwards;
        `}
  ${(props) =>
    !props.isOpenOther &&
    css`
      cursor: none;
      pointer-events: none;
    `}
`;
const expandHeight = keyframes`
  0% {
    height: 0;
    opacity: 0;
  }
  100% {
    height: 120px;
    opacity: 1;
  }
`;
const collapseHeight = keyframes`
  0% {
    height: 80px;
    opacity: 1;
  }
  100% {
    width: 0;
    opacity: 0;
  }
`;
const expandHeightCourse = keyframes`
  0% {
    height: 0;
    opacity: 0;
  }
  100% {
    height: 80px;
    opacity: 1;
  }
`;
const collapseHeightCourse = keyframes`
  0% {
    height: 110px;
    opacity: 1;
  }
  100% {
    width: 0;
    opacity: 0;
  }
`;
const expandHeightOther = keyframes`
  0% {
    height: 0;
    opacity: 0;
  }
  100% {
    height: 40px;
    opacity: 1;
  }
`;
const collapseHeightOther = keyframes`
  0% {
    height: 40px;
    opacity: 1;
  }
  100% {
    width: 0;
    opacity: 0;
  }
`;
export const MainPostExtraItem = styled.div.attrs({
  id: 'mainpostextraitem',
})<CommunityPostProps>`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  font-size: 12px;
  font-family: extrabold, sans-serif;
  user-select: none;
  cursor: pointer;
  color: var(--educoding-white);
  &:hover {
    background-color: var(--educoding-hover);
  }
  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
  ${(props) =>
    !props.isOpen &&
    css`
      color: transparent;
    `}
  ${(props) =>
    props.boardType === 'course' &&
    css`
      height: 50%;
      & + &::before {
        top: 0px;
      }
    `}
`;
export const MainPostExtraOtherItem = styled.div.attrs({
  id: 'mainpostextraitem',
})<CommunityPostProps>`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  font-size: 12px;
  font-family: extrabold, sans-serif;
  user-select: none;
  cursor: pointer;
  background-color: var(--educoding-dark);
  color: var(--educoding-white);
  &:hover {
    background-color: var(--educoding-hover);
  }
  ${(props) =>
    !props.isOpenOther &&
    css`
      color: transparent;
    `}
  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;
export const MainPostMiddle = styled.div.attrs({
  id: 'mainpostmiddle',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  position: relative;
`;
export const LeftEvBox = styled.div.attrs({
  id: 'leftevbox',
})`
  width: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
`;
export const LeftEvUp = styled.div.attrs({
  id: 'leftevup',
})<CommunityPostProps>`
  width: 50px;
  height: 50px;
  border-bottom: 1px solid var(--educoding-line);
  cursor: pointer;
  background-repeat: no-repeat;
  background-size: 15px;
  background-position: center;
  &:hover {
    background-color: var(--educoding-hover);
  }
  ${(props) =>
    props.userLikeCnt === 1 &&
    css`
      background-color: ${props.theme === 'light' ? 'green' : 'var(--educoding-purple)'};
      background-image: url(${props.theme === 'light'
        ? '/images/icon/thumbsup_w.png'
        : '/images/icon/thumbsup_w.png'});
    `}
  ${(props) =>
    (props.userLikeCnt === 0 || props.userLikeCnt === '') &&
    css`
      background-color: var(--educoding-dark);
      background-image: url(${props.theme === 'light'
        ? '/images/icon/thumbsup_g.png'
        : '/images/icon/thumbsup_w.png'});
    `}
`;

export const LeftEvDown = styled.div.attrs({
  id: 'leftevdown',
})<CommunityPostProps>`
  width: 50px;
  height: 50px;
  border-bottom: 1px solid var(--educoding-line);
  cursor: pointer;
  background-repeat: no-repeat;
  background-size: 15px;
  background-position: center;
  &:hover {
    background-color: var(--educoding-hover);
  }
  ${(props) =>
    props.userDisLikeCnt === 1 &&
    css`
      background-color: ${props.theme === 'light' ? 'red' : 'var(--educoding-purple)'};
      background-image: url(${props.theme === 'light'
        ? '/images/icon/thumbsdown_w.png'
        : '/images/icon/thumbsdown_w.png'});
    `}
  ${(props) =>
    (props.userDisLikeCnt === 0 || props.userDisLikeCnt === '') &&
    css`
      background-color: var(--educoding-dark);
      background-image: url(${props.theme === 'light'
        ? '/images/icon/thumbsdown_r.png'
        : '/images/icon/thumbsdown_w.png'});
    `}
`;
export const MainPostContentsBox = styled.div.attrs({
  id: 'mainpostcontentsbox',
})`
  width: 100%;
  position: relative;
  max-width: 766px;
  flex-wrap: nowrap;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--educoding-line);
  border-bottom: 1px solid var(--educoding-line);
`;
export const MainPostContentsText = styled.div.attrs({
  id: 'mainpostcontentstext',
})`
  width: 100%;
  position: relative;
  font-size: 12px;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
  line-height: 20px;
  padding: 10px 15px;
  border-bottom: 1px solid var(--educoding-line);
  ul,
  ol {
    margin-left: 15px;
  }
`;
export const MainPostTagsBox = styled.div.attrs({
  id: 'mainposttagsbox',
})`
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid var(--educoding-line);
`;
export const MainPostTag = styled.div.attrs({
  id: 'mainposttag',
})`
  width: 100px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--educoding-dark);
  color: var(--educoding-white);
  font-size: 11px;
  font-family: bold, sans-serif;
  border-right: 1px solid var(--educoding-line);
  cursor: pointer;
  &:hover {
    background-color: var(--educoding-hover);
  }
`;
export const MainPostNoTag = styled.div.attrs({
  id: 'mainpostnotag',
})`
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--educoding-white);
  font-family: bold, sans-serif;
  font-size: 12px;
  padding: 10px 20px;
  border-right: 1px solid var(--educoding-line);
`;
export const ReplyContainer = styled.div.attrs({
  id: 'replycontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;
export const SuggestBox = styled.div.attrs({
  id: 'suggestbox',
})<CommunityPostProps>`
  width: 100%;
  min-height: 40px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-family: extrabold, sans-serif;
  font-size: 14px;
  color: white;
  text-align: left;
  transition: all 0.3s ease;
  background-color: var(--educoding-header);
  /* cursor: pointer; */
  ${({ expanded }) =>
    expanded &&
    `
    max-height: 400px;
    flex-direction: column;
    background-color: var(--educoding-dark);
  `}
  /* 확장 후 내부 텍스트 숨기기 */
    ${({ expanded }) =>
    expanded &&
    `
    > span {
      display: none;
      transition: all 0.3s ease;
    }
  `}
`;

export const EditorBox = styled.div.attrs({
  id: 'editorbox',
})<CommunityPostProps>`
  width: 100%;
  transition: all 0.3s ease;
  display: ${({ expanded }) => (expanded ? 'var(--educoding-dark)' : 'none')};
`;

export const ReplyList = styled.div.attrs({
  id: 'replylist',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 100px;
`;
export const ReplyEach = styled.div.attrs({
  id: 'replyeach',
})`
  padding: 15px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: var(--educoding-dark);
  border-bottom: 1px solid var(--educoding-line);
  &:hover {
    background-color: var(--educoding-hover);
  }
`;
export const ReplyEachTopBox = styled.div.attrs({
  id: 'replyeachtopbox',
})`
  width: 100%;
  display: flex;
`;
export const ReplyUserProfileBox = styled.div.attrs({
  id: 'replyuserprofilebox',
})`
  width: calc(100% - 40px);
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: flex-start;
  align-items: top;
  cursor: pointer;
`;
export const ReplyUserProfileImg = styled.div.attrs({
  id: 'replyuserprofileimg',
})<CommunityPostProps>`
  width: 40px;
  height: 40px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100%;
  border-radius: 50%;
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
export const ReplyUserProfileTextBox = styled.div.attrs({
  id: 'replyuserprofiletextbox',
})`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 5px;
`;
export const ReplyUserId = styled.div.attrs({
  id: 'replyuserid',
})`
  text-align: left;
  font-size: 12px;
  font-family: extrabold, sans-serif;
  color: var(--educoding-white);
`;
export const ReplyUserDate = styled.div.attrs({
  id: 'replyuserdate',
})`
  text-align: left;
  font-size: 12px;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
`;
export const ReplyMoreButtonArea = styled.div.attrs({
  id: 'replymorebuttonarea',
})`
  width: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  justify-content: flex-end;
  cursor: pointer;
`;

export const ReplyPostMore = styled.div.attrs({
  id: 'replypostmore',
})`
  width: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  justify-content: flex-end;
`;
export const ReplyPostMoreOwnerContainer = styled.div.attrs({
  id: 'replypostmoreitemcontainer',
})<CommunityPostProps>`
  width: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 50px;
  right: -30px;
  border-radius: 10px !important;
  border: 1px solid var(--educoding-line) !important;
  background-color: var(--educoding-dark);
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.25);
  z-index: 100;
  ${(props) =>
    props.isOpen
      ? css`
          animation: ${replyOwnerExpand} 0.3s ease-out forwards;
        `
      : !props.isOpen &&
        css`
          animation: ${replyOwnerCollapse} 0.3s ease-out forwards;
        `}
`;
const replyOwnerExpand = keyframes`
  0% {
    height: 0;
    opacity: 0;
  }
  100% {
    height: 80px;
    opacity: 1;
  }
`;
const replyOwnerCollapse = keyframes`
  0% {
    height: 80;
    opacity: 1;
  }
  100% {
    height: 0;
    opacity: 0;
  }
`;
export const ReplyPostMoreOwnerItem = styled.div.attrs({
  id: 'replypostmoreowneritem',
})<CommunityPostProps>`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  font-size: 12px;
  font-family: extrabold, sans-serif;
  user-select: none;
  cursor: pointer;
  color: var(--educoding-white);
  &:hover {
    background-color: var(--educoding-hover);
  }
  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;
export const ReplyMoreButton = styled.div.attrs({
  id: 'replymorebutton',
})<CommunityPostProps>`
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-direction: row;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/m_menu_open_light.png' : '/images/icon/m_menu_open.png'})`};
`;
export const ReplyMiddle = styled.div.attrs({
  id: 'replymiddle',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;
export const ReplyMiddleText = styled.div.attrs({
  id: 'replymiddletext',
})`
  width: 100%;
  margin-top: 10px;
  font-size: 12px;
  font-family: regular, sans-serif;
  color: var(--educoding-white);
  line-height: 20px;
  img {
    max-width: 100%; /* 부모 컨테이너의 너비를 넘지 않도록 제한 */
    height: auto; /* 이미지의 비율을 유지하며 자동으로 높이 조정 */
    display: block; /* 이미지를 블록 요소로 설정해, 아래에 여백을 없앰 */
  }
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
})<CommunityPostProps>`
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
export const RelatedPostsContainer = styled.div.attrs({
  id: 'relatedpostscontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow-x: hidden;
  border-bottom: 1px solid var(--educoding-line);
`;
export const RelatedPostsTitle = styled.div.attrs({
  id: 'relatedpoststitle',
})`
  width: 100%;
  background-color: var(--educoding-header);
  height: 40px;
  font-family: extrabold, sans-serif;
  font-size: 14px;
  color: white;
  display: flex;
  align-items: center;
  padding-left: 15px;
`;

export const RelatedPostsList = styled.div.attrs({
  id: 'relatedpostslist',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;
export const RelatedPostEach = styled.div.attrs({
  id: 'relatedposteach',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background-color: var(--educoding-dark);
  padding: 15px;
  cursor: pointer;
  &:hover {
    background-color: var(--educoding-hover);
  }
`;
export const RelatedPostContents = styled.div.attrs({
  id: 'relatedpostcontents',
})`
  width: 100%;
  gap: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
export const RelatedPostContentsTitle = styled.div.attrs({
  id: 'relatedpostcontentstitle',
})`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
  margin-bottom: 3px;
  -webkit-box-orient: vertical; /* 세로로 정렬 */
  -webkit-line-clamp: 1; /* 두 줄로 제한 */
  overflow: hidden; /* 넘치는 텍스트 숨기기 */
  text-overflow: ellipsis; /* 텍스트가 잘릴 때 말줄임 표시 (...) */
`;
export const RelatedPostContentsText = styled.div.attrs({
  id: 'relatedpostcontentstext',
})`
  width: 100%;
  font-size: 12px;
  font-family: light, sans-serif;
  line-height: 16px;
  color: var(--educoding-white);
  display: -webkit-box; /* flexbox처럼 사용 */
  -webkit-box-orient: vertical; /* 세로로 정렬 */
  -webkit-line-clamp: 2; /* 두 줄로 제한 */
  overflow: hidden; /* 넘치는 텍스트 숨기기 */
  text-overflow: ellipsis; /* 텍스트가 잘릴 때 말줄임 표시 (...) */
`;
export const RelatedPostContentsBottom = styled.div.attrs({
  id: 'relatedpostcontentsbottom',
})`
  height: 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
`;
export const PostBottomViewsBox = styled.div.attrs({
  id: 'postbottomviewsbox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: center;
  align-items: center;
`;
export const PostBottomViewsImg = styled.div.attrs({
  id: 'postbottomviewsimg',
})<CommunityPostProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 13px;
  height: 13px;
  margin-top: 1px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/views_light.png' : '/images/icon/views.png'})`};
`;
export const PostBottomViewsText = styled.div.attrs({
  id: 'postbottomviewstext',
})`
  font-family: regular, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
`;

export const MiddleDot = styled.div.attrs({
  id: 'middledot',
})`
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background-color: var(--educoding-white);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 2px;
  margin-right: 2px;
`;
export const PostBottomRepliesBox = styled.div.attrs({
  id: 'postbottomrepliesbox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: center;
  align-items: center;
`;
export const PostBottomRepliesImg = styled.div.attrs({
  id: 'postbottomrepliesimg',
})<CommunityPostProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 12px;
  height: 12px;
  margin-top: 1px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/replies_light.png' : '/images/icon/replies.png'})`};
`;
export const PostBottomRepliesText = styled.div.attrs({
  id: 'postbottomrepliestext',
})`
  font-family: regular, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
`;
