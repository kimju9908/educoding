import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { EditorContent, Editor } from '@tiptap/react';
import { ClipLoader } from 'react-spinners';

import ModalToolBar from './Modal_Apply_ToolBar';
import MTModal_STY, {
  MentorModal,
  MentorModalHeader,
} from '../../../../styles/community/Community_Mentor_Modal';

// ApplyModal props 타입 정의
interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null; // Editor는 null일 수 있음 (Tiptap 초기화 전)
  onSubmit: () => void;
  isLoading: boolean;
}

const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  editor,
  onSubmit,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* 신청 모달 */}
      <MentorModal>
        <MentorModalHeader>
          <MTModal_STY.ModalIntroduce>멘티 정보 작성</MTModal_STY.ModalIntroduce>
          <CloseIcon style={{ color: 'white', cursor: 'pointer' }} onClick={onClose} />
        </MentorModalHeader>
        <MTModal_STY.ApplyMenteeInfoContainer>
          <ModalToolBar editor={editor} />
          <EditorContent style={{ padding: '15px' }} editor={editor} />
        </MTModal_STY.ApplyMenteeInfoContainer>
        <MTModal_STY.ApplyMenteeInfoBottomBox>
          <Button
            variant="contained"
            color="secondary"
            sx={{
              fontFamily: 'bold, sans-serif',
              fontSize: '12px',
              color: 'white',
            }}
            onClick={onSubmit}
            disabled={isLoading}
          >
            신청하기
          </Button>
        </MTModal_STY.ApplyMenteeInfoBottomBox>
      </MentorModal>
      {/* 신청 로딩 오버레이 */}
      {isLoading ? (
        <MTModal_STY.LoadingOverlay>
          <ClipLoader size={50} color={'#fff'} loading={isLoading} />
        </MTModal_STY.LoadingOverlay>
      ) : null}
    </>
  );
};

export default ApplyModal;
