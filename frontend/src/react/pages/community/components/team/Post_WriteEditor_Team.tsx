import React, { useState } from 'react';

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
import Subscript from '@tiptap/extension-subscript';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { all, createLowlight } from 'lowlight';
import './../../../../styles/community/PostEditor.css';

import CommunityApi from '../../../../../api/AxiosApi/CommunityApi/CommunityApi';
import { WriteTeamPostRequest } from '../../../../../api/AxiosApi/CommunityApi/CommunityApiType';
import { useAppDispatch, useAppSelector } from '../../../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../../../redux/slice/LoginModalSlice';
import ToolBar from '../../../../../util/ToolBar';
import {
  EditorArea,
  StyledEditorContent,
  TipTapBox,
  WriteButtonsArea,
  WriteCancelButton,
  WriteSubmitButton,
} from '../../../../styles/community/Community_Write';
import { PostWriteEditorTeamPros } from '../../CommunityType';

const lowlight = createLowlight(all);

CodeBlockLowlight.configure({
  lowlight,
});

const Post_WriteEditor_Team: React.FC<PostWriteEditorTeamPros> = ({ title, team }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [editorContent, setEditorContent] = useState(`
    <p><b>[개발 프로젝트 모집 내용 예시]</b></p>
        <ul>
          <li>프로젝트 주제 : </li>
          <li>프로젝트 목표 : </li>
          <li>예상 일정(횟수) : </li>
          <li>예상 커리큘럼 : </li>
          <li>예상 모집인원 : </li>
          <li>프로젝트 소개 : </li>
          <li>주의사항 : </li>
          <li>지원 방법(이메일, 카카오 오픈채팅방, 구글폼 등) : </li>
        </ul>
    `);
  const [boardType] = useState('team');

  const userAuth = useAppSelector((state) => state.auth.accesstoken);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({ types: [TextStyle.name] }), // TextStyle 확장과 연동
      Underline,
      Code,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image,
      Subscript,
    ],
    content: editorContent,
    onUpdate: ({ editor }) => {
      // 에디터 내용이 변경될 때마다 editorContent 상태 업데이트
      setEditorContent(editor.getHTML());
    },
  });

  // cancel button
  const handleGoBack = (): void => {
    navigate(`/community/${boardType}`);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  // submit button
  const handleSubmit = async (): Promise<void> => {
    if (userAuth === '') {
      setDialogMessage('로그인이 필요한 서비스입니다.');
      setDialogOpen(true);
    }

    if (!editorContent || !title) {
      setDialogMessage('제목과 내용을 모두 입력하세요!');
      setDialogOpen(true);
      return;
    }
    try {
      const data: WriteTeamPostRequest = {
        boardType,
        title,
        team,
        content: editorContent,
      };
      const response = await CommunityApi.writeTeamPost(data);
      if (response.data) {
        setDialogMessage('글이 성공적으로 작성되었습니다.');
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('제출 실패:', error);
      setDialogMessage('글 작성에 실패했습니다. 다시 시도해주세요.');
      setDialogOpen(true);
    }
  };

  return (
    <>
      <TipTapBox>
        <EditorArea>
          <ToolBar editor={editor} />
          <StyledEditorContent editor={editor} />
        </EditorArea>
        <WriteButtonsArea>
          <WriteCancelButton onClick={handleGoBack}>취소</WriteCancelButton>
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
          ) : dialogMessage === '글이 성공적으로 작성되었습니다.' ? (
            <Button
              sx={{ fontFamily: 'bold' }}
              color="secondary"
              onClick={() => {
                navigate(`/community/${boardType}`);
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

export default Post_WriteEditor_Team;
