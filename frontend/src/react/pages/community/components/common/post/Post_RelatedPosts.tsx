import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material';

import CommunityApi from '../../../../../../api/AxiosApi/CommunityApi/CommunityApi';
import { SimilarPostResponse } from '../../../../../../api/AxiosApi/CommunityApi/CommunityApiType';
import {
  MiddleDot,
  PostBottomRepliesBox,
  PostBottomRepliesImg,
  PostBottomRepliesText,
  PostBottomViewsBox,
  PostBottomViewsImg,
  PostBottomViewsText,
  RelatedPostContents,
  RelatedPostContentsBottom,
  RelatedPostContentsText,
  RelatedPostContentsTitle,
  RelatedPostEach,
  RelatedPostsContainer,
  RelatedPostsList,
  RelatedPostsTitle,
} from '../../../../../styles/community/Community_Post';
import { RelatedPostsProps } from '../../../CommunityType';

const Post_RelatedPosts: React.FC<RelatedPostsProps> = ({ boardId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [similarBoard, setSimilarBoard] = useState<SimilarPostResponse[]>([]);

  useEffect(() => {
    const relatedPosts = async (): Promise<void> => {
      try {
        const response = await CommunityApi.similarPost(Number(boardId));
        setSimilarBoard(response.data);
      } catch (error) {
        console.error('관련 게시글 불러오기 오류 ', error);
      }
    };
    relatedPosts();
  }, [boardId]);

  const handlePost = (boardType: string, boardId: number): void => {
    navigate(`/community/${boardType.toLowerCase()}/post/${boardId}`);
  };

  const handleMove = async (board: SimilarPostResponse): Promise<void> => {
    try {
      const response = await CommunityApi.getPostCheck({ id: board.boardId });
      if (response) {
        handlePost(board.boardType, board.boardId);
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
      <RelatedPostsContainer>
        <RelatedPostsTitle>🔗 이 글과 비슷한 글</RelatedPostsTitle>
        {Array.isArray(similarBoard) && similarBoard.length > 0 ? (
          <RelatedPostsList>
            {similarBoard.map((board) => (
              <RelatedPostEach
                key={board.boardId}
                style={{ cursor: 'pointer' }}
                onClick={() => handleMove(board)}
              >
                <RelatedPostContents>
                  <RelatedPostContentsTitle>{board.title}</RelatedPostContentsTitle>
                  <RelatedPostContentsText>
                    {getTextFromHTML(board.content)}
                  </RelatedPostContentsText>
                </RelatedPostContents>
                <RelatedPostContentsBottom>
                  <PostBottomViewsBox>
                    <PostBottomViewsImg theme={theme.palette.mode} />
                    <PostBottomViewsText>{board.viewCnt}</PostBottomViewsText>
                  </PostBottomViewsBox>
                  <MiddleDot />
                  <PostBottomRepliesBox>
                    <PostBottomRepliesImg theme={theme.palette.mode} />
                    <PostBottomRepliesText>{board.commentCnt}</PostBottomRepliesText>
                  </PostBottomRepliesBox>
                </RelatedPostContentsBottom>
              </RelatedPostEach>
            ))}
          </RelatedPostsList>
        ) : null}
      </RelatedPostsContainer>
    </>
  );
};

export default Post_RelatedPosts;
