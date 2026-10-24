import { useState, useEffect, useRef, JSX } from 'react';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import Rating from '@mui/material/Rating';
import { AxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';

import MentorApi from '../../../../../api/AxiosApi/mentorApi/MentorApi';
import { openLoginModal } from '../../../../../redux/slice/LoginModalSlice';
import MTModal_STY, {
  MentorModalContentsContainer,
} from '../../../../styles/community/Community_Mentor_Modal';
import { ModalReviewProps, ReviewData } from '../../Communitu_Mentor_Interface';

interface AuthState {
  accesstoken: string | null;
  keynumber: number;
}

interface RootState {
  auth: AuthState;
}

const Modal_Review = ({ mentorId }: ModalReviewProps): JSX.Element => {
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [reviewModalData, setReviewModalData] = useState<ReviewData[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [showRating, setShowRating] = useState<boolean>(false);
  const [lineCount, setLineCount] = useState<number>(1);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [menuBarModalOpen, setMenuBarModalOpen] = useState<boolean>(false);

  const userAuth = useSelector((state: RootState) => state.auth.accesstoken);
  const menteeKey = useSelector((state: RootState) => state.auth.keynumber);

  useEffect(() => {
    const fetchAllReviews = async (): Promise<void> => {
      try {
        const response = await MentorApi.getModalReview(mentorId);
        setReviewModalData(response.data || []);
      } catch (error) {
        console.error('리뷰 데이터를 가져오는 중 오류 발생:', error);
      }
    };
    fetchAllReviews();
  }, [mentorId]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const reviewInputFocus = async (): Promise<void> => {
    if (!userAuth) {
      setDialogMessage('로그인이 필요한 서비스입니다.');
      setDialogOpen(true);
      inputRef.current?.blur();
      return;
    }

    try {
      const response = await MentorApi.getMenteeCheck(mentorId, menteeKey);
      const result = response.data;
      if (!result) {
        setDialogMessage('해당 멘토의 멘티가 아닙니다.');
        setDialogOpen(true);
        inputRef.current?.blur();
        return;
      }
      setShowRating(true);
      inputRef.current?.focus();
    } catch (error) {
      console.error('멘티 여부 확인 중 오류 발생:', error);
      setDialogMessage('멘티 여부를 확인하는 중 오류가 발생했습니다.');
      setDialogOpen(true);
    }
  };

  const reviewSubmit = async (): Promise<void> => {
    try {
      const reviewText = inputRef.current?.value || '';
      const reviewData = {
        mentorId,
        menteeKey,
        rating: rating ?? 0,
        reviewText,
      };
      const response = await MentorApi.submitReview(reviewData);
      if (response.data === true) {
        setDialogMessage('리뷰가 등록되었습니다.');
        setDialogOpen(true);
        setRating(null);
        setShowRating(false);
        if (inputRef.current) inputRef.current.value = '';
        const refreshResponse = await MentorApi.getModalReview(mentorId);
        setReviewModalData(refreshResponse.data || []);
      } else {
        setDialogMessage('리뷰 등록 중 알 수 없는 문제가 발생했습니다.');
        setDialogOpen(true);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('리뷰 제출 중 오류 발생:', axiosError);
      setDialogMessage(axiosError.response?.data?.message || '리뷰 작성에 실패했습니다.');
      setDialogOpen(true);
    }
  };

  const deleteReview = async (): Promise<void> => {
    if (!selectedReviewId) {
      setDialogMessage('삭제할 리뷰가 선택되지 않았습니다.');
      setDialogOpen(true);
      return;
    }

    const updatedReviewData = {
      rating: 0,
      reviewText: null,
    };

    try {
      await MentorApi.deleteReview(selectedReviewId, updatedReviewData);
      setDialogMessage('리뷰가 삭제되었습니다.');
      setDialogOpen(true);
      const response = await MentorApi.getModalReview(mentorId);
      setReviewModalData(response.data || []);
      setMenuBarModalOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('리뷰 삭제 중 오류 발생:', axiosError);
      setDialogMessage('리뷰 삭제에 실패했습니다.');
      setDialogOpen(true);
    }
  };

  const menuBarClick = (reviewId: number): void => {
    setSelectedReviewId(reviewId);
    setMenuBarModalOpen((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = inputRef.current;
      if (textarea) {
        const currentLines = textarea.value.split('\n').length;
        if (currentLines < 3) {
          setLineCount((prev) => Math.min(prev + 1, 3));
          textarea.value += '\n';
        }
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const textarea = e.target;
    const lines = textarea.value.split('\n');
    if (lines.length > 3) {
      textarea.value = lines.slice(0, 3).join('\n');
    }
    setLineCount(Math.min(lines.length, 3));
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  return (
    <>
      <MentorModalContentsContainer>
        <MTModal_STY.ReviewDataContainer>
          <MTModal_STY.ReviewDataBox>
            {reviewModalData.length > 0 ? (
              reviewModalData.map((review, index) => (
                <MTModal_STY.DataBox key={index}>
                  <MTModal_STY.ReviewTopInBox>
                    <MTModal_STY.MenteeProfileUrl
                      src={review.profileUrl || '/images/general/default_profile.png'}
                      onError={(e) => (e.currentTarget.src = '/images/general/default_profile.png')}
                    />
                    <MTModal_STY.MenteeNickname>{review.nickname}</MTModal_STY.MenteeNickname>
                    <MTModal_STY.TopRightInBox>
                      <MTModal_STY.createdAt>{formatDate(review.createdAt)}</MTModal_STY.createdAt>
                      {review.menteeKey === menteeKey && (
                        <MTModal_STY.ReviewMenuBar onClick={() => menuBarClick(review.reviewId)} />
                      )}
                    </MTModal_STY.TopRightInBox>
                  </MTModal_STY.ReviewTopInBox>
                  <MTModal_STY.MiddleInBox>
                    <Rating
                      name={`review-rating-${index}`}
                      value={review.rating}
                      readOnly
                      sx={{ '& .MuiRating-iconEmpty': { display: 'none' } }}
                    />
                  </MTModal_STY.MiddleInBox>
                  <MTModal_STY.ReviewText>{review.reviewText}</MTModal_STY.ReviewText>
                </MTModal_STY.DataBox>
              ))
            ) : (
              <MTModal_STY.NoData>리뷰가 없습니다.</MTModal_STY.NoData>
            )}
          </MTModal_STY.ReviewDataBox>
        </MTModal_STY.ReviewDataContainer>
        <MTModal_STY.ReviewInputcontainer>
          {showRating ? (
            <MTModal_STY.RatingContainer lineCount={lineCount}>
              <Rating
                name="mentor-rating"
                value={rating}
                onChange={(event, newValue) => setRating(newValue ?? 0)}
                sx={{ fontSize: '24px', color: '#FFD700' }}
              />
            </MTModal_STY.RatingContainer>
          ) : null}
          <MTModal_STY.ReviewInput
            ref={inputRef}
            onFocus={reviewInputFocus}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            rows={lineCount}
            maxLength={100}
            lineCount={lineCount}
            placeholder="3줄까지 작성 가능합니다."
          />
          <MTModal_STY.ReviewSubmitButton onClick={reviewSubmit} lineCount={lineCount}>
            등록
          </MTModal_STY.ReviewSubmitButton>
        </MTModal_STY.ReviewInputcontainer>
        {menuBarModalOpen ? (
          <MTModal_STY.ReviewMenuBarModal>
            <MTModal_STY.ReviewMenuBarModalButton onClick={deleteReview}>
              삭제
            </MTModal_STY.ReviewMenuBarModalButton>
          </MTModal_STY.ReviewMenuBarModal>
        ) : null}
      </MentorModalContentsContainer>
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

export default Modal_Review;
