import React, { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import Code from '@tiptap/extension-code';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Color } from '@tiptap/extension-color';
import { Image } from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { all, createLowlight } from 'lowlight';

import type { PostReplyModifyEditorProps } from '../../../CommunityType';

import CommunityApi from '../../../../../../api/AxiosApi/CommunityApi/CommunityApi';
import { ModifyReplyRequest } from '../../../../../../api/AxiosApi/CommunityApi/CommunityApiType';
import { useAppDispatch, useAppSelector } from '../../../../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../../../../redux/slice/LoginModalSlice';
import ToolBar from '../../../../../../util/ToolBar';
import {
  EditorArea,
  TipTapBox,
  WriteButtonsArea,
  WriteCancelButton,
  WriteSubmitButton,
} from '../../../../../styles/community/Reply';

const lowlight = createLowlight(all);

CodeBlockLowlight.configure({
  lowlight,
});

const Post_ReplyModifyEditor: React.FC<PostReplyModifyEditorProps> = ({
  handleCloseModifyEditor,
  postBoardId,
  replyContents,
  replyId,
  replyUserName,
}) => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userAuth = useAppSelector((state) => state.auth.accesstoken);
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
        placeholder: `답변을 작성해보세요.`,
      }),
    ],
    content: replyContents || '',
  });

  useEffect(() => {
    if (editor && replyContents) {
      editor.commands.setContent(replyContents);
    }
  }, [editor, replyContents]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  // submit button
  const handleSubmit = async (): Promise<void> => {
    if (!editor) return; // editor가 초기화되지 않았으면 실행하지 않음

    const htmlContent = editor.getHTML().trim();
    const textContent = htmlContent?.replace(/<[^>]+>/g, '').trim();
    if (userAuth === '') {
      setDialogMessage('로그인이 필요한 서비스입니다.');
      setDialogOpen(true);
      // return navigate('/login');
    }

    if (!textContent) {
      setDialogMessage('내용을 입력하세요!');
      setDialogOpen(true);
      return;
    }
    try {
      const request: ModifyReplyRequest = {
        boardId: Number(boardId),
        commentId: Number(replyId),
        name: String(replyUserName),
        content: editor.getHTML(),
      };

      const response = await CommunityApi.modifyReply(request);
      if (response.data) {
        setDialogMessage('댓글이 성공적으로 수정되었습니다.');
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('제출 실패:', error);
      setDialogMessage('댓글 수정에 실패했습니다. 다시 시도해주세요.');
      setDialogOpen(true);
    }
  };

  return (
    <>
      <TipTapBox style={{ borderTop: '1px solid var(--educoding-line)', marginTop: '20px' }}>
        <EditorArea
          style={{
            borderLeft: '1px solid var(--educoding-line)',
            borderRight: '1px solid var(--educoding-line)',
          }}
        >
          <ToolBar editor={editor} />
          <EditorContent
            style={{
              width: '100%',
              height: '100%',
              padding: '55px 15px 15px',
              overflowY: 'auto', // 세로 스크롤 활성화
              overflowX: 'hidden', // 가로 스크롤 비활성화
              boxSizing: 'border-box', // 패딩 포함 계산
            }}
            editor={editor}
          />
        </EditorArea>
        <WriteButtonsArea
          style={{
            borderLeft: '1px solid var(--educoding-line)',
            borderRight: '1px solid var(--educoding-line)',
          }}
        >
          <WriteCancelButton onClick={handleCloseModifyEditor}>닫기</WriteCancelButton>
          <WriteSubmitButton onClick={handleSubmit}>수정</WriteSubmitButton>
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
          ) : dialogMessage === '댓글이 성공적으로 수정되었습니다.' ? (
            <Button
              sx={{ fontFamily: 'bold' }}
              color="secondary"
              onClick={() => {
                handleCloseModifyEditor();
                handleDialogClose();
                navigate(0);
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

export default Post_ReplyModifyEditor;
