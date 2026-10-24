import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useSelector } from 'react-redux';

import MentorApi from '../../../../../../api/AxiosApi/mentorApi/MentorApi';
import {
  PostBottomDot,
  PostEach,
  PostListContainer,
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

const Board_MenteeList_MyPage: React.FC<BoardMentorListMyPageProps> = ({
  page,
  size,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const [menteeData, setMenteeData] = useState<MentoringListItem[]>([]);
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
        const response = (await MentorApi.menteeCheck(userKey, page, size)) as MentorApiResponse;
        console.log(response.data);
        setMenteeData(response.data.mentoringListItemBox || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        setDialogMessage(
          error instanceof Error ? error.message : '멘티 데이터를 불러오는 데 실패했습니다.',
        );
        setDialogOpen(true);
      }
    };

    fetchData();
  }, [page, size, userKey]);

  const menteeReviewModalChange = (
    mentorId: number,
    hasReview: boolean,
    menteeNickname: string,
  ): void => {
    if (hasReview) {
      navigate(`/community/mentor?mentor_id=${mentorId.toString()}&modalType=rating`);
    } else {
      setDialogMessage(`멘티 ${menteeNickname}님의 리뷰가 아직 없습니다.`);
      setDialogOpen(true);
    }
  };

  return (
    <>
      <PostListContainer>
        {menteeData.length > 0 ? (
          menteeData.map((mentee) => (
            <PostEach
              style={{ cursor: 'pointer', padding: '10px' }}
              key={mentee.mentoringId}
              onClick={() => {
                menteeReviewModalChange(
                  mentee.mentorId,
                  mentee.hasReview,
                  mentee.mentoringNickname,
                );
              }}
            >
              <PostTop>
                <PostTopUser>
                  <PostTopUserImg
                    style={{
                      backgroundImage: `url(${mentee.mentoringProfileUrl ?? '/images/general/default_profile.png'})`,
                    }}
                  />
                  <PostTopUserId>{mentee.mentoringNickname}</PostTopUserId>
                  <PostBottomDot />
                  <PostTopUserId>{mentee.mentoringEmail}</PostTopUserId>
                </PostTopUser>
              </PostTop>
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
            멘티가 없습니다.
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

export default Board_MenteeList_MyPage;
