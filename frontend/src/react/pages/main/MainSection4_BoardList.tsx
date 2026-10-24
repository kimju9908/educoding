import React, { useEffect, useLayoutEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material';

import type {
  BoardDataType,
  PostCheckRequest,
} from '../../../api/AxiosApi/CommunityApi/CommunityApiType';

import { MainSection4BoardListProps } from './MainType';
import CommunityApi from '../../../api/AxiosApi/CommunityApi/CommunityApi';
import MainApi from '../../../api/AxiosApi/MainApi/MainApi';
import { MainBoardRequest } from '../../../api/AxiosApi/MainApi/MainApiType';
import {
  PostBottom,
  PostBottomDataBox,
  PostBottomDot,
  PostBottomRepliesBox,
  PostBottomRepliesImg,
  PostBottomRepliesText,
  PostBottomViewsBox,
  PostBottomViewsImg,
  PostBottomViewsText,
  PostEachMain,
  PostListContainer,
  PostMiddle,
  PostMiddleContentsText,
  PostMiddleContentsTitle,
} from '../../styles/main/Main';

const MainSection4_BoardList: React.FC<MainSection4BoardListProps> = ({ boardType, size }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [boards, setBoards] = useState<BoardDataType[]>([] as BoardDataType[]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useLayoutEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  // Get Board from Backend
  useEffect(() => {
    const loadBoard = async (): Promise<void> => {
      try {
        const request: MainBoardRequest = {
          page: currentPage,
          size,
          boardType,
        };
        const response = await MainApi.getMainBoard(request);
        setBoards(response.data.content); // 받아온 게시글 리스트로 상태 업데이트
        setTotalPages(response.data.totalPages); // 총 페이지 수 설정
      } catch (error) {
        console.error('게시글 리스트 가져오는 중 오류 발생 : ', error);
      }
    };
    loadBoard();
  }, [boardType, currentPage, size]); // boardType 또는 currentPage가 변경될 때마다 실행

  // console.log('게시글 확인 : ', boards);

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
      const params: PostCheckRequest = { id: board.boardId };
      const response = await CommunityApi.getPostCheck(params);
      if (response) {
        handlePost(boardType, board);
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
      <PostListContainer>
        {boards.length > 0 ? (
          <>
            {boards.map((board) => (
              <PostEachMain
                key={board.boardId}
                style={{ cursor: 'pointer' }}
                onClick={() => handleMove(boardType, board)}
              >
                <PostMiddle>
                  <PostMiddleContentsTitle>{board.title}</PostMiddleContentsTitle>
                  <PostMiddleContentsText>{getTextFromHTML(board.content)}</PostMiddleContentsText>
                </PostMiddle>
                <PostBottom>
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
              </PostEachMain>
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
    </>
  );
};

export default MainSection4_BoardList;
