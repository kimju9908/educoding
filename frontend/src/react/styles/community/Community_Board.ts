import styled, { DefaultTheme } from 'styled-components';

type CommunityBoardProps = {
  theme?: 'light' | 'dark';
};

export const BoardContainer = styled.div.attrs({
  id: 'boardcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: 100px;
`;
export const TopSortOuterContiner = styled.div.attrs({
  id: 'topsortoutercontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
export const TopSortInnerContainer = styled.div.attrs({
  id: 'topsortinnercontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid var(--educoding-line);
`;

export const TopSortTitleActive = styled.div.attrs({
  id: 'topsorttitleactive',
})`
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--educoding-white);
  font-size: 14px;
  font-family: extrabold, sans-serif;
  padding: 0 15px;
  background-color: var(--educoding-black);
  border-right: 1px solid var(--educoding-line);
  cursor: pointer;
`;
export const TopSortTitleInactive = styled.div.attrs({
  id: 'topsorttitleinactive',
})`
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--educoding-white);
  font-size: 14px;
  font-family: extrabold, sans-serif;
  padding: 0 15px;
  background-color: var(--educoding-dark);
  border-right: 1px solid var(--educoding-line);
  cursor: pointer;
`;

export const SearchContainer = styled.div.attrs({
  id: 'searchcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
export const InputSearchContainer = styled.div.attrs({
  id: 'inputsearchcontainer',
})`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
`;
export const InputSearchBox = styled.div.attrs({
  id: 'inputsearchbox',
})<CommunityBoardProps>`
  width: 85%;
  height: 40px;
  border-right: 1px solid var(--educoding-line);
  background-position: 20px;
  background-repeat: no-repeat;
  background-size: 15px;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/search_light.png' : '/images/icon/search.png'})`};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid var(--educoding-line);
  @media (max-width: 768px) {
    width: 80%;
  }
`;
export const InputSearch = styled.input.attrs({
  id: 'inputsearch',
})`
  background-color: var(--educoding-dark);
  width: 100%;
  height: 100%;
  margin-left: 55px;
  padding-right: 20px;
  border: none;
  font-size: 12px;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: var(--educoding-white);
    opacity: 0.5;
    font-size: 12px;
    font-family: bold, sans-serif;
  }
`;
export const InputSearchButton = styled.button.attrs({
  id: 'inputsearchbutton',
})`
  width: 15%;
  color: white;
  background-color: var(--educoding-header);
  border: none;
  font-size: 12px;
  font-family: bold, sans-serif;
  cursor: pointer;
  &:hover {
    background-color: var(--educoding-hover);
  }
  @media (max-width: 768px) {
    width: 20%;
  }
`;
export const TagSearchContainer = styled.div.attrs({
  id: 'tagsearchcontainer',
})`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
`;
export const TagSearchBox = styled.div.attrs({
  id: 'tagsearchbox',
})<CommunityBoardProps>`
  width: 85%;
  height: 40px;
  border-right: 1px solid var(--educoding-line);
  background-position: 20px;
  background-repeat: no-repeat;
  background-size: 15px;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/tag_light.png' : '/images/icon/tag.png'})`};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid var(--educoding-line);
  @media (max-width: 768px) {
    width: 80%;
  }
`;
export const TagSearch = styled.div.attrs({
  id: 'tagsearch',
})`
  background-color: var(--educoding-dark);
  width: 100%;
  display: flex;
  align-items: center;
  margin-left: 55px;
  padding-right: 20px;
  border: none;
  font-size: 12px;
  font-family: bold, sans-serif;
  &:focus {
    outline: none;
  }
  &:empty::before {
    content: '태그로 검색해보세요!';
    color: var(--educoding-white);
    opacity: 0.5;
    font-size: 12px;
    font-family: bold, sans-serif;
  }
`;
export const TagSearchItem = styled.div.attrs({
  id: 'tagsearchitem',
})`
  border: none;
  font-size: 12px;
  display: flex;
  border-radius: 5px;
  background-color: var(--educoding-black);
  color: var(--educoding-white);
  position: relative;
  font-family: bold, sans-serif;
  align-items: center;
  justify-content: center;
  padding: 4px 4px;
  &:focus {
    outline: none;
  }
`;
export const ResetButtonBox = styled.div.attrs({
  id: 'resetbuttonbox',
})`
  width: 15%;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  border-bottom: 1px solid var(--educoding-line);
  @media (max-width: 768px) {
    width: 20%;
  }
`;
export const ResetButtonIcon = styled.div.attrs({
  id: 'resetbuttonicon',
})`
  width: 10px;
  height: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 3px;
  background-repeat: no-repeat;
  background-size: 10px;
  background-position: right;
  background-image: url('/images/icon/reset.png');
  position: relative;
`;
export const ResetButtonText = styled.div.attrs({
  id: 'resetbuttontext',
})`
  color: black;
  border: none;
  text-align: left;
  font-size: 12px;
  font-family: extrabold, sans-serif;
  position: relative;
`;

export const MiddleSortOuterContiner = styled.div.attrs({
  id: 'middlesortoutercontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
export const MiddleSortInnerContainer = styled.div.attrs({
  id: 'middlesortinnercontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid var(--educoding-line);
`;
export const MiddleWriteButton = styled.div.attrs({
  id: 'middlewritebutton',
})`
  width: 15%;
  height: 100%;
  color: rgba(0, 0, 0, 0.8);
  border: none;
  font-size: 12px;
  font-family: extrabold, sans-serif;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: #f1f1f1;
  margin-bottom: 10px;
  cursor: pointer;
  &:hover {
    color: var(--educoding-white);
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

export const MiddleSortContentsBox = styled.div.attrs({
  id: 'middlesortcontentsbox',
})`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;
export const MiddleSortTitleActive = styled.div.attrs({
  id: 'middlesorttitleactive',
})`
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--educoding-white);
  font-size: 14px;
  font-family: extrabold, sans-serif;
  padding: 0 15px;
  background-color: var(--educoding-black);
  border-right: 1px solid var(--educoding-line);
  cursor: pointer;
`;
export const MiddleSortTitleInactive = styled.div.attrs({
  id: 'middlesorttitleinactive',
})`
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--educoding-white);
  font-size: 14px;
  font-family: extrabold, sans-serif;
  padding: 0 15px;
  background-color: var(--educoding-dark);
  border-right: 1px solid var(--educoding-line);
  cursor: pointer;
`;

export const PostListContainer = styled.div.attrs({
  id: 'postlistcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 50px;
`;

export const PostEach = styled.div.attrs({
  id: 'posteach',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 10px 15px;
  gap: 5px;
  border-bottom: 1px solid var(--educoding-line);
  &:hover {
    background-color: var(--educoding-hover);
  }
`;
export const PostEachMain = styled.div.attrs({
  id: 'posteachmain',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  border-radius: 10px;
  background-color: #f1f1f1;
  padding: 20px 20px;
`;
export const PostTop = styled.div.attrs({
  id: 'posttop',
})`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  padding: 5px 0;
`;
export const PostTopUser = styled.div.attrs({
  id: 'posttopuser',
})`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`;
export const PostTopUserImg = styled.div.attrs({
  id: 'posttopuserimg',
})`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border: 1px solid var(--educoding-line);
`;

export const PostTopUserId = styled.div.attrs({
  id: 'posttopuserid',
})`
  font-family: bold, sans-serif;
  font-size: 12px;
  color: var(--educoding-white);
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const PostTopDays = styled.div.attrs({
  id: 'posttopdays',
})`
  font-family: bold, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const PostMiddle = styled.div.attrs({
  id: 'postmiddle',
})`
  width: 100%;
  padding: 0 0 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;
export const PostMiddleContentsUpper = styled.div.attrs({
  id: 'postmiddlecontentsupper',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: flex-start;
  align-items: center;
`;
export const PostMiddleContentsPending = styled.div.attrs({
  id: 'postmiddlecontentspending',
})`
  border-radius: 50px;
  background-color: var(--educoding-white);
  font-size: 10px;
  font-family: bold, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--educoding-black);
  padding: 5px 10px;
`;
export const PostMiddleContentsSolved = styled.div.attrs({
  id: 'postmiddlecontentssolved',
})`
  border-radius: 50px;
  background-color: var(--educoding-black);
  font-size: 10px;
  font-family: bold, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--educoding-white);
  padding: 5px 10px;
`;
export const PostMiddleContentsTitle = styled.div.attrs({
  id: 'postmiddlecontentstitle',
})`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: left;
  font-size: 12px;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
  -webkit-box-orient: vertical; /* 세로로 정렬 */
  -webkit-line-clamp: 1; /* 두 줄로 제한 */
  overflow: hidden; /* 넘치는 텍스트 숨기기 */
  text-overflow: ellipsis; /* 텍스트가 잘릴 때 말줄임 표시 (...) */
`;
export const PostMiddleContentsText = styled.div.attrs({
  id: 'postmiddlecontentstext',
})`
  width: 100%;
  font-size: 12px;
  line-height: 16px;
  font-family: regular, sans-serif;
  color: var(--educoding-white);
  display: -webkit-box; /* flexbox처럼 사용 */
  -webkit-box-orient: vertical; /* 세로로 정렬 */
  -webkit-line-clamp: 2; /* 두 줄로 제한 */
  overflow: hidden; /* 넘치는 텍스트 숨기기 */
  text-overflow: ellipsis; /* 텍스트가 잘릴 때 말줄임 표시 (...) */
  align-items: center;
`;
export const PostBottom = styled.div.attrs({
  id: 'postbottom',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  justify-content: space-between;
  padding: 5px 0;
`;
export const PostBottomTagsBox = styled.div.attrs({
  id: 'postbottomtagsbox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
`;
export const PostBottomTag = styled.div.attrs({
  id: 'postbottomtag',
})`
  border-radius: 5px;
  background-color: var(--educoding-black);
  color: var(--educoding-white);
  padding: 4px 6px;
  font-size: 10px;
  font-family: bold, sans-serif;
`;
export const PostBottomDataBox = styled.div.attrs({
  id: 'postbottomdatabox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  position: absolute;
  right: 5px;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
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
})<CommunityBoardProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10px;
  height: 10px;
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
  font-family: 'regular', sans-serif;
  font-size: 12px;
  color: var(--educoding-white);
`;

export const PostBottomDot = styled.div.attrs({
  id: 'postbottomdot',
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
})<CommunityBoardProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10px;
  height: 10px;
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
  font-family: 'regular', sans-serif;
  font-size: 12px;
  color: var(--educoding-white);
`;

export const EachBoardContainer = styled.div.attrs({
  id: 'eachboardcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #f1f1f1;
  border-radius: 10px;
  padding: 0px 20px;
  gap: 10px;
`;
export const EachBoardTitle = styled.div.attrs({
  id: 'eachboardtitle',
})`
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: left;
  color: var(--educoding-black);
  font-size: 20px;
  font-family: 'semibold', sans-serif;
  margin-top: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  &::after {
    content: '';
    width: 100%;
    height: 1px;
    background-color: var(--educoding-black);
    margin-top: 20px;
    transform: scaleY(0.5);
  }
`;
