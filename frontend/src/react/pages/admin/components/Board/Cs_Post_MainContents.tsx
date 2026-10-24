import { useEffect, useRef, useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { Dialog, DialogActions, DialogContent, Button, useTheme } from '@mui/material';

import type { CSPostMainContentProps } from './AdminPageBoardType';

import { ReportDisplayNames } from './Cs_DisplayNames';
import CommunityApi from '../../../../../api/AxiosApi/CommunityApi/CommunityApi';
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

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
  };

  const handleDelete = async (): Promise<void> => {
    try {
      const response = await CommunityApi.deletePost({ id: Number(boardId) });
      if (response) {
        setDialogMessage('글이 삭제되었습니다.');
        setOpenDialog(true);
      }
    } catch (error) {
      if (error) {
        setDialogMessage('다시 시도해주세요.');
        setOpenDialog(true);
      }
    }
  };

  if (!postData)
    return (
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
        데이터 없음
      </div>
    );

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
        </MainPostTop>
        <MainPostMiddle>
          <MainPostContentsBox>
            <MainPostContentsText
              className="main-post-content"
              dangerouslySetInnerHTML={{ __html: postData.content }}
            />
            <MainPostTagsBox>
              {'reportId' in postData && postData.report && postData.report.length > 0 ? (
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
        open={openDialog}
        onClose={handleCloseDialog}
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
                navigate(`/admin/${boardType}`, {
                  state: {
                    id: boardType,
                  },
                });
              }}
            >
              확인
            </Button>
          ) : (
            <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleCloseDialog}>
              닫기
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Cs_Post_MainContents;
