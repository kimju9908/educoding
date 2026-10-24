import { JSX, useEffect, useLayoutEffect, useState } from 'react';

import { useLocation, useOutletContext } from 'react-router-dom';

import type { OutletContextType } from '../CommunityType';

import CommunityApi from '../../../../api/AxiosApi/CommunityApi/CommunityApi';
import {
  Container,
  LeftContainer,
  RightContainer,
  Wrap,
  PageTitleBar,
} from '../../../styles/community/Community_Main';
import {
  FeedContainer,
  FeedContents,
  PostContainer,
  UserId,
  UserPostAmount,
  UserProfileBox,
  UserProfileImg,
  UserProfileTextBox,
} from '../../../styles/community/User';
import Board_Community_User from '../components/common/board/Board_Community_User';

const User_Main = (): JSX.Element => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { writerKey } = location.state || {};
  const mainContentRef = useOutletContext<OutletContextType>();
  const [writerProfile, setWriterProfile] = useState<string | null>(null);
  const [writerName, setWriterName] = useState<string>('');
  const [writerPostCnt, setWriterPostCnt] = useState<number | null>(null);
  const [writerSelfIntro, setWriterSelfIntro] = useState<string>('');
  const [page] = useState(queryParams.get('page') || 1);
  const [size] = useState(queryParams.get('size') || 10);

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  useEffect(() => {
    const readUserPost = async (): Promise<void> => {
      try {
        const response = await CommunityApi.getotherprofile({ userId: Number(writerKey) });
        setWriterProfile(response.data.profileUrl);
        setWriterName(response.data.nickname);
        setWriterPostCnt(response.data.postCnt);
        if (response.data.introduction === null) {
          setWriterSelfIntro('아직 자기소개글이 없습니다.');
        } else if (response.data.introduction === '') {
          setWriterSelfIntro('아직 자기소개글이 없습니다.');
        } else {
          setWriterSelfIntro(response.data.introduction);
        }
      } catch (error) {
        console.error('유저 게시글 불러올 때 오류 발생 : ', error);
      }
    };
    readUserPost();
  }, [writerKey]);

  return (
    <>
      <Wrap>
        <Container>
          <LeftContainer>
            <UserProfileBox style={{ cursor: 'pointer' }}>
              <UserProfileImg isProfile={writerProfile} />
              <UserProfileTextBox>
                <UserId>{writerName}</UserId>
                <UserPostAmount>작성한 질문수 {writerPostCnt}</UserPostAmount>
              </UserProfileTextBox>
            </UserProfileBox>
          </LeftContainer>
          <RightContainer>
            <PageTitleBar>{writerName}님의 소개</PageTitleBar>
            <FeedContainer>
              <FeedContents
                dangerouslySetInnerHTML={{
                  __html: writerSelfIntro ?? '등록된 소개글이 없습니다.',
                }}
              ></FeedContents>
            </FeedContainer>
            <PageTitleBar>{writerName}님이 작성한 전체 글</PageTitleBar>
            <PostContainer>
              <Board_Community_User
                writerName={writerName}
                writerKey={Number(writerKey)}
                writerProfile={writerProfile}
                page={Number(page)}
                size={Number(size)}
              />
            </PostContainer>
          </RightContainer>
        </Container>
      </Wrap>
    </>
  );
};

export default User_Main;
