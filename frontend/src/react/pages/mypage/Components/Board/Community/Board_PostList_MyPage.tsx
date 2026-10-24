import React, { useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { ZodError } from 'zod';

import type {
  BoardDataType,
  MyBoardListResponse,
  MyBoardRequest,
} from '../../../../../../api/AxiosApi/MyPageApi/MyPageApiTypes';
import type { MyPageCommunityProps } from '../../../MyPageType';

import CommunityApi from '../../../../../../api/AxiosApi/CommunityApi/CommunityApi';
import { PostCheckRequest } from '../../../../../../api/AxiosApi/CommunityApi/CommunityApiType';
import MyPageApi from '../../../../../../api/AxiosApi/MyPageApi/MyPageApi';
import { useAppDispatch, useAppSelector } from '../../../../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../../../../redux/slice/LoginModalSlice';
import { CheckResponse } from '../../../../../../types/CommonTypes';
import {
  PostEach,
  PostListContainer,
  PostTop,
  PostTopUser,
  PostTopUserId,
  PostTopUserImg,
  PostTopDays,
  PostMiddle,
  PostMiddleContentsTitle,
  PostMiddleContentsText,
  PostBottom,
  PostBottomRepliesBox,
  PostBottomRepliesImg,
  PostBottomRepliesText,
  PostBottomViewsBox,
  PostBottomViewsImg,
  PostBottomViewsText,
  PostBottomDot,
  PostMiddleContentsUpper,
  PostMiddleContentsSolved,
  PostMiddleContentsPending,
  PostBottomTagsBox,
  PostBottomTag,
  PostBottomDataBox,
} from '../../../../../styles/community/Community_Board';
import {
  BoardNameType,
  CourseType,
  LanguageType,
  StudyType,
  TeamType,
} from '../../../../community/CommunityType';
import Board_Pagination from '../../../../community/components/common/board/Board_Pagination';
import {
  CourseDisplayNames,
  LanguageDisplayNames,
  StudyDisplayNames,
  TeamDisplayNames,
} from '../../../../community/components/common/DisplayNames';

const Board_PostList_MyPage: React.FC<MyPageCommunityProps> = ({ page, size, onPageChange }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const profileUrl = useAppSelector((state) => state.auth.profile);

  const useMyBoardData = (params: MyBoardRequest): UseQueryResult<MyBoardListResponse, Error> => {
    return useQuery({
      queryKey: ['myboard', params],
      queryFn: MyPageApi.getMyPostsQuery,
    });
  };

  const usePostView = (): UseMutationResult<
    AxiosResponse<CheckResponse>,
    Error,
    PostCheckRequest
  > => {
    return useMutation({
      mutationFn: (params: PostCheckRequest) => CommunityApi.getPostCheck(params),
    });
  };

  const param: MyBoardRequest = useMemo(
    () => ({
      page,
      size,
      sortBy: 'createdAt',
      order: 'DESC',
    }),
    [page, size],
  );

  const { data: boardData, error: boardError } = useMyBoardData(param);

  const { mutate: checkPost } = usePostView();

  useEffect(() => {
    if (boardError instanceof ZodError) {
      console.warn('Zod 에러 감지', boardError.format());
      alert('잘못된 접근입니다.');
      dispatch(openLoginModal());
      navigate('/', { replace: true });
    }
  }, [boardError, navigate, dispatch]);

  // HTML 태그 제거 함수
  const getTextFromHTML = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const handlePostClick = (post: BoardDataType): void => {
    checkPost(
      { id: post.boardId },
      {
        onSuccess: (response) => {
          if (response.data) {
            navigate(`/community/${post.boardType?.toLowerCase()}/post/${post.boardId}`);
          }
        },
        onError: (error) => {
          console.error('조회 실패 ', error);
        },
      },
    );
  };

  const boardNames: BoardNameType = {
    CODING: '코딩 질문 게시판',
    COURSE: '진로 질문',
    STUDY: '스터디',
    TEAM: '팀 프로젝트',
    MENTOR: '멘토링',
  };

  return (
    <>
      <PostListContainer>
        {Array.isArray(boardData?.content) && boardData.content.length > 0 ? (
          boardData?.content.map((post) => (
            <PostEach
              style={{ cursor: 'pointer' }}
              key={post.boardId}
              onClick={() => handlePostClick(post)}
            >
              <PostTop>
                <PostTopUser>
                  <PostTopUserImg
                    style={{
                      backgroundImage: `url(${profileUrl ?? '/images/general/default_profile.png'})`,
                    }}
                  />
                  <PostTopUserId>{post.name}</PostTopUserId>
                </PostTopUser>
                <PostTopDays>
                  {new Date(post.createdAt).toISOString().slice(0, 10).replace(/-/g, '.')}
                  {'. '}
                  작성 ({post.boardType ? boardNames[post.boardType] : ''})
                </PostTopDays>
              </PostTop>
              <PostMiddle>
                <PostMiddleContentsUpper>
                  {post.status ? (
                    post.boardType === 'CODING' ? (
                      post.status === 'INACTIVE' ? (
                        <PostMiddleContentsSolved>해결됨</PostMiddleContentsSolved>
                      ) : (
                        <PostMiddleContentsPending>미해결</PostMiddleContentsPending>
                      )
                    ) : post.boardType === 'STUDY' ? (
                      post.status === 'INACTIVE' ? (
                        <PostMiddleContentsSolved>모집완료</PostMiddleContentsSolved>
                      ) : (
                        <PostMiddleContentsPending>모집중</PostMiddleContentsPending>
                      )
                    ) : (
                      post.boardType === 'TEAM' &&
                      (post.status === 'INACTIVE' ? (
                        <PostMiddleContentsSolved>모집완료</PostMiddleContentsSolved>
                      ) : (
                        <PostMiddleContentsPending>모집중</PostMiddleContentsPending>
                      ))
                    )
                  ) : (
                    <></>
                  )}
                  <PostMiddleContentsTitle>{post.title}</PostMiddleContentsTitle>
                </PostMiddleContentsUpper>
                <PostMiddleContentsText>{getTextFromHTML(post.content)}</PostMiddleContentsText>
              </PostMiddle>
              <PostBottom>
                {((Array.isArray(post.language) &&
                  post.language.some((item) => item.trim() !== '')) ||
                  (Array.isArray(post.course) && post.course.some((item) => item.trim() !== '')) ||
                  (Array.isArray(post.study) && post.study.some((item) => item.trim() !== '')) ||
                  (Array.isArray(post.team) && post.team.some((item) => item.trim() !== ''))) && (
                  <PostBottomTagsBox>
                    {post.language && post.language.length > 0
                      ? post.language.map((lang) => (
                          <PostBottomTag>
                            {LanguageDisplayNames[lang as LanguageType]}
                          </PostBottomTag>
                        ))
                      : post.course && post.course.length > 0
                        ? post.course.map((lang) => (
                            <PostBottomTag>{CourseDisplayNames[lang as CourseType]}</PostBottomTag>
                          ))
                        : post.study && post.study.length > 0
                          ? post.study.map((lang) => (
                              <PostBottomTag>{StudyDisplayNames[lang as StudyType]}</PostBottomTag>
                            ))
                          : post.team &&
                            post.team.length > 0 &&
                            post.team.map((lang) => (
                              <PostBottomTag>{TeamDisplayNames[lang as TeamType]}</PostBottomTag>
                            ))}
                  </PostBottomTagsBox>
                )}
                <PostBottomDataBox>
                  <PostBottomViewsBox>
                    <PostBottomViewsImg theme={theme.palette.mode as 'light' | 'dark'} />
                    <PostBottomViewsText>{post.viewCnt}</PostBottomViewsText>
                  </PostBottomViewsBox>
                  <PostBottomDot />
                  <PostBottomRepliesBox>
                    <PostBottomRepliesImg theme={theme.palette.mode as 'light' | 'dark'} />
                    <PostBottomRepliesText>{post.commentCnt}</PostBottomRepliesText>
                  </PostBottomRepliesBox>
                </PostBottomDataBox>
              </PostBottom>
            </PostEach>
          ))
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
            작성한 게시글이 없습니다.
          </div>
        )}
      </PostListContainer>

      <Board_Pagination
        currentPage={page}
        totalPages={boardData?.totalPages ?? 1}
        onPageChange={onPageChange}
      />
    </>
  );
};

export default Board_PostList_MyPage;
