import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  useTheme,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';

import MentorApi from '../../../../../api/AxiosApi/mentorApi/MentorApi';
import { closeModal } from '../../../../../redux/mentorSlice/MentorModalSlice';
import {
  MentorModalBottomBox,
  MentorModalBottomText,
  MentorModalContentsContainer,
  MentorModalDetailBox,
  MentorModalDetailContents,
  MentorModalDetailTitle,
  MentorModalExtraMenu,
  MentorModalExtraMenuDropButton,
  MentorModalExtraMenuDropdown,
  MentorModalMiddleHR,
  MentorModalProfileBottom,
  MentorModalProfileBottomEach,
  MentorModalProfileBottomEachLeft,
  MentorModalProfileBottomEachRight,
  MentorModalProfileBox,
  MentorModalProfileExpCnt,
  MentorModalProfileImg,
  MentorModalProfileNickname,
  MentorModalProfileTop,
  MentorModalProfileTopLeft,
  MentorModalProfileTopRight,
} from '../../../../styles/community/Community_Mentor_Modal';
import { ModalDetailProps } from '../../Communitu_Mentor_Interface';

// Redux 상태 타입 정의
interface AuthState {
  keynumber: number | null; // userKey 타입
}

interface RootState {
  auth: AuthState;
}

const Modal_Detail: React.FC<ModalDetailProps> = ({
  mentorDelete,
  mentorModalData,
  modalType,
  onApplyClick,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuBarModalOpen, setMenuBarModalOpen] = useState<boolean>(false);
  const userKey = useSelector((state: RootState) => state.auth.keynumber);

  // 메뉴바 선택
  const menuBarClick = (): void => {
    setMenuBarModalOpen((prev) => !prev);
  };

  // 수정 페이지로 이동
  const modifyMentor = (): void => {
    navigate('/community/mentor/write', { state: { mentorData: mentorModalData } });
    dispatch(closeModal()); // 모달 닫기
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const handleDeleteClick = () => {
    setConfirmOpen(true); // 삭제 확인 다이얼로그 열기
  };

  const handleClose = () => {
    setConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false); // 확인 다이얼로그 닫기
    try {
      await MentorApi.deleteMentor(mentorModalData.mentorId);
      setResultMessage('멘토 글이 삭제되었습니다.');
      mentorDelete(mentorModalData.mentorId); // 부모 컴포넌트에 알림
    } catch (error) {
      console.error('멘토글 삭제 중 오류 발생:', error);
      setResultMessage('멘토글 삭제에 실패했습니다.');
    } finally {
      setResultOpen(true); // 결과 다이얼로그 열기
    }
  };

  const theme = useTheme();

  return (
    <>
      <MentorModalContentsContainer>
        <MentorModalProfileBox>
          <MentorModalProfileTop>
            <MentorModalProfileTopLeft>
              <MentorModalProfileImg
                src={mentorModalData.profileUrl || '/images/general/default_profile.png'}
              />
            </MentorModalProfileTopLeft>
            <MentorModalProfileTopRight>
              <MentorModalProfileNickname>
                {mentorModalData.userNickname}
              </MentorModalProfileNickname>
              <MentorModalProfileExpCnt>
                {mentorModalData.menteeCount}명의 멘토로 활동중
              </MentorModalProfileExpCnt>
            </MentorModalProfileTopRight>

            {/* 메뉴바 모달 조건부 렌더링 */}
            {mentorModalData.mentorUserKey === userKey && (
              <MentorModalExtraMenu theme={theme} onClick={menuBarClick} />
            )}
          </MentorModalProfileTop>
          <MentorModalProfileBottom>
            <MentorModalProfileBottomEach>
              <MentorModalProfileBottomEachLeft>직무</MentorModalProfileBottomEachLeft>
              <MentorModalProfileBottomEachRight>
                {mentorModalData.position}
              </MentorModalProfileBottomEachRight>
            </MentorModalProfileBottomEach>
            <MentorModalProfileBottomEach>
              <MentorModalProfileBottomEachLeft>경력</MentorModalProfileBottomEachLeft>
              <MentorModalProfileBottomEachRight>
                {mentorModalData.career}
              </MentorModalProfileBottomEachRight>
            </MentorModalProfileBottomEach>
            <MentorModalProfileBottomEach>
              <MentorModalProfileBottomEachLeft>현직</MentorModalProfileBottomEachLeft>
              <MentorModalProfileBottomEachRight>
                {mentorModalData.currentJob}
              </MentorModalProfileBottomEachRight>
            </MentorModalProfileBottomEach>
          </MentorModalProfileBottom>
        </MentorModalProfileBox>
        <MentorModalMiddleHR />

        <MentorModalDetailBox>
          <MentorModalDetailTitle>{mentorModalData.title}</MentorModalDetailTitle>
          <MentorModalDetailContents
            dangerouslySetInnerHTML={{ __html: mentorModalData.content }}
          />
        </MentorModalDetailBox>
      </MentorModalContentsContainer>
      <MentorModalBottomBox>
        <MentorModalBottomText>
          1회 멘토링 : {mentorModalData.hour}시간 / {mentorModalData.price}원
        </MentorModalBottomText>
        {mentorModalData.mentorUserKey !== userKey && (
          <Button
            variant="contained"
            color="secondary"
            sx={{
              fontFamily: 'bold, sans-serif',
              fontSize: '12px',
              color: 'white',
            }}
            onClick={onApplyClick}
          >
            신청하기
          </Button>
        )}
      </MentorModalBottomBox>

      {/* 메뉴바 모달 조건부 렌더링 */}
      {menuBarModalOpen ? (
        <MentorModalExtraMenuDropdown>
          <MentorModalExtraMenuDropButton onClick={modifyMentor}>
            수정
          </MentorModalExtraMenuDropButton>
          <MentorModalExtraMenuDropButton onClick={handleDeleteClick}>
            삭제
          </MentorModalExtraMenuDropButton>
        </MentorModalExtraMenuDropdown>
      ) : null}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={confirmOpen}
        onClose={handleClose}
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
          정말 이 멘토 글을 삭제하시겠습니까?
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'right' }}>
          <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleConfirmDelete}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 결과 다이얼로그 */}
      <Dialog
        open={resultOpen}
        onClose={() => setResultOpen(false)}
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
          {resultMessage}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'right' }}>
          <Button
            sx={{ fontFamily: 'bold' }}
            color="secondary"
            onClick={() => setResultOpen(false)}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Modal_Detail;
