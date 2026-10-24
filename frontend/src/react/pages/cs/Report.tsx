import { JSX, useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import Select, { MultiValue } from 'react-select';

import CS_WriteEditor_Report from './components/CS_WriteEditor_Report';
import { SelectOption } from './CsType';
import { customStyles } from './CustomStyles';
import {
  WriteWrap,
  WriteContainer,
  WriteTagBox,
  WriteTitle,
  WriteTitleBox,
  PageTitleBar,
} from '../../styles/cs/CS';

const Report = (): JSX.Element => {
  const [boardId, setBoardId] = useState<string>('');
  const [writerName, setWriterName] = useState<string>('');
  const [boardTitle, setBoardTitle] = useState<string>('');
  const [boardUrl, setBoardUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const originBoardId = location.state?.boardId || '';
    const originWriterName = location.state?.writerName || '';
    const originBoardTitle = location.state?.boardTitle || '';
    const originBoardUrl = location.state?.boardUrl || '';
    setBoardId(originBoardId);
    setWriterName(originWriterName);
    setBoardTitle(originBoardTitle);
    setBoardUrl(originBoardUrl);

    if (originBoardId === '') {
      setDialogOpen(true);
    }
  }, [location.state, navigate]);

  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const reportOptions: SelectOption[] = [
    { value: 'ILLEGAL_CONTENT', label: '부적절한 콘텐츠' },
    { value: 'VIOLENCE', label: '욕설, 비방' },
    { value: 'SPAM', label: '스팸, 광고' },
    { value: 'PLAGIARISM', label: '저작권 침해' },
    { value: 'ETC', label: '기타' },
  ];

  const handleChange = (newValue: MultiValue<SelectOption>): void => {
    setSelectedReports(newValue.map((option) => option.value));
  };

  return (
    <>
      <WriteWrap>
        <WriteContainer>
          <PageTitleBar>커뮤니티 악성 게시글 신고</PageTitleBar>
          <WriteTitleBox>
            <WriteTitle
              autoComplete="off"
              placeholder="제목을 입력하세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </WriteTitleBox>
          <WriteTagBox>
            <Select
              options={reportOptions}
              isMulti
              onChange={handleChange}
              placeholder="태그를 설정하세요."
              styles={customStyles}
            />
          </WriteTagBox>
          <CS_WriteEditor_Report
            boardId={Number(boardId)}
            writerName={writerName}
            boardTitle={boardTitle}
            boardUrl={boardUrl}
            title={title}
            report={selectedReports}
          />
        </WriteContainer>
      </WriteWrap>
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
          잘못된 접근입니다.
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'right' }}>
          <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={() => navigate('/')}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Report;
