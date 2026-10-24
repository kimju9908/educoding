import styled, { css } from 'styled-components';

type CommunityComponentsProps = {
  isActive?: boolean;
  isProfile?: string | null;
};

export const SubjectContainer = styled.div.attrs({
  id: 'subjectcontainer',
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

export const SubjectImgContainer = styled.div.attrs({
  id: 'subjectimgcontainer',
})`
  width: 50%;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  margin-top: 10px;
  margin-bottom: 10px;
`;
export const SubjectTextContainer = styled.div.attrs({
  id: 'subjecttextcontainer',
})`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
export const SubjectTitle = styled.div.attrs({
  id: 'subjecttitle',
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
export const SubjectContents = styled.div.attrs({
  id: 'subjectcontents',
})`
  width: 100%;
  font-family: regular, sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: var(--educoding-white);
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  white-space: pre-line;
`;

export const ChapterOuter = styled.div.attrs({
  id: 'chapterouter',
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
export const ChapterListTitle = styled.div.attrs({
  id: 'chapterlisttitle',
})`
  width: 100%;
  background-color: var(--educoding-header);
  box-shadow: inset 3px 0 0 var(--educoding-purple);
  height: 40px;
  font-family: extrabold, sans-serif;
  font-size: 14px;
  color: white;
  display: flex;
  align-items: center;
  padding-left: 15px;
`;
export const ChapterInner = styled.div.attrs({
  id: 'chapterinner',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--educoding-dark);
`;

export const ChapterName = styled.div.attrs({
  id: 'ChapterName',
})`
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: left;
  align-items: center;
  color: var(--educoding-white);
  font-size: 14px;
  font-family: bold, sans-serif;
  cursor: pointer;
  position: relative;
  padding-left: 15px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    padding-left 0.2s ease;
  &:hover {
    background-color: var(--educoding-accent-soft);
    color: var(--educoding-purple);
    padding-left: 21px;
  }
`;

export const PopularTagsContainer = styled.div.attrs({
  id: 'populartagscontainer',
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

export const PopularTagsTitle = styled.div.attrs({
  id: 'populartagstitle',
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
export const PopularTagsItemsBox = styled.div.attrs({
  id: 'populartagsitemsbox',
})`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
`;
export const PopularTagsItem = styled.div.attrs({
  id: 'populartagsitem',
})<CommunityComponentsProps>`
  background-color: var(--educoding-dark);
  color: var(--educoding-white);
  font-family: bold, sans-serif;
  font-size: 12px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  ${(props) =>
    props.isActive &&
    css`
      color: var(--educoding-purple);
    `}
  &:hover {
    background-color: var(--educoding-hover);
  }
`;
export const WeeklyBestContainer = styled.div.attrs({
  id: 'weeklybestcontainer',
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
export const WeeklyBestTitle = styled.div.attrs({
  id: 'weeklybesttitle',
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
export const WeeklyBestList = styled.div.attrs({
  id: 'weeklybestlist',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;
export const WeeklyBestEach = styled.div.attrs({
  id: 'weeklybesteach',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: var(--educoding-dark);
  padding: 15px;
  cursor: pointer;
  &:hover {
    background-color: var(--educoding-hover);
  }
`;
export const WeeklyBestTextBox = styled.div.attrs({
  id: 'weeklybesttextbox',
})`
  width: 100%;
  gap: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
export const WeeklyBestContents = styled.div.attrs({
  id: 'weeklybestcontents',
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
export const WeeklyBestDetail = styled.div.attrs({
  id: 'weeklybestdetail',
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
export const WeeklyBestBottom = styled.div.attrs({
  id: 'weeklybestbottom',
})`
  height: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  justify-content: space-between;
`;

export const WeeklyBestUserBox = styled.div.attrs({
  id: 'weeklybestuserbox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: center;
  align-items: center;
`;
export const WeeklyBestUserImg = styled.div.attrs({
  id: 'weeklybestuserimg',
})<CommunityComponentsProps>`
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 2px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 50%;
  border: 1px solid var(--educoding-line);
  position: relative;
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
export const WeeklyBestUserId = styled.div.attrs({
  id: 'weeklybestuserid',
})`
  font-family: regular, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
`;
export const WeeklyBestDataBox = styled.div.attrs({
  id: 'weeklybestdatabox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  position: absolute;
  right: 5px;
  justify-content: center;
  align-items: center;
`;
export const WeeklyBestViewsBox = styled.div.attrs({
  id: 'weeklybestviewsbox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: center;
  align-items: center;
`;

export const WeeklyBestViewsImg = styled.div.attrs({
  id: 'weeklybestviewsimg',
})`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 13px;
  height: 13px;
  margin-top: 1px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: url('/images/icon/views.png');
`;

export const WeeklyBestViewsText = styled.div.attrs({
  id: 'weeklybestviewstext',
})`
  font-family: regular, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
`;
export const WeeklyBestBottomDot = styled.div.attrs({
  id: 'weeklybestbottomdot',
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
export const WeeklyBestRepliesBox = styled.div.attrs({
  id: 'weeklybestrepliesbox',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: center;
  align-items: center;
`;

export const WeeklyBestRepliesImg = styled.div.attrs({
  id: 'weeklybestrepliesimg',
})`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 12px;
  height: 12px;
  margin-top: 1px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: url('/images/icon/replies.png');
`;

export const WeeklyBestRepliesText = styled.div.attrs({
  id: 'weeklybestrepliestext',
})`
  font-family: regular, sans-serif;
  font-size: 10px;
  color: var(--educoding-white);
`;

export const TopWritersContainer = styled.div.attrs({
  id: 'topwriterscontainer',
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
export const TopWritersTitle = styled.div.attrs({
  id: 'boardlisttitle',
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
export const TopWritersList = styled.div.attrs({
  id: 'topwriterslist',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
export const TopWritersEach = styled.div.attrs({
  id: 'topwriterseach',
})`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  cursor: pointer;
  &:hover {
    background-color: var(--educoding-hover);
  }
`;
export const TopWritersProfileBox = styled.div.attrs({
  id: 'topwritersprofilebox',
})`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;
export const TopWritersImg = styled.div.attrs({
  id: 'topwritersimg',
})<CommunityComponentsProps>`
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 20px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 50%;
  border: 1px solid var(--educoding-line);
  position: relative;
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
export const TopWritersId = styled.div.attrs({
  id: 'topwritersid',
})`
  text-align: left;
  font-family: bold, sans-serif;
  font-size: 12px;
  color: var(--educoding-white);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const TopWritersPoint = styled.div.attrs({
  id: 'topwriterspoint',
})`
  text-align: right;
  font-family: bold, sans-serif;
  font-size: 12px;
  color: var(--educoding-white);
  position: relative;
`;
