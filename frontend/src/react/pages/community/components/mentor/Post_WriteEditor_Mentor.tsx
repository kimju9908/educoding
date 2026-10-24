import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

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
import { Color } from '@tiptap/extension-color';
import { Image } from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { all, createLowlight } from 'lowlight';
import { useSelector, useDispatch } from 'react-redux';

import PreviewModal from './Modal_Post_WriteEditor_Preview';
import MentorMentoringInfoText from './Post_WriteEditor_PlaceholderEX';
import MentorApi from '../../../../../api/AxiosApi/mentorApi/MentorApi';
import { openModal } from '../../../../../redux/mentorSlice/MentorModalSlice';
import { openLoginModal } from '../../../../../redux/slice/LoginModalSlice';
import ToolBar from '../../../../../util/ToolBar';
import {
  TipTapBox,
  MentorEditorArea,
  PreviewButton,
  WriteButtonsArea,
  WriteCancelButton,
  WriteSubmitButton,
  StyledEditorContent,
} from '../../../../styles/community/Community_Write';
import {
  MentorModalState,
  MentorPostData,
  PostWriteEditorMentorProps,
  PreviewData,
  PreviewResponse,
} from '../../Communitu_Mentor_Interface';

interface AuthState {
  accesstoken: string | null;
  keynumber: number | null;
}

interface RootState {
  auth: AuthState;
  mentorModal: MentorModalState;
}

// lowlight 설정
const lowlight = createLowlight(all);

CodeBlockLowlight.configure({
  lowlight,
});

const Post_WriteEditor_Mentor: React.FC<PostWriteEditorMentorProps> = ({
  formData,
  mentorData,
  isModifyMode,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const { title, tag, position, career, currentJob, hour, price } = formData;
  const userAuth = useSelector((state: RootState) => state.auth.accesstoken);
  const userKey = useSelector((state: RootState) => state.auth.keynumber);
  const isModalOpen = useSelector((state: RootState) => state.mentorModal.isOpen);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: false,
      }),
      TextStyle,
      Image,
      Color.configure({ types: [TextStyle.name] }),
      Underline,
      Code,
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({
        placeholder: MentorMentoringInfoText(),
      }),
    ],
    content: mentorData?.content || '',
  });

  useEffect(() => {
    if (editor && mentorData?.content) {
      editor.commands.setContent(mentorData.content);
    }
  }, [editor, mentorData?.content]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const handlePreview = async (): Promise<void> => {
    if (!editor) return;
    try {
      const response: PreviewResponse = await MentorApi.getPreviewData({ userKey });
      const careerValue =
        Array.isArray(career) && career.length > 0 && career[0]?.value ? career[0].value : '';
      const combinedData: PreviewData = {
        title: response.data.title ?? title,
        tag: response.data.tag ?? tag.map((t) => t.value),
        position: response.data.position ?? position,
        career: response.data.career ?? careerValue,
        currentJob: response.data.currentJob ?? currentJob,
        hour: response.data.hour ?? hour,
        price: response.data.price ?? price,
        content: editor.getHTML(),
        profileUrl: response.data.profileUrl ?? '',
        rating: response.data.rating ?? null,
        userNickname: response.data.userNickname ?? '',
        menteeCount: response.data.menteeCount ?? 0,
      };
      setPreviewData(combinedData);
      dispatch(openModal({ modalType: 'preview' })); // 수정된 부분
    } catch (error) {
      console.error('미리보기 데이터 로드 실패:', error);
      setDialogMessage('미리보기를 실패했습니다. 다시 시도해 주세요.');
      setDialogOpen(true);
    }
  };

  const handleGoBack = (): void | Promise<void> => navigate('/community/mentor');

  const handleSubmitOrModify = async (): Promise<void> => {
    if (!editor) return;
    const careerValue =
      Array.isArray(career) && career.length > 0 && career[0]?.value ? career[0].value : '';
    const mentorPostData: MentorPostData = {
      title,
      position,
      content: editor.getHTML(),
      career: careerValue,
      currentJob,
      tag: tag.map((t) => t.value),
      hour,
      price,
      userKey,
      ...(isModifyMode && { mentorId: mentorData.mentorId }),
    };

    if (!userAuth) {
      setDialogMessage('로그인이 필요한 서비스입니다.');
      setDialogOpen(true);
    }

    const requiredFields = [
      editor.getHTML().trim(),
      title.trim(),
      position.trim(),
      careerValue.trim(),
      currentJob.trim(),
      hour.trim(),
      price.trim(),
    ];
    const hasEmptyFields = requiredFields.some((field) => !field);

    if (hasEmptyFields) {
      if (isModifyMode) {
        if (!editor.getHTML().trim() || !title.trim()) {
          setDialogMessage('제목과 내용을 모두 입력하세요!');
          setDialogOpen(true);
          return;
        }
      } else {
        if (hasEmptyFields) {
          setDialogMessage('입력란을 모두 채워주세요!');
          setDialogOpen(true);
          return;
        }
      }
    }

    try {
      if (isModifyMode) {
        await MentorApi.ModifyMentorPost(mentorPostData);
        setDialogMessage('글이 성공적으로 수정되었습니다.');
        setDialogOpen(true);
      } else {
        await MentorApi.writeMentorPost(mentorPostData);
        setDialogMessage('글이 성공적으로 작성되었습니다.');
        setDialogOpen(true);
      }
      // navigate('/community/mentor');
    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data.message || '오류가 발생했습니다.';
        setDialogMessage(errorMessage);
        setDialogOpen(true);
      } else {
        console.error(`${isModifyMode ? '수정' : '제출'} 실패:`, error);
        setDialogMessage(
          `글 ${isModifyMode ? '수정' : '제출'}에 실패했습니다. 다시 시도해 주세요.`,
        );
        setDialogOpen(true);
      }
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <>
      <TipTapBox>
        <MentorEditorArea>
          <ToolBar editor={editor} />
          <StyledEditorContent editor={editor} />
        </MentorEditorArea>
        <WriteButtonsArea>
          <PreviewButton onClick={handlePreview}>미리보기</PreviewButton>
          <WriteCancelButton onClick={handleGoBack}>취소</WriteCancelButton>
          <WriteSubmitButton onClick={handleSubmitOrModify}>
            {isModifyMode ? '수정' : '등록'}
          </WriteSubmitButton>
        </WriteButtonsArea>
      </TipTapBox>
      {isModalOpen ? <PreviewModal previewData={previewData} /> : null}
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
          ) : dialogMessage === '글이 성공적으로 수정되었습니다.' ||
            dialogMessage === '글이 성공적으로 작성되었습니다.' ? (
            <Button
              sx={{ fontFamily: 'bold' }}
              color="secondary"
              onClick={() => {
                navigate('/community/mentor');
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

export default Post_WriteEditor_Mentor;
