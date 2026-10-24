import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import Code from '@tiptap/extension-code';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { all, createLowlight } from 'lowlight';
import { useSelector, useDispatch } from 'react-redux';

import ApplyModal from './Modal_Apply';
import Modal_Detail from './Modal_Detail';
import Modal_Review from './Modal_Review';
import MentorApi from '../../../../../api/AxiosApi/mentorApi/MentorApi';
import { closeModal } from '../../../../../redux/mentorSlice/MentorModalSlice';
import { openLoginModal } from '../../../../../redux/slice/LoginModalSlice';
import {
  Backdrop,
  MentorModal,
  MentorModalHeader,
  MentorModalHeaderIconBox,
  MentorModalHeaderTitle,
} from '../../../../styles/community/Community_Mentor_Modal';
import {
  MentorDetailResponse,
  MentorModalData,
  MentorModalProps,
} from '../../Communitu_Mentor_Interface';

const lowlight = createLowlight(all);

CodeBlockLowlight.configure({
  lowlight,
});

const initialContent = `
    <p> 1.멘토에게 연락 받으실 연락처 입력:</p> 
    <p> 2.멘토에게 전달 하고 싶은 내용:</p>
  `;

interface AuthState {
  accesstoken: string | null;
  keynumber: number | null;
}

interface RootState {
  auth: AuthState;
}

const Mentor_Modal: React.FC<MentorModalProps> = ({ mentorId, modalType, mentorDelete }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [mentorModalData, setMentorModalData] = useState<MentorModalData | null>(null);
  const [applyMenteeInfoModal, setApplyMenteeInfoModal] = useState<boolean>(false);
  const [isApplyLoading, setIsApplyLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const userAuth = useSelector((state: RootState) => state.auth.accesstoken);
  const menteeKey = useSelector((state: RootState) => state.auth.keynumber);

  const modalEditor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: false,
      }),
      TextStyle,
      Color.configure({ types: [TextStyle.name] }),
      Underline,
      Code,
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({
        placeholder: '',
      }),
    ],
    content: initialContent,
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!mentorId) return;
      try {
        if (modalType === 'detail') {
          const response = (await MentorApi.getModalDetail(mentorId)) as MentorDetailResponse;
          setMentorModalData(response.data);
        }
      } catch (error: unknown) {
        setError(error instanceof Error ? error : new Error('알 수 없는 오류 발생'));
      }
    };
    fetchData();
  }, [mentorId, modalType]);

  if (!mentorId) return <div>잘못된 요청입니다.</div>;
  if (error) return <div>에러 발생: {error.message}</div>;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const ApplyMenteeInfoModalClick = (): void => {
    if (!userAuth) {
      setDialogMessage('로그인이 필요한 서비스입니다.');
      setDialogOpen(true);
      return;
    }
    setApplyMenteeInfoModal(true);
  };

  const ApplySubmitClick = async (): Promise<void> => {
    if (!modalEditor) return;
    const applyMenteeText = modalEditor.getHTML();
    if (!userAuth) {
      setDialogMessage('로그인이 필요한 서비스입니다.');
      setDialogOpen(true);
      return;
    }
    try {
      setIsApplyLoading(true);
      await MentorApi.ApplyForMentor(mentorId, menteeKey, applyMenteeText);
      setApplyMenteeInfoModal(false);
      modalEditor.commands.setContent(initialContent);
      setDialogMessage('신청이 완료되었습니다.');
      setDialogOpen(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error : new Error('알 수 없는 오류 발생'));
    } finally {
      setIsApplyLoading(false);
    }
  };

  const handleShareClick = (): void => {
    const link = window.location.href;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setDialogMessage('링크가 복사되었습니다!');
        setDialogOpen(true);
      })
      .catch((error) => console.error('링크 복사에 실패했습니다:', error));
  };

  const handleCloseModal = (): void => {
    navigate('?');
    dispatch(closeModal());
  };

  const CloseApplyMenteeInfoModal = (): void => {
    setApplyMenteeInfoModal(false);
  };

  useEffect(() => {
    if (applyMenteeInfoModal && modalEditor) {
      modalEditor.commands.focus();
    }
  }, [applyMenteeInfoModal, modalEditor]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !applyMenteeInfoModal) {
        handleCloseModal();
        event.stopPropagation();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return (): void => document.removeEventListener('keydown', handleKeyDown);
  }, [applyMenteeInfoModal]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && applyMenteeInfoModal) {
        CloseApplyMenteeInfoModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return (): void => document.removeEventListener('keydown', handleKeyDown);
  }, [applyMenteeInfoModal]);

  return (
    <>
      <Backdrop>
        <MentorModal>
          <MentorModalHeader>
            <MentorModalHeaderTitle>
              {modalType === 'rating' ? '리뷰 작성글' : '멘토링 소개'}
            </MentorModalHeaderTitle>
            <MentorModalHeaderIconBox>
              <ShareIcon
                style={{ color: 'white', cursor: 'pointer', width: '18px' }}
                onClick={handleShareClick}
              />
              <CloseIcon style={{ color: 'white', cursor: 'pointer' }} onClick={handleCloseModal} />
            </MentorModalHeaderIconBox>
          </MentorModalHeader>
          {/* 모달 타입에 따른 렌더링 분리 */}
          {modalType === 'detail' && mentorModalData ? (
            <Modal_Detail
              mentorModalData={mentorModalData}
              modalType={modalType}
              onApplyClick={ApplyMenteeInfoModalClick}
              mentorDelete={mentorDelete}
            />
          ) : modalType === 'detail' && !mentorModalData ? (
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
              데이터가 없습니다.
            </div>
          ) : null}
          {modalType === 'rating' && <Modal_Review mentorId={mentorId} />}
        </MentorModal>
        <ApplyModal
          isOpen={applyMenteeInfoModal}
          onClose={CloseApplyMenteeInfoModal}
          editor={modalEditor}
          onSubmit={ApplySubmitClick}
          isLoading={isApplyLoading}
        />
      </Backdrop>
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

export default Mentor_Modal;
