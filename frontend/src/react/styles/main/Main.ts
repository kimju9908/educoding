import styled from 'styled-components';

type MainProps = {
  isHovered?: boolean;
  theme?: 'light' | 'dark';
  defaultImg?: string;
  hoverImg?: string;
  lightImg?: string;
};

export const Wrap = styled.div.attrs({
  id: 'wrap',
})`
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: top;
  align-items: center;
  gap: 100px;
  background-color: var(--educoding-dark);
  padding-bottom: 100px;
`;

export const Container = styled.div.attrs({
  id: 'container',
})`
  max-width: 1280px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 0;
  gap: 100px;
  padding-left: 10px;
  padding-right: 10px;
  align-items: center;
  @media (max-width: 768px) {
    gap: 50px;
  }
`;
export const MiddleTitleContainer = styled.div.attrs({
  id: 'middletitlecontainer',
})`
  width: 100%;
  display: flex;
  gap: 10px;
  padding-left: 15px;
  align-items: center;
`;
export const MiddleTitleBar = styled.div.attrs({
  id: 'middletitlebar',
})`
  width: 5px;
  height: 22px;
  border-radius: 3px;
  background: var(--educoding-gradient);
  @media (max-width: 768px) {
    height: 16px;
  }
`;
export const MiddleTitle = styled.div.attrs({
  id: 'middletitle',
})`
  font-family: extrabold, sans-serif;
  font-size: 20px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;
export const MainSection1Container = styled.div.attrs({
  id: 'mainsection1container',
})`
  width: 100%;
  display: flex;
  gap: 20px;
  flex-direction: column;
  justify-content: center;
`;
export const MainSectionContentsContainer = styled.div.attrs({
  id: 'mainsection1contentscontainer',
})`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
    gap: 10px;
  }
`;
export const MainSectionContents = styled.div.attrs({
  id: 'mainsection1contents',
})`
  width: 100%;
  height: 230px;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--educoding-line);
  border-radius: var(--educoding-radius);
  background-color: var(--educoding-surface);
  box-shadow: var(--educoding-shadow);
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--educoding-shadow-hover);
    border-color: var(--educoding-purple);
  }
`;
export const MainSectionImg = styled.div.attrs({
  id: 'mainsection1img',
})<MainProps>`
  width: 100%;
  height: 150px;
  background-image: ${({ isHovered, defaultImg, hoverImg, theme, lightImg }) =>
    theme === 'light'
      ? isHovered
        ? `url(${lightImg})`
        : `url(${defaultImg})`
      : isHovered
        ? `url(${hoverImg})`
        : `url(${defaultImg})`};
  background-repeat: no-repeat;
  background-position: center;
  background-size: 30%;
  border-bottom: 1px solid var(--educoding-line);
  transition: all 0.3s ease-in-out;

  @media (max-width: 768px) {
    background-size: contain;
  }
`;

export const MainSectionTextContainer = styled.div.attrs({
  id: 'mainsection1textcontainer',
})<MainProps>`
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
  background: ${({ isHovered }) => (isHovered ? 'var(--educoding-gradient)' : 'transparent')};
  transition: all 0.3s ease-in-out;
`;
export const MainSectionTextTitle = styled.div.attrs({
  id: 'mainsection1texttitle',
})<MainProps>`
  width: 100%;
  font-family: extrabold, sans-serif;
  font-size: 16px;
  text-align: center;
  color: ${({ isHovered }) => (isHovered ? 'white' : 'var(--educoding-white)')};
`;
export const MainSectionTextContents = styled.div.attrs({
  id: 'mainsection1textcontents',
})<MainProps>`
  width: 100%;
  font-family: regular, sans-serif;
  font-size: 14px;
  text-align: center;
  color: ${({ isHovered }) => (isHovered ? 'white' : 'var(--educoding-white)')};
`;
export const MainSection2Container = styled.div.attrs({
  id: 'mainsection2container',
})`
  width: 100%;
  display: flex;
  gap: 20px;
  flex-direction: column;
  justify-content: center;
`;
export const MainBlockImg01 = styled.div.attrs({
  id: 'mainblockimg01',
})`
  width: 100%;
  height: 400px;
  border-radius: var(--educoding-radius);
  box-shadow: var(--educoding-shadow);
  background-image: url('/images/main/mainblock01.png');
  @media (max-width: 768px) {
    height: 200px;
    background-size: cover;
  }
`;

export const MainSection3Container = styled.div.attrs({
  id: 'mainsection3container',
})`
  width: 100%;
  display: flex;
  gap: 20px;
  flex-direction: column;
  justify-content: baseline;
