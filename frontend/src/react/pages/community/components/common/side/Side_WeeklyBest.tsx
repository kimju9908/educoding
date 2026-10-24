import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import CommunityApi from '../../../../../../api/AxiosApi/CommunityApi/CommunityApi';
import {
  PopularPostData,
  PostCheckRequest,
} from '../../../../../../api/AxiosApi/CommunityApi/CommunityApiType';
import {
  WeeklyBestBottom,
  WeeklyBestBottomDot,
  WeeklyBestContainer,
  WeeklyBestContents,
  WeeklyBestDataBox,
  WeeklyBestDetail,
  WeeklyBestEach,
  WeeklyBestList,
  WeeklyBestRepliesBox,
  WeeklyBestRepliesImg,
  WeeklyBestRepliesText,
  WeeklyBestTextBox,
  WeeklyBestTitle,
  WeeklyBestUserBox,
  WeeklyBestUserId,
  WeeklyBestUserImg,
  WeeklyBestViewsBox,
  WeeklyBestViewsImg,
  WeeklyBestViewsText,
} from '../../../../../styles/community/Community_Components';

const WeeklyBest: React.FC = () => {
  const navigate = useNavigate();
  const [weeklybest, setWeeklyBest] = useState<PopularPostData[]>([]);

  useEffect(() => {
    const readWeeklyBest = async (): Promise<void> => {
      try {
        const response = await CommunityApi.getpopularpost();
        setWeeklyBest(response.data);
      } catch (error) {
        console.error('weekly best 불러오는 중 오류 발생 : ', error);
      }
    };
    readWeeklyBest();
  }, []);

  // view post
  const handlePost = (post: PopularPostData): void => {
    navigate(`/community/${post.boardType.toLowerCase()}/post/${post.boardId}`, {
      state: {
        boardId: post.boardId,
        boardType: post.boardType.toLowerCase(),
      },
    });
  };

  const handleMove = async (post: PopularPostData): Promise<void> => {
    try {
      const params: PostCheckRequest = { id: Number(post.boardId) };
      const response = await CommunityApi.getPostCheck(params);
      if (response) {
        handlePost(post);
      }
    } catch (error) {
      console.error('게시글 이동중 오류 발생 : ', error);
    }
  };

  // contents conversion
  const getTextFromHTML = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <>
      <WeeklyBestContainer>
        <WeeklyBestTitle>🔥 주간 인기글</WeeklyBestTitle>
        {Array.isArray(weeklybest) && weeklybest.length > 0 ? (
          <>
            {weeklybest.map((post, index) => (
              <WeeklyBestList key={index}>
                <WeeklyBestEach key={post.boardId} onClick={() => handleMove(post)}>
                  <WeeklyBestTextBox>
                    <WeeklyBestContents>{post.title}</WeeklyBestContents>
                    <WeeklyBestDetail>{getTextFromHTML(post.content)}</WeeklyBestDetail>
                  </WeeklyBestTextBox>
                  <WeeklyBestBottom>
                    <WeeklyBestUserBox>
                      <WeeklyBestUserImg isProfile={post.profileUrl} />
                      <WeeklyBestUserId>{post.name}</WeeklyBestUserId>
                    </WeeklyBestUserBox>
                    <WeeklyBestDataBox>
                      <WeeklyBestViewsBox>
                        <WeeklyBestViewsImg />
                        <WeeklyBestViewsText>{post.viewCnt}</WeeklyBestViewsText>
                      </WeeklyBestViewsBox>
                      <WeeklyBestBottomDot />
                      <WeeklyBestRepliesBox>
                        <WeeklyBestRepliesImg />
                        <WeeklyBestRepliesText>{post.commentCnt}</WeeklyBestRepliesText>
                      </WeeklyBestRepliesBox>
                    </WeeklyBestDataBox>
                  </WeeklyBestBottom>
                </WeeklyBestEach>
              </WeeklyBestList>
            ))}
          </>
        ) : (
          <div
            style={{
              width: '100%',
              color: 'var(--educoding-white)',
              fontFamily: 'bold',
              padding: '30px',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            작성된 게시글이 없습니다.
          </div>
        )}
      </WeeklyBestContainer>
    </>
  );
};

export default WeeklyBest;
