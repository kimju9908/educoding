import { JSX, useEffect, useState } from 'react';

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
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { all, createLowlight } from 'lowlight';
import '../../../styles/community/PostEditor.css';

import type { CSWriteEditorReportProps } from '../CsType';

import CsApi from '../../../../api/AxiosApi/CsApi/CsApi';
import { ReportPost } from '../../../../api/AxiosApi/CsApi/CsApiTypes';
import ToolBar from '../../../../util/ToolBar';
import {
  EditorArea,
  StyledEditorContent,
  TipTapBox,
  WriteButtonsArea,
  WriteCancelButton,
  WriteSubmitButton,
} from '../../../styles/cs/CS';

const lowlight = createLowlight(all);

CodeBlockLowlight.configure({
  lowlight,
});

const CS_WriteEditor_Report = ({
  boardId,
  writerName,
  boardTitle,
  boardUrl,
  title,
  report,
}: CSWriteEditorReportProps): JSX.Element => {
  const navigate = useNavigate();
  const [editorContent, setEditorContent] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null); // editor의 타입을 Editor로 설정

  useEffect(() => {
    if (boardId && writerName && boardTitle && boardUrl) {
      setEditorContent(`
        <p><b>[악성 사용자 신고 예시]</b></p>
        <ul>
          <li>악성 게시글 ID : ${boardId}  </li>
          <li>악성 게시글 작성자 닉네임 : ${writerName} </li>
          <li>악성 게시글 제목 : ${boardTitle} </li>
          <li>악성 게시글 URL : ${boardUrl} </li>
        </ul>
        <p><span style="color: #868e96;">* 참고 사항 : </span></p><br />
      `);
    }
  }, [boardId, writerName, boardTitle, boardUrl]);

  // useEditor에서 반환된 editor를 상태로 설정
  const editorInstance = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({ types: [TextStyle.name] }),
      Underline,
      Code,
      CodeBlockLowlight.configure({ lowlight }),
      Image,
      Subscript,
    ],
    content: '',
    editable: true,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      if (newContent !== editorContent) {
        setEditorContent(newContent);
      }
    },
  });

  useEffect(() => {
    if (editorInstance) {
      setEditor(editorInstance);
    }
  }, [editorInstance]);

  useEffect(() => {
    if (editor && editorContent !== editor.getHTML()) {
      editor.commands.setContent(editorContent);
    }
  }, [editorContent, editor]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  // submit button
  const handleSubmit = async (): Promise<void> => {
    if (!editor?.getHTML().trim() || !title.trim()) {
      setDialogMessage('제목과 내용을 모두 입력하세요!');
      setDialogOpen(true);
      return;
    }

    try {
      const reportValue: ReportPost = {
        boardId: boardId,
        title: title,
        content: editor.getHTML(),
        report: report,
      };
      const response = await CsApi.newReportPost(reportValue);
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
          <WriteCancelButton onClick={() => navigate(-1)}>취소</WriteCancelButton>
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
          {dialogMessage === '글이 성공적으로 작성되었습니다.' ? (
            <Button
              sx={{ fontFamily: 'bold' }}
              color="secondary"
              onClick={() => {
                navigate(-1);
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

export default CS_WriteEditor_Report;
