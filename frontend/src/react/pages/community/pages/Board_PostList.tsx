import React, { useEffect, useLayoutEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material';

import type { BoardRequest } from '../../../../api/AxiosApi/CommunityApi/CommunityApiType';
import type {
  BoardDataType,
  BoardPostListProps,
  CourseType,
  LanguageType,
  StudyType,
  TeamType,
} from '../CommunityType';

import CommunityApi from '../../../../api/AxiosApi/CommunityApi/CommunityApi';
import {
  PostBottom,
  PostBottomDataBox,
  PostBottomDot,
  PostBottomRepliesBox,
  PostBottomRepliesImg,
  PostBottomRepliesText,
  PostBottomTag,
  PostBottomTagsBox,
  PostBottomViewsBox,
  PostBottomViewsImg,
  PostBottomViewsText,
  PostEach,
  PostListContainer,
  PostMiddle,
  PostMiddleContentsPending,
  PostMiddleContentsSolved,
  PostMiddleContentsText,
  PostMiddleContentsTitle,
  PostMiddleContentsUpper,
  PostTop,
  PostTopDays,
  PostTopUser,
  PostTopUserId,
  PostTopUserImg,
} from '../../../styles/community/Community_Board';
import Board_Pagination from '../components/common/board/Board_Pagination';
import {
  LanguageDisplayNames,
  CourseDisplayNames,
  StudyDisplayNames,
  TeamDisplayNames,
} from '../components/common/DisplayNames';

const Board_PostList: React.FC<BoardPostListProps> = ({
  boardType,
  page,
  size,
  sortBy,
  order,
  status,
  enumFilter,
  search,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [boards, setBoards] = useState<BoardDataType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useLayoutEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [enumFilter, search]);

  // Get Board from Backend
  useEffect(() => {
    const loadBoard = async (): Promise<void> => {
      try {
        const params: BoardRequest = {
          page: currentPage,
          size: Number(size),
          boardType: String(boardType),
          sortBy,
          order,
          status: status !== null ? String(status) : '',
          enumFilter: enumFilter !== null ? String(enumFilter) : '',
          search: search !== null ? String(search) : '',
        };

        const response = await CommunityApi.getBoard(params);
        setBoards(response.data.content); // 받아온 게시글 리스트로 상태 업데이트
        // console.log(response.data.content);
        setTotalPages(response.data.totalPages); // 총 페이지 수 설정
      } catch (error) {
        console.error('게시글 리스트 가져오는 중 오류 발생 : ', error);
      }
    };
    loadBoard();
  }, [boardType, currentPage, sortBy, order, status, enumFilter, search, size]); // boardType 또는 currentPage가 변경될 때마다 실행

  // view post
  const handlePost = (boardType: string, board: BoardDataType): void => {
    navigate(`/community/${boardType}/post/${board.boardId}`, {
      state: {
        boardId: board.boardId,
        boardType: boardType,
      },
    });
  };

  const handleMove = async (boardType: string, board: BoardDataType): Promise<void> => {
    try {
      const response = await CommunityApi.getPostCheck({ id: board.boardId });
      if (response) {
        handlePost(boardType, board);
      }
    } catch (error) {
      console.error('게시글 이동중 오류 발생 : ', error);
    }
  };

  // paging handler
  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // contents conversion
  const getTextFromHTML = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <>
      <PostListContainer>
        {boards.length > 0 ? (
          <>
            {boards.map((board) => (
              <PostEach
                key={board.boardId}
                style={{ cursor: 'pointer' }}
                onClick={() => handleMove(boardType as string, board)}
              >
                <PostTop>
                  <PostTopUser>
                    <PostTopUserImg
                      style={{
                        backgroundImage: `url(${
                          board.profileUrl
                            ? board.profileUrl
                            : '/images/general/default_profile.png'
                        })`,
                      }}
                    />
                    <PostTopUserId>{board.name}</PostTopUserId>
                  </PostTopUser>
                  <PostTopDays>
                    {new Date(board.createdAt).toISOString().slice(0, 10).replace(/-/g, '.')}
                    {'. '}
                    작성
                  </PostTopDays>
                </PostTop>
                <PostMiddle>
                  <PostMiddleContentsUpper>
                    {boardType === 'coding' ? (
                      board.status === 'INACTIVE' ? (
                        <PostMiddleContentsSolved>해결됨</PostMiddleContentsSolved>
                      ) : (
                        <PostMiddleContentsPending>미해결</PostMiddleContentsPending>
                      )
                    ) : boardType === 'study' ? (
                      board.status === 'INACTIVE' ? (
                        <PostMiddleContentsSolved>모집완료</PostMiddleContentsSolved>
                      ) : (
                        <PostMiddleContentsPending>모집중</PostMiddleContentsPending>
                      )
                    ) : (
                      boardType === 'team' &&
                      (board.status === 'INACTIVE' ? (
                        <PostMiddleContentsSolved>모집완료</PostMiddleContentsSolved>
                      ) : (
                        <PostMiddleContentsPending>모집중</PostMiddleContentsPending>
                      ))
                    )}
                    <PostMiddleContentsTitle>{board.title}</PostMiddleContentsTitle>
                  </PostMiddleContentsUpper>
                  <PostMiddleContentsText>{getTextFromHTML(board.content)}</PostMiddleContentsText>
                </PostMiddle>
                <PostBottom>
                  {((Array.isArray(board.language) &&
                    board.language.some((item) => item.trim() !== '')) ||
                    (Array.isArray(board.course) &&
                      board.course.some((item) => item.trim() !== '')) ||
                    (Array.isArray(board.study) &&
                      board.study.some((item) => item.trim() !== '')) ||
                    (Array.isArray(board.team) &&
                      board.team.some((item) => item.trim() !== ''))) && (
                    <PostBottomTagsBox>
                      {board.language && board.language.length > 0
                        ? board.language.map((lang) => (
                            <PostBottomTag>
                              {LanguageDisplayNames[lang as LanguageType]}
                            </PostBottomTag>
                          ))
                        : board.course && board.course.length > 0
                          ? board.course.map((lang) => (
                              <PostBottomTag>
                                {CourseDisplayNames[lang as CourseType]}
                              </PostBottomTag>
                            ))
                          : board.study && board.study.length > 0
                            ? board.study.map((lang) => (
                                <PostBottomTag>
                                  {StudyDisplayNames[lang as StudyType]}
                                </PostBottomTag>
                              ))
                            : board.team &&
                              board.team.length > 0 &&
                              board.team.map((lang) => (
                                <PostBottomTag>{TeamDisplayNames[lang as TeamType]}</PostBottomTag>
                              ))}
                    </PostBottomTagsBox>
                  )}
                  <PostBottomDataBox>
                    <PostBottomViewsBox>
                      <PostBottomViewsImg theme={theme.palette.mode} />
                      <PostBottomViewsText>{board.viewCnt}</PostBottomViewsText>
                    </PostBottomViewsBox>
                    <PostBottomDot />
                    <PostBottomRepliesBox>
                      <PostBottomRepliesImg theme={theme.palette.mode} />
                      <PostBottomRepliesText>{board.commentCnt}</PostBottomRepliesText>
                    </PostBottomRepliesBox>
                  </PostBottomDataBox>
                </PostBottom>
              </PostEach>
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
      </PostListContainer>

      <Board_Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default Board_PostList;