`;

export const MainSection3ContentsContainer = styled.div.attrs({
  id: 'mainsection3contentscontainer',
})`
  width: 100%;
  border: 1px solid var(--educoding-line);
  border-radius: var(--educoding-radius);
  background-color: var(--educoding-surface);
  box-shadow: var(--educoding-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: top;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
export const MainSection3Contents = styled.div.attrs({
  id: 'mainsection3contents',
})`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: baseline;
  border-right: 1px solid var(--educoding-line);
`;
export const MainSection3TitleArea = styled.div.attrs({
  id: 'mainsection3titlearea',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding-top: 20px;
  padding-left: 15px;
  gap: 5px;
  padding-bottom: 20px;
  @media (max-width: 768px) {
    padding-bottom: 10px;
  }
`;
export const MainSection3TitleLeft = styled.div.attrs({
  id: 'mainsection3titleleft',
})`
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: extrabold, sans-serif;
  font-size: 16px;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;
export const MainSection3TitleRight = styled.div.attrs({
  id: 'mainsection3titleright',
})`
  font-family: extrabold, sans-serif;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;
export const MainSection3ExamplesArea = styled.div.attrs({
  id: 'mainsection3examplesarea',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-left: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--educoding-line);
  @media (max-width: 768px) {
    padding-left: 10px;
    padding-bottom: 10px;
  }
`;
export const MainSection3EachExample = styled.div.attrs({
  id: 'mainsection3eachexample',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
`;
export const MainSection3EachExampleLeft = styled.div.attrs({
  id: 'mainsection3eachexampleleft',
})`
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const MainSection3EachExampleRight = styled.div.attrs({
  id: 'mainsection3eachexampleright',
})`
  font-family: extrabold, sans-serif;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;
export const MainSection3AnswerArea = styled.div.attrs({
  id: 'mainsection3answerarea',
})`
  width: 100%;
  height: 70px;
  display: flex;
  flex-direction: row;
  @media (max-width: 768px) {
    border-bottom: 1px solid var(--educoding-line);
    flex-direction: column;
    height: 100%;
  }
`;
export const MainSection3AnswerText = styled.div.attrs({
  id: 'mainsection3answertext',
})`
  width: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  align-items: center;
  padding-left: 10px;
  @media (max-width: 768px) {
    height: 70px;
    width: 100%;
  }
`;

export const MainSection3AnswerTextLine = styled.div.attrs({
  id: 'mainsection3answertextline',
})`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 5px;
`;
export const MainSection3AnswerTextLeft = styled.div.attrs({
  id: 'mainsection3answertextleft',
})`
  font-family: extrabold, sans-serif;
  font-size: 12px;
  display: flex;
  white-space: no-wrap;
  min-width: 25px;
`;
export const MainSection3AnswerTextRight = styled.div.attrs({
  id: 'mainsection3answertextright',
})`
  font-family: bold, sans-serif;
  font-size: 12px;
  word-break: break-word;
  overflow-wrap: break-word;
`;
export const MainSection4GridContainer = styled.div.attrs({
  id: 'mainsection4GridContainer',
})`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;
export const MainSection4EachContainer = styled.div.attrs({
  id: 'mainsection4eachcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: baseline;
`;

export const PostListContainer = styled.div.attrs({
  id: 'postlistcontainer',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid var(--educoding-line);
  border-radius: var(--educoding-radius);
  background-color: var(--educoding-surface);
  overflow: hidden;
`;

export const PostEachMain = styled.div.attrs({
  id: 'posteachmain',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background-color: transparent;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  & + & {
    border-top: 1px solid var(--educoding-line);
  }
  &:hover {
    background-color: var(--educoding-hover);
  }
`;
export const PostMiddle = styled.div.attrs({
  id: 'postmiddle',
})`
  width: 100%;
  gap: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
export const PostMiddleContentsTitle = styled.div.attrs({
  id: 'postmiddlecontentstitle',
})`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  font-family: bold, sans-serif;

  margin-bottom: 3px;
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
  font-family: light, sans-serif;
  line-height: 16px;

  display: -webkit-box; /* flexbox처럼 사용 */
  -webkit-box-orient: vertical; /* 세로로 정렬 */
  -webkit-line-clamp: 2; /* 두 줄로 제한 */
  overflow: hidden; /* 넘치는 텍스트 숨기기 */
  text-overflow: ellipsis; /* 텍스트가 잘릴 때 말줄임 표시 (...) */
`;
export const PostBottom = styled.div.attrs({
  id: 'postbottom',
})`
  height: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  justify-content: space-between;
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
})<MainProps>`
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
})<MainProps>`
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
`;
