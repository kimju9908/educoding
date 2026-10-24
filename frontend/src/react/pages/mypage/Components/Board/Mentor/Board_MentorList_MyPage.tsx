import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useSelector } from 'react-redux';

import MentorApi from '../../../../../../api/AxiosApi/mentorApi/MentorApi';
import {
  PostBottomDot,
  PostEach,
  PostListContainer,
  PostMiddle,
  PostMiddleContentsText,
  PostMiddleContentsTitle,
  PostMiddleContentsUpper,
  PostTop,
  PostTopUser,
  PostTopUserId,
  PostTopUserImg,
} from '../../../../../styles/community/Community_Board';
import Board_Pagination from '../../../../community/components/common/board/Board_Pagination';
import {
  BoardMentorListMyPageProps,
  MentorApiResponse,
  MentoringListItem,
} from '../../../MyPageType';

// Redux 상태 타입 (auth 슬라이스의 구조에 따라 조정 필요)
interface RootState {
  auth: {
    keynumber: number;
  };
}

const Board_MentorList_MyPage: React.FC<BoardMentorListMyPageProps> = ({
  page,
  size,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const [mentorData, setMentorData] = useState<MentoringListItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  const userKey = useSelector((state: RootState) => state.auth.keynumber);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = (await MentorApi.mentorCheck(userKey, page, size)) as MentorApiResponse;
        setMentorData(response.data.mentoringListItemBox || []);
        // console.log('mentordata', response.data);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        setDialogMessage(
          error instanceof Error ? error.message : '멘토 데이터를 불러오는 데 실패했습니다.',
        );
        setDialogOpen(true);
      }
    };

    fetchData();
  }, [page, size, userKey]);

  const mentorModalDetailMove = (mentoringId: number): void => {
    navigate(`/community/mentor?mentor_id=${mentoringId.toString()}&modalType=detail`);
  };

  return (
    <>
      <PostListContainer>
        {mentorData.length > 0 ? (
          mentorData.map((mentor) => (
            <PostEach
              style={{ cursor: 'pointer' }}
              key={mentor.mentoringId}
              onClick={() => mentorModalDetailMove(mentor.mentoringId)}
            >
              <PostTop style={{ paddingBottom: '0' }}>
                <PostTopUser>
                  <PostTopUserImg
                    style={{
                      backgroundImage: `url(${mentor.mentoringProfileUrl ?? '/images/general/default_profile.png'})`,
                    }}
                  />
                  <PostTopUserId>
                    {mentor.mentoringNickname} ({mentor.mentoringEmail})
                  </PostTopUserId>
                </PostTopUser>
              </PostTop>
              <PostTop style={{ paddingTop: '0', marginBottom: '5px' }}>
                <PostTopUser>
                  <PostTopUserId>{mentor.mentoringPosition}</PostTopUserId>
                  <PostBottomDot />
                  <PostTopUserId>{mentor.mentoringCareer}</PostTopUserId>
                  <PostBottomDot />
                  <PostTopUserId>
                    {mentor.mentoringHour}시간 / {mentor.mentoringPrice}원
                  </PostTopUserId>
                  <PostTopUserId>{mentor.mentoringPrice}원</PostTopUserId>
                  <PostBottomDot />
                  <PostTopUserId>평점 {mentor.mentoringRating.toFixed(1)}</PostTopUserId>
                </PostTopUser>
              </PostTop>
              <PostMiddle>
                <PostMiddleContentsUpper>
                  <PostMiddleContentsTitle>{mentor.mentoringTitle}</PostMiddleContentsTitle>
                </PostMiddleContentsUpper>
                <PostMiddleContentsText
                  dangerouslySetInnerHTML={{ __html: mentor.mentoringContent }}
                />
              </PostMiddle>
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
            멘토가 없습니다.
          </div>
        )}
      </PostListContainer>
      <Board_Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
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
          <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleDialogClose}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Board_MentorList_MyPage;
