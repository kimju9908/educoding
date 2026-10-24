import { JSX, useState } from 'react';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
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

import type { ModifyIntroductionRequest } from '../../../../../api/AxiosApi/MyPageApi/MyPageApiTypes';
import type { CheckResponse } from '../../../../../types/CommonTypes';
import type { UserFeedWriteEditorProps } from '../../MyPageType';
import type { AxiosResponse } from 'axios';

import MyPageApi from '../../../../../api/AxiosApi/MyPageApi/MyPageApi';
import ToolBar from '../../../../../util/ToolBar';
import { StyledEditorContent } from '../../../../styles/cs/CS';
import {
  EditorArea,
  TipTapBox,
  WriteButtonsArea,
  WriteCancelButton,
  WriteSubmitButton,
} from '../../../../styles/mypage/MyPage_UserFeed';

const lowlight = createLowlight(all);

CodeBlockLowlight.configure({
  lowlight,
});

const UserFeed_WriteEditor = ({
  handleCloseEditor,
  introduction,
}: UserFeedWriteEditorProps): JSX.Element => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // 기본 코드 블록 비활성화
      }),
      TextStyle,
      Color.configure({ types: [TextStyle.name] }), // TextStyle 확장과 연동
      Underline,
      Code,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image,
      Placeholder.configure({
        placeholder: `나를 소개하는 피드를 작성해 보세요.`,
      }),
    ],
    content: introduction || '',
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const useModifyIntroduction = (): UseMutationResult<
    AxiosResponse<CheckResponse>,
    Error,
    ModifyIntroductionRequest
  > => {
    const queryClinet = useQueryClient();
    return useMutation({
      mutationFn: async (payload: ModifyIntroductionRequest) => {
        return MyPageApi.modifyProfile(payload);
      },
      onSuccess: () => {
        queryClinet.invalidateQueries({ queryKey: ['myprofile'] });
        handleCloseEditor();
        setDialogMessage('글이 성공적으로 작성되었습니다.');
        setDialogOpen(true);
      },
      onError: () => {
        handleCloseEditor();
        setDialogMessage('글 작성에 실패했습니다. 다시 시도해주세요.');
        setDialogOpen(true);
      },
    });
  };

  const mutation = useModifyIntroduction();

  const handleSubmit = (): void => {
    mutation.mutate({ introduction: editor?.getHTML() as string });
  };

  return (
    <>
      <TipTapBox>
        <EditorArea>
          <ToolBar editor={editor} />
          <StyledEditorContent editor={editor} />
        </EditorArea>
        <WriteButtonsArea>
          <WriteCancelButton onClick={handleCloseEditor}>닫기</WriteCancelButton>
          <WriteSubmitButton onClick={handleSubmit}>등록</WriteSubmitButton>
        </WriteButtonsArea>
      </TipTapBox>
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

export default UserFeed_WriteEditor;
