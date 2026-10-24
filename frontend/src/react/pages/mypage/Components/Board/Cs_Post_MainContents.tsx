import { useEffect, useRef, useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { useTheme, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import type { CSPostMainContentProps } from './MyPageBoardType';

import { ReportDisplayNames } from './Cs_DisplayNames';
import MyPageApi from '../../../../../api/AxiosApi/MyPageApi/MyPageApi';
import { DelMyReportRequest } from '../../../../../api/AxiosApi/MyPageApi/MyPageApiTypes';
import { CheckResponse } from '../../../../../types/CommonTypes';
import {
  MainPostContainer,
  MainPostTop,
  MainPostTitle,
  MainPostInformation,
  MainPostDate,
  MainPostContentsPending,
  MainPostContentsSolved,
  MainPostMiddle,
  MainPostContentsBox,
  MainPostContentsText,
  MainPostTagsBox,
  MainPostTag,
  MainPostDiv,
  MainPostTitleArea,
  MainPostPending,
  MainPostTopTextContainer,
  MainPostNoTag,
} from '../../../../styles/community/Community_Post';
import {
  MainPostExtra,
  MainPostExtraItemContainer,
  MainPostExtraButton,
  MainPostExtraItem,
} from '../../../../styles/mypage/MyPage_CSPost';

const Cs_Post_MainContents: React.FC<CSPostMainContentProps> = ({ postData }) => {
  const { boardType, boardId } = useParams();
  // const [boardType, setBoardType] = useState("CODING");
  const [isExtra, setIsExtra] = useState<boolean>(false);
  const [isExtraOther, setIsExtraOther] = useState<boolean>(false);

  const navigate = useNavigate();
  const theme = useTheme();

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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const useDeleteMyPost = (): UseMutationResult<
    AxiosResponse<CheckResponse>,
    Error,
    DelMyReportRequest
  > => {
    return useMutation({
      mutationFn: async (pathVariable: DelMyReportRequest) => {
        if (boardType === 'report') return await MyPageApi.deleteMyReportPost(pathVariable);
        throw new Error('Invalid board type');
      },
      onSuccess: () => {
        closeExtra();
        setDialogMessage('글이 삭제되었습니다.');
        setDialogOpen(true);
      },
      onError: () => {
        closeExtra();
        setDialogMessage('글 삭제에 실패했습니다. 다시 시도해주세요.');
        setDialogOpen(true);
      },
    });
  };

  const mutation = useDeleteMyPost();

  const handleDelete = (): void => {
    mutation.mutate(Number(boardId));
  };

  if (!postData) return <p>데이터 없음</p>;

  return (
    <>
      <MainPostContainer>
        <MainPostTop>
          <MainPostTopTextContainer>
            <MainPostTitleArea>
              <MainPostPending>
                {postData.status === 'INACTIVE' ? (
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
                )}
              </MainPostPending>
              <MainPostTitle>{postData.title}</MainPostTitle>
            </MainPostTitleArea>
            <MainPostDiv>
              <MainPostInformation>
                <MainPostDate>
                  {new Date(postData.createdAt)
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
              </MainPostInformation>
            </MainPostDiv>
          </MainPostTopTextContainer>
          <MainPostExtra>
            <MainPostExtraItemContainer ref={extraRef} isOpen={isExtra} boardType={boardType}>
              <MainPostExtraItem
                boardType={boardType}
                onClick={() => {
                  handleDelete();
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
        </MainPostTop>
        <MainPostMiddle>
          <MainPostContentsBox style={{ borderLeft: '0' }}>
            <MainPostContentsText
              className="main-post-content"
              dangerouslySetInnerHTML={{ __html: postData.content }}
            />
            <MainPostTagsBox>
              {'reportId' in postData && postData.report !== null && postData.report.length > 0 ? (
                postData.report.map((lang, index) => (
                  <MainPostTag key={index}>{ReportDisplayNames[lang]}</MainPostTag>
                ))
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
          {dialogMessage === '글이 삭제되었습니다.' ? (
            <Button
              sx={{ fontFamily: 'bold' }}
              color="secondary"
              onClick={() => {
                navigate(`/mypage/${boardType}`);
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

export default Cs_Post_MainContents;
