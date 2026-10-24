import React, { useEffect, useRef, useState } from 'react';

import { useLocation, useParams, useNavigate } from 'react-router-dom';

import { useTheme, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import hljs from 'highlight.js'; // highlight.js 가져오기

import CommunityApi from '../../../../../../api/AxiosApi/CommunityApi/CommunityApi';
import {
  BoardReactionRequest,
  BoardReactionStatusRequest,
  ModifyPostStatusRequest,
} from '../../../../../../api/AxiosApi/CommunityApi/CommunityApiType';
import { useAppDispatch, useAppSelector } from '../../../../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../../../../redux/slice/LoginModalSlice';
import {
  MainPostContainer,
  MainPostTop,
  MainPostTitle,
  MainPostInformation,
  MainPostDate,
  MiddleDot,
  MainPostViewsBox,
  MainPostViewsImg,
  MainPostViewsText,
  MainPostEditedText,
  MainPostThumbsUpBox,
  MainPostThumbsUpImg,
  MainPostThumbsUpText,
  MainPostThumbsDownBox,
  MainPostThumbsDownImg,
  MainPostThumbsDownText,
  MainPostContentsPending,
  MainPostContentsSolved,
  MainPostMiddle,
  LeftEvBox,
  LeftEvUp,
  LeftEvDown,
  MainPostContentsBox,
  MainPostContentsText,
  MainPostTagsBox,
  MainPostTag,
  MainPostExtra,
  MainPostDiv,
  MainPostExtraItemContainer,
  MainPostExtraItemOtherContainer,
  MainPostExtraButton,
  MainPostExtraItem,
  MainPostExtraOtherItem,
  MainPostTitleArea,
  MainPostPending,
  MainPostTopTextContainer,
  MainPostRepliesBox,
  MainPostRepliesImg,
  MainPostRepliesText,
  MainPostNoTag,
} from '../../../../../styles/community/Community_Post';
import {
  CourseType,
  LanguageType,
  PostMainContentProps,
  StudyType,
  TeamType,
} from '../../../CommunityType';
import {
  LanguageDisplayNames,
  CourseDisplayNames,
  StudyDisplayNames,
  TeamDisplayNames,
} from '../DisplayNames';

const Post_MainContents: React.FC<PostMainContentProps> = ({ post, setPost }) => {
  const { boardType, boardId } = useParams();
  // const [boardType, setBoardType] = useState("CODING");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userDisLikeCnt, setUserDisLikeCnt] = useState<number | string>('');
  const [userLikeCnt, setUserLikeCnt] = useState<number | string>('');
  const [isExtra, setIsExtra] = useState<boolean>(false);
  const [isExtraOther, setIsExtraOther] = useState<boolean>(false);

  const userkeynumber = useAppSelector((state) => state.auth.keynumber);

  const accesstoken = useAppSelector((state) => state.auth.accesstoken);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const userAuth = useAppSelector((state) => state.auth.accesstoken);

  const handleModifyNavigate = (): void => {
    navigate(`/community/${boardType}/modify/${boardId}`, {
      state: {
        id: boardType,
        boardId: boardId,
        boardTitle: post.title,
        boardContent: post.content,
        languages: post.language,
        courses: post.course,
        studies: post.study,
        teams: post.team,
      },
    });
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleReportNavigate = (): void => {
    if (userAuth === '') {
      setDialogMessage('로그인이 필요한 서비스입니다.');
      setDialogOpen(true);
      return;
    }
    navigate(`/cs/report/${boardId}`, {
      state: {
        boardId: boardId,
        writerName: post.name,
        boardTitle: post.title,
        boardUrl: location.pathname,
      },
    });
  }; // URL 나중에 풀 url로 수정 필요

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const handleExtra = (): void => {
    setIsExtra(!isExtra);
  };

  const closeExtra = (): void => {
    setIsExtra(false);
    setIsExtraOther(false);
  };

  const extraRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isExtra && !isExtraOther) return;

    const handleClickOutside = (event: MouseEvent): void => {
      setTimeout(() => {
        if (extraRef.current && !extraRef.current.contains(event.target as Node)) {
          setIsExtra(false);
          setIsExtraOther(false);
        }
      }, 300);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExtra, isExtraOther]);

  const handleExtraOther = (): void => {
    setIsExtraOther(!isExtraOther);
  };

  const handleStatus = async (): Promise<void> => {
    let changeStatus: 'ACTIVE' | 'INACTIVE' | null = null;

    if (post.status === 'INACTIVE') {
      changeStatus = 'ACTIVE';
    } else if (post.status === 'ACTIVE') {
      changeStatus = 'INACTIVE';
    }
    try {
      const data: ModifyPostStatusRequest = {
        boardId: Number(boardId),
        status: String(changeStatus),
        boardType: boardType !== undefined ? boardType.toUpperCase() : '',
      };
      const response = await CommunityApi.modifyPostStatus(data);
      if (response) {
        setPost((prevPost) => ({
          ...prevPost,
          status: changeStatus as 'ACTIVE' | 'INACTIVE' | null,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (userkeynumber !== post.userKey) {
      setDialogMessage('삭제 권한이 없습니다.');
      setDialogOpen(true);
      return;
    }
    setDialogMessage('이 글을 정말로 삭제하시겠습니까?');
    setDialogOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    try {
      const response = await CommunityApi.deletePost({ id: Number(boardId) });
      if (response) {
        setDialogMessage('글이 삭제되었습니다.');
        setDialogOpen(true);
      }
    } catch (error) {
      console.error(error);
      setDialogMessage('글 삭제에 실패했습니다.');
      setDialogOpen(true);
    }
  };

  useEffect(() => {
    const reactionState = async (): Promise<void> => {
      try {
        const params: BoardReactionStatusRequest = {
          boardId: Number(boardId),
          userId: Number(userkeynumber),
        };
        const response = await CommunityApi.boardreactionstatus(params);

        if (response.data.reaction === 'LIKE') {
          setUserLikeCnt(1);
          setUserDisLikeCnt(0);
        } else if (response.data.reaction === 'DISLIKE') {
          setUserLikeCnt(0);
          setUserDisLikeCnt(1);
        } else {
          setUserLikeCnt(0);
          setUserDisLikeCnt(0);
        }
      } catch (error) {
        console.error(error);
        return;
      }
    };
    reactionState();
  }, [boardId, userkeynumber]);

  const onClickLike = async (e: React.MouseEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }
    if (!accesstoken) {
      setDialogMessage('로그인이 필요한 서비스입니다.');
      setDialogOpen(true);
    }

    setIsSubmitting(true);
    try {
      const params: BoardReactionRequest = {
        boardId: Number(boardId),
        userId: Number(userkeynumber),
        reaction: 'LIKE',
      };
      await CommunityApi.boardreaction(params);
      if (userLikeCnt === 0 && userDisLikeCnt === 0) {
        setPost(
          Number(post.boardId) === Number(boardId) ? { ...post, likeCnt: post.likeCnt + 1 } : post,
        );
        setUserLikeCnt(userLikeCnt + 1);
      }
      if (userLikeCnt === 1 && userDisLikeCnt === 0) {
        setPost(
          Number(post.boardId) === Number(boardId) ? { ...post, likeCnt: post.likeCnt - 1 } : post,
        );
        setUserLikeCnt(userLikeCnt - 1);
      }
      if (userLikeCnt === 0 && userDisLikeCnt === 1) {
        setPost(
          Number(post.boardId) === Number(boardId)
            ? {
                ...post,
                likeCnt: post.likeCnt + 1,
                dislikeCnt: post.dislikeCnt - 1,
              }
            : post,
        );
        setUserLikeCnt(userLikeCnt + 1);
        setUserDisLikeCnt(userDisLikeCnt - 1);
      }
    } catch (error) {
      console.error('좋아요 실패', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClickDisLike = async (e: React.MouseEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }
    if (!accesstoken) {
      setDialogMessage('로그인이 필요한 서비스입니다.');
      setDialogOpen(true);
      // return navigate('/login');
    }
    setIsSubmitting(true);
    try {
      const params: BoardReactionRequest = {
        boardId: Number(boardId),
        userId: Number(userkeynumber),
        reaction: 'DISLIKE',
      };
      await CommunityApi.boardreaction(params);
      if (userLikeCnt === 0 && userDisLikeCnt === 0) {
        setPost(
          Number(post.boardId) === Number(boardId)
            ? { ...post, dislikeCnt: post.dislikeCnt + 1 }
            : post,
        );
        setUserDisLikeCnt(userDisLikeCnt + 1);
      }
      if (userLikeCnt === 0 && userDisLikeCnt === 1) {
        setPost(
          Number(post.boardId) === Number(boardId)
            ? { ...post, dislikeCnt: post.dislikeCnt - 1 }
            : post,
        );
        setUserDisLikeCnt(userDisLikeCnt - 1);
      }
      if (userLikeCnt === 1 && userDisLikeCnt === 0) {
        setPost(
          Number(post.boardId) === Number(boardId)
            ? {
                ...post,
                dislikeCnt: post.dislikeCnt + 1,
                likeCnt: post.likeCnt - 1,
              }
            : post,
        );
        setUserDisLikeCnt(userDisLikeCnt + 1);
        setUserLikeCnt(userLikeCnt - 1);
      }
    } catch (error) {
      console.error('싫어요 실패', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // HTML 로딩 후 코드 하이라이트 적용
    const content = document.getElementById('mainpostcontentstext');

    if (content) {
      // 중첩된 <code> 태그를 제거하거나 수정 (단일 코드 블록만 남기기)
      const nestedCodes = content.querySelectorAll('pre code');

      nestedCodes.forEach((block) => {
        // 중첩된 코드 블록을 감지하여 처리
        const parentPre = block.closest('pre');
        if (parentPre && parentPre !== block.parentNode) {
          parentPre.innerHTML = parentPre.innerHTML.replace(/<code.*?>.*?<\/code>/g, (match) => {
            // innerHTML에서 잘못된 중첩된 <code> 태그를 제거하거나 수정
            return match.replace(/<pre.*?>/g, '').replace(/<\/pre>/g, '');
          });
        }
        hljs.highlightElement(block as HTMLElement); // 정상적으로 highlight 적용
      });
    }
  }, [post.content]); // post.content가 변경될 때마다 적용

  return (
    <>
      <MainPostContainer>
        <MainPostTop>
          <MainPostTopTextContainer>
            <MainPostTitleArea>
              <MainPostPending>
                {post.boardType === 'CODING' ? (
                  post.status === 'INACTIVE' ? (
                    <MainPostContentsSolved
                      style={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        textOverflow: 'clip',
                      }}
                    >
                      해결됨
                    </MainPostContentsSolved>
                  ) : (
                    <MainPostContentsPending
                      style={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        textOverflow: 'clip',
                      }}
                    >
                      미해결
                    </MainPostContentsPending>
                  )
                ) : post.boardType === 'STUDY' ? (
                  post.status === 'INACTIVE' ? (
                    <MainPostContentsSolved
                      style={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        textOverflow: 'clip',
                      }}
                    >
                      모집완료
                    </MainPostContentsSolved>
                  ) : (
                    <MainPostContentsPending
                      style={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        textOverflow: 'clip',
                      }}
                    >
                      모집중
                    </MainPostContentsPending>
                  )
                ) : (
                  post.boardType === 'TEAM' &&
                  (post.status === 'INACTIVE' ? (
                    <MainPostContentsSolved
                      style={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        textOverflow: 'clip',
                      }}
                    >
                      모집완료
                    </MainPostContentsSolved>
                  ) : (
                    <MainPostContentsPending
                      style={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        textOverflow: 'clip',
                      }}
                    >
                      모집중
                    </MainPostContentsPending>
                  ))
                )}
              </MainPostPending>
              <MainPostTitle>{post.title}</MainPostTitle>
            </MainPostTitleArea>
            <MainPostDiv>
              <MainPostInformation>
                <MainPostDate>
                  {new Date(post.createdAt)
                    .toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })
                    .replace(/\. /g, '.')}
                  &nbsp;작성
                </MainPostDate>
                {post.updatedAt ? (
                  <>
                    <MiddleDot />
                    <MainPostEditedText>
                      {new Date(post.updatedAt)
                        .toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })
                        .replace(/\. /g, '.')}
                      수정됨
                    </MainPostEditedText>
                  </>
                ) : null}
                <MiddleDot />
                <MainPostViewsBox>
                  <MainPostViewsImg theme={theme.palette.mode} />
                  <MainPostViewsText>{post.viewCnt} views</MainPostViewsText>
                </MainPostViewsBox>
                <MiddleDot />
                <MainPostRepliesBox>
                  <MainPostRepliesImg theme={theme.palette.mode} />
                  <MainPostRepliesText>{post.commentCnt} replies</MainPostRepliesText>
                </MainPostRepliesBox>
                <MiddleDot />
                <MainPostThumbsUpBox>
                  <MainPostThumbsUpImg theme={theme.palette.mode} />
                  <MainPostThumbsUpText>{post.likeCnt}</MainPostThumbsUpText>
                </MainPostThumbsUpBox>
                <MiddleDot />
                <MainPostThumbsDownBox>
                  <MainPostThumbsDownImg theme={theme.palette.mode} />
                  <MainPostThumbsDownText>{post.dislikeCnt}</MainPostThumbsDownText>
                </MainPostThumbsDownBox>
              </MainPostInformation>
            </MainPostDiv>
          </MainPostTopTextContainer>
          {Number(post.userKey) === Number(userkeynumber) ? (
            <MainPostExtra>
              <MainPostExtraItemContainer ref={extraRef} isOpen={isExtra} boardType={boardType}>
                {post.boardType === 'CODING' && post.status === 'ACTIVE' ? (
                  <MainPostExtraItem
                    onClick={() => {
                      handleStatus();
                      closeExtra();
                    }}
                    isOpen={isExtra}
                  >
                    해결됨으로 변경
                  </MainPostExtraItem>
                ) : post.boardType === 'CODING' && post.status === 'INACTIVE' ? (
                  <MainPostExtraItem
                    onClick={() => {
                      handleStatus();
                      closeExtra();
                    }}
                    isOpen={isExtra}
                  >
                    미해결로 변경
                  </MainPostExtraItem>
                ) : (post.boardType === 'STUDY' || post.boardType === 'TEAM') &&
                  post.status === 'ACTIVE' ? (
                  <MainPostExtraItem
                    onClick={() => {
                      handleStatus();
                      closeExtra();
                    }}
                    isOpen={isExtra}
                  >
                    모집완료로 변경
                  </MainPostExtraItem>
                ) : (
                  (post.boardType === 'STUDY' || post.boardType === 'TEAM') &&
                  post.status === 'INACTIVE' && (
                    <MainPostExtraItem
                      onClick={() => {
                        handleStatus();
                        closeExtra();
                      }}
                      isOpen={isExtra}
                    >
                      모집중으로 변경
                    </MainPostExtraItem>
                  )
                )}
                <MainPostExtraItem
                  boardType={boardType}
                  isOpen={isExtra}
                  onClick={() => {
                    handleModifyNavigate();
                    closeExtra();
                  }}
                >
                  글 수정
                </MainPostExtraItem>
                <MainPostExtraItem
                  boardType={boardType}
                  onClick={() => {
                    handleDelete();
                    closeExtra();
                  }}
                  isOpen={isExtra}
                >
                  글 삭제
                </MainPostExtraItem>
              </MainPostExtraItemContainer>
              <MainPostExtraButton
                theme={theme.palette.mode}
                onClick={handleExtra}
              ></MainPostExtraButton>
            </MainPostExtra>
          ) : Number(post.userKey) !== Number(userkeynumber) && userkeynumber !== '' ? (
            <MainPostExtra>
              <MainPostExtraItemOtherContainer ref={extraRef} isOpenOther={isExtraOther}>
                <MainPostExtraOtherItem
                  onClick={() => handleReportNavigate()}
                  isOpenOther={isExtraOther}
                >
                  게시글 신고
                </MainPostExtraOtherItem>
              </MainPostExtraItemOtherContainer>
              <MainPostExtraButton
                theme={theme.palette.mode}
                onClick={handleExtraOther}
              ></MainPostExtraButton>
            </MainPostExtra>
          ) : (
            userkeynumber === '' && (
              <MainPostExtra>
                <MainPostExtraItemOtherContainer ref={extraRef} isOpenOther={isExtraOther}>
                  <MainPostExtraOtherItem
                    onClick={() => handleReportNavigate()}
                    isOpenOther={isExtraOther}
                  >
                    게시글 신고
                  </MainPostExtraOtherItem>
                </MainPostExtraItemOtherContainer>
                <MainPostExtraButton
                  theme={theme.palette.mode}
                  onClick={handleExtraOther}
                ></MainPostExtraButton>
              </MainPostExtra>
            )
          )}
        </MainPostTop>
        <MainPostMiddle>
          <LeftEvBox>
            <LeftEvUp
              theme={theme.palette.mode}
              userLikeCnt={userLikeCnt}
              onClick={(e) => onClickLike(e)}
            />
            <LeftEvDown
              theme={theme.palette.mode}
              userDisLikeCnt={userDisLikeCnt}
              onClick={(e) => onClickDisLike(e)}
            />
          </LeftEvBox>
          <MainPostContentsBox>
            <MainPostContentsText
              style={{ maxWidth: '716px' }}
              className="main-post-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <MainPostTagsBox>
              {(Array.isArray(post.language) && post.language.length > 0) ||
              (Array.isArray(post.course) && post.course.length > 0) ||
              (Array.isArray(post.study) && post.study.length > 0) ||
              (Array.isArray(post.team) && post.team.length > 0) ? (
                <>
                  {Array.isArray(post.language) &&
                    post.language.length > 0 &&
                    post.language.map((lang, index) => (
                      <MainPostTag key={index}>
                        {LanguageDisplayNames[lang as LanguageType]}
                      </MainPostTag>
                    ))}
                  {Array.isArray(post.course) &&
                    post.course?.length > 0 &&
                    post.course.map((lang, index) => (
                      <MainPostTag key={index}>
                        {CourseDisplayNames[lang as CourseType]}
                      </MainPostTag>
                    ))}
                  {Array.isArray(post.study) &&
                    post.study?.length > 0 &&
                    post.study.map((lang, index) => (
                      <MainPostTag key={index}>{StudyDisplayNames[lang as StudyType]}</MainPostTag>
                    ))}
                  {Array.isArray(post.team) &&
                    post.team?.length > 0 &&
                    post.team.map((lang, index) => (
                      <MainPostTag key={index}>{TeamDisplayNames[lang as TeamType]}</MainPostTag>
                    ))}
                </>
              ) : (
                <MainPostNoTag>😓 등록된 태그가 없습니다.</MainPostNoTag>
              )}
            </MainPostTagsBox>
          </MainPostContentsBox>
        </MainPostMiddle>
      </MainPostContainer>
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
          {dialogMessage === '로그인이 필요한 서비스입니다.' ? (
            <>
              <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleDialogClose}>
                취소
              </Button>
              <Button
                sx={{ fontFamily: 'bold' }}
                color="secondary"
                onClick={() => dispatch(openLoginModal())}
              >
                로그인
              </Button>
            </>
          ) : dialogMessage === '이 글을 정말로 삭제하시겠습니까?' ? (
            <>
              <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleDialogClose}>
                취소
              </Button>
              <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={confirmDelete}>
                확인
              </Button>
            </>
          ) : dialogMessage === '글이 삭제되었습니다.' ? (
            <Button
              sx={{ fontFamily: 'bold' }}
              color="secondary"
              onClick={() => {
                navigate(`/community/${boardType}`, {
                  state: {
                    id: boardType,
                  },
                });
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

export default Post_MainContents;
