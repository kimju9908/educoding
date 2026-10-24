import React, { useEffect, useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { useTheme, Dialog, DialogContent, DialogActions, Button } from '@mui/material';

import Post_Reply_WriteEditor from './Post_ReplyEditor';
import Post_ReplyModifyEditor from './Post_ReplyModifyEditor';
import CommunityApi from '../../../../../../api/AxiosApi/CommunityApi/CommunityApi';
import { ReplyRequest } from '../../../../../../api/AxiosApi/CommunityApi/CommunityApiType';
import { useAppDispatch, useAppSelector } from '../../../../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../../../../redux/slice/LoginModalSlice';
import {
  ReplyContainer,
  SuggestBox,
  ReplyList,
  ReplyEach,
  ReplyUserProfileBox,
  ReplyUserProfileImg,
  ReplyUserId,
  ReplyUserProfileTextBox,
  ReplyUserDate,
  ReplyMiddle,
  ReplyMiddleText,
  EditorBox,
  ReplyEachTopBox,
  ReplyMoreButtonArea,
  ReplyMoreButton,
  ReplyPostMore,
  ReplyPostMoreOwnerContainer,
  ReplyPostMoreOwnerItem,
} from '../../../../../styles/community/Community_Post';
import { PostReplyAreaProps, ReplyDataType } from '../../../CommunityType';
import Board_Pagination from '../board/Board_Pagination';

const Post_ReplyArea: React.FC<PostReplyAreaProps> = ({
  boardType,
  page,
  size,
  sortBy,
  order,
  postBoardId,
}) => {
  const { boardId } = useParams();
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [replies, setReplies] = useState<ReplyDataType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  // Get Replies from Backend (getReplies)
  useEffect(() => {
    const loadReplies = async (): Promise<void> => {
      try {
        const request: ReplyRequest = {
          boardId: Number(boardId),
          page: currentPage,
          size,
          sortBy,
          order,
        };
        const response = await CommunityApi.getReplies(request);
        setReplies(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('댓글 리스트 가져오는 중 오류 발생 : ', error);
      }
    };
    loadReplies();
  }, [boardId, currentPage, order, size, sortBy]);

  // paging handler
  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reply Editor Open
  const handleBoxClick = (): void => {
    if (!editorOpen) {
      setEditorOpen(true); // 클릭 시 에디터 열기
    }
  };

  // Reply Editor Close
  const handleCloseEditor = (): void => {
    setEditorOpen(false);
  };

  const handleUserProfile = (userId: number): void => {
    navigate(`/community/user/${userId}`, {
      state: {
        writerKey: userId,
      },
    });
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const handleDialogCloseAndReload = (): void => {
    setDialogOpen(false);
    navigate(0);
  };

  const userkeynumber = useAppSelector((state) => state.auth.keynumber);

  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

  const handleDeleteReply = async (commentId: number, replyUserKey: number): Promise<void> => {
    if (userkeynumber !== replyUserKey) {
      setDialogMessage('댓글 삭제 권한이 없습니다.');
      setDialogOpen(true);
      return;
    }
    setSelectedCommentId(commentId);
    setDialogMessage('이 댓글을 정말로 삭제하시겠습니까?');
    setDialogOpen(true);
  };

  const confirmDeleteReply = async (): Promise<void> => {
    if (selectedCommentId === null) return;

    try {
      const response = await CommunityApi.deleteReply(selectedCommentId);
      if (response) {
        setDialogMessage('댓글이 삭제되었습니다.');
        setDialogOpen(true);
      }
    } catch (error) {
      console.error(error);
      setDialogMessage('댓글 삭제에 실패했습니다.');
      setDialogOpen(true);
    }
  };

  const nickname = useAppSelector((state) => state.auth.nickname);

  const extraRef = useRef<HTMLDivElement | null>(null);
  const [extraStates, setExtraStates] = useState<Record<number, boolean>>({}); // 초기값을 빈 객체로 설정

  const handleExtra = (commentId: number): void => {
    setExtraStates((prev) => ({
      ...prev,
      [commentId]: !prev[commentId], // undefined 방지
    }));
  };

  const handleCloseExtra = (commentId: number): void => {
    setExtraStates((prev) => ({
      ...prev, // 객체 확장 연산자 사용
      [commentId]: false, // 해당 commentId에 대한 isExtra 상태를 false로 설정 (닫기)
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (extraRef.current && !extraRef.current.contains(event.target as Node)) {
        setExtraStates({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [editingReplies, setEditingReplies] = useState<Record<number, boolean>>(
    Object.fromEntries(replies.map((reply) => [reply.commentId, false])),
  );
  const handleCloseModifyEditor = (commentId: number): void => {
    setEditingReplies((prevState) => ({
      ...prevState,
      [commentId]: false, // 해당 댓글만 false로 변경
    }));
  };
  const handleOpenModifyEditor = (commentId: number): void => {
    setEditingReplies((prevState) => ({
      ...prevState,
      [commentId]: true, // 해당 댓글의 수정 상태를 true로 설정
    }));
  };

  return (
    <>
      <ReplyContainer>
        <SuggestBox
          expanded={editorOpen}
          onClick={nickname ? handleBoxClick : (): void => { dispatch(openLoginModal()); }}
        >
          <span style={{ marginLeft: '15px', cursor: 'pointer' }}>
            📝
            {nickname
              ? ` ${nickname}님, 이 글에 대한 의견을 남겨 주세요!`
              : ' 로그인하고 이 글에 대한 의견을 남겨 주세요!'}
          </span>
          {editorOpen ? (
            <EditorBox expanded={editorOpen}>
              <Post_Reply_WriteEditor
                handleCloseEditor={handleCloseEditor}
                postBoardId={postBoardId}
              />
            </EditorBox>
          ) : null}
        </SuggestBox>
        <ReplyList>
          {replies
            .filter((reply) => reply.boardId === Number(boardId)) // boardId가 같은 것만 필터링
            .map((reply, index) => (
              <ReplyEach key={index}>
                <ReplyEachTopBox>
                  <ReplyUserProfileBox onClick={() => handleUserProfile(reply.userKey)}>
                    <ReplyUserProfileImg isProfile={reply.profileUrl} />
                    <ReplyUserProfileTextBox>
                      <ReplyUserId>{reply.name}</ReplyUserId>
                      <ReplyUserDate>
                        {new Date(reply.createdAt)
                          .toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })
                          .replace(/\. /g, '. ')}{' '}
                        작성
                      </ReplyUserDate>
                    </ReplyUserProfileTextBox>
                  </ReplyUserProfileBox>

                  {Number(reply.userKey) === Number(userkeynumber) ? (
                    <>
                      <ReplyPostMore>
                        <ReplyPostMoreOwnerContainer
                          ref={extraRef}
                          isOpen={extraStates[reply.commentId]}
                        >
                          <ReplyPostMoreOwnerItem
                            isOpen={extraStates[reply.commentId]}
                            onClick={() => {
                              handleOpenModifyEditor(reply.commentId);
                              handleCloseExtra(reply.commentId);
                            }}
                          >
                            댓글 수정
                          </ReplyPostMoreOwnerItem>
                          <ReplyPostMoreOwnerItem
                            isOpen={extraStates[reply.commentId]}
                            onClick={() => {
                              handleDeleteReply(reply.commentId, reply.userKey);
                              handleCloseExtra(reply.commentId);
                            }}
                          >
                            댓글 삭제
                          </ReplyPostMoreOwnerItem>
                        </ReplyPostMoreOwnerContainer>
                      </ReplyPostMore>
                      {/* 수정/삭제 버튼, 로그인한 사용자가 댓글 작성자가 아니면 아예 안보이게 */}
                      <ReplyMoreButtonArea>
                        <ReplyMoreButton
                          theme={theme.palette.mode}
                          // onClick={() => handleMoreButtonClick(reply)}
                          onClick={() => handleExtra(reply.commentId)}
                        />
                      </ReplyMoreButtonArea>
                    </>
                  ) : null}
                </ReplyEachTopBox>
                <ReplyMiddle>
                  {/* 댓글 수정시 댓글 내용 대신 수정 에디터 나타남 */}
                  {editingReplies[reply.commentId] ? (
                    <Post_ReplyModifyEditor
                      handleCloseModifyEditor={() => handleCloseModifyEditor(reply.commentId)}
                      postBoardId={postBoardId}
                      replyContents={reply.content ?? ''}
                      replyId={reply.commentId}
                      replyUserName={reply.name}
                    />
                  ) : (
                    <ReplyMiddleText dangerouslySetInnerHTML={{ __html: reply.content }} />
                  )}
                </ReplyMiddle>
              </ReplyEach>
            ))}
        </ReplyList>
        {totalPages > 1 && (
          <Board_Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </ReplyContainer>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            fontFamily: 'regular',
            minWidth: '400px', // 최소 가로 너비 설정
            maxWidth: '500px', // 최대 가로 너비 설정
          },
        }}
      >
        <DialogContent
          sx={{
            fontFamily: 'bold',
            fontSize: '14px',
            textAlign: 'center', // 가로 정렬
            display: 'flex',
            justifyContent: 'center', // 세로 정렬
            alignItems: 'center', // 세로 정렬
          }}
        >
          {dialogMessage}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'right' }}>
          {dialogMessage === '이 댓글을 정말로 삭제하시겠습니까?' ? (
            <>
              <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleDialogClose}>
                취소
              </Button>
              <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={confirmDeleteReply}>
                확인
              </Button>
            </>
          ) : dialogMessage === '댓글이 삭제되었습니다.' ? (
            <Button
              sx={{ fontFamily: 'bold' }}
              color="secondary"
              onClick={() => {
                navigate(0);
              }}
            >
              확인
            </Button>
          ) : (
            <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleDialogClose}>
              닫기
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Post_ReplyArea;
