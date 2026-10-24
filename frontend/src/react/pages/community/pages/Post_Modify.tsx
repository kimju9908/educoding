import { JSX, useEffect, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import Select, { ActionMeta, MultiValue } from 'react-select';

import type {
  CourseTypeArray,
  LanguageTypeArray,
  StudyTypeArray,
  TagNameType,
  TagOptionType,
  TagType,
  TeamTypeArray,
} from '../CommunityType';

import {
  WriteWrap,
  PageTitleBar,
  WriteContainer,
  WriteTitleBox,
  WriteTitle,
  WriteTagBox,
  SelectStyle,
} from '../../../styles/community/Community_Write';
import Post_ModifyEditor_Coding from '../components/coding/Post_ModifyEditor_Coding';
import Post_ModifySort from '../components/common/post/Post_ModifySort';
import Post_ModifyEditor_Course from '../components/course/Post_ModifyEditor_Course';
import Post_ModifyEditor_Study from '../components/study/Post_ModifyEditor_Study';
import Post_ModifyEditor_Team from '../components/team/Post_ModifyEditor_Team';

const tagOptions: TagOptionType = {
  coding: [
    { value: 'JAVA', label: 'Java' },
    { value: 'JS', label: 'JavaScript' },
    { value: 'PYTHON', label: 'Python' },
    { value: 'C', label: 'C' },
    { value: 'CPP', label: 'C++' },
    { value: 'CS', label: 'C#' },
    { value: 'SPB', label: 'Spring Boot' },
    { value: 'RE', label: 'React' },
    { value: 'AN', label: 'AngularJS' },
    { value: 'EX', label: 'ExpressJS' },
    { value: 'NO', label: 'NodeJS' },
    { value: 'HTML', label: 'HTML' },
    { value: 'CSS', label: 'CSS' },
    { value: 'ETC', label: '기타' },
  ],
  course: [
    { value: 'COMPANY', label: '회사정보' },
    { value: 'PORTFOLIO', label: '포트폴리오' },
    { value: 'SALARY', label: '급여' },
    { value: 'RESUME', label: '자기소개서' },
    { value: 'BOOTCAMP', label: '부트캠프' },
    { value: 'PROJECT', label: '프로젝트' },
    { value: 'ETC', label: '기타' },
  ],
  study: [
    { value: 'ALGORITHM', label: '알고리즘' },
    { value: 'STRUCTURE', label: '자료구조' },
    { value: 'CODING', label: '코딩테스트' },
    { value: 'ETC', label: '기타' },
  ],
  team: [
    { value: 'FRONT', label: '프론트엔드' },
    { value: 'BACK', label: '백엔드' },
    { value: 'DBA', label: 'DBA' },
    { value: 'DBS', label: 'DBS' },
    { value: 'DESIGNER', label: '디자이너' },
    { value: 'ETC', label: '기타' },
  ],
};

const MAX_SELECTION = 5;

const tagNames: TagNameType = {
  coding: 'languages',
  course: 'courses',
  study: 'studies',
  team: 'teams',
};

const Post_Modify = (): JSX.Element => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const { boardType } = useParams();
  const { boardId } = useParams();
  // const [boardId, setBoardId] = useState('');
  const options = tagOptions[boardType as keyof TagOptionType] || []; // 해당 타입의 태그 옵션 가져오기

  const navigate = useNavigate();
  const location = useLocation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const originTitle = location.state?.boardTitle || '';
    const originContent = location.state?.boardContent || '';
    // const originBoardId = location.state?.boardId || '';
    // const originSelectedTags = location.state?.languages || [];
    const tagName = tagNames[boardType as keyof TagNameType]; // boardType에 맞는 속성 이름 가져오기
    const originSelectedTags = location.state?.[tagName as string] || []; // 예: coding이면 location.state?.languages
    const defaultSelectedTags = options.filter((option) =>
      originSelectedTags.includes(option.value),
    );
    setTitle(originTitle);
    setContent(originContent);
    // setBoardId(originBoardId);
    setSelectedTags(defaultSelectedTags);

    if (originTitle === '') {
      setDialogOpen(true);
    }
  }, [location.state, boardType, options]);

  const handleChange = (newValue: MultiValue<TagType>, actionMeta: ActionMeta<TagType>): void => {
    setSelectedTags([...newValue].slice(0, MAX_SELECTION));
  };

  const renderEditor = (): JSX.Element => {
    switch (boardType) {
      case 'coding':
        return (
          <Post_ModifyEditor_Coding
            boardId={boardId}
            content={content}
            title={title}
            language={selectedTags.map((option) => option.value) as LanguageTypeArray}
          />
        );
      case 'course':
        return (
          <Post_ModifyEditor_Course
            boardId={boardId}
            content={content}
            title={title}
            course={selectedTags.map((option) => option.value) as CourseTypeArray}
          />
        );
      case 'study':
        return (
          <Post_ModifyEditor_Study
            boardId={boardId}
            content={content}
            title={title}
            study={selectedTags.map((option) => option.value) as StudyTypeArray}
          />
        );
      case 'team':
        return (
          <Post_ModifyEditor_Team
            boardId={boardId}
            content={content}
            title={title}
            team={selectedTags.map((option) => option.value) as TeamTypeArray}
          />
        );
      default:
        return <p>잘못된 게시판 타입입니다.</p>;
    }
  };

  return (
    <>
      <WriteWrap>
        <WriteContainer>
          <PageTitleBar>커뮤니티 글 수정하기</PageTitleBar>
          <Post_ModifySort />
          <WriteTitleBox>
            <WriteTitle
              disabled
              autoComplete="off"
              placeholder="제목을 입력하세요."
              value={title}
            />
          </WriteTitleBox>
          <WriteTagBox>
            <Select
              options={options}
              isMulti
              value={options.filter((option) =>
                selectedTags.some((tag) => tag.value === option.value),
              )}
              onChange={handleChange}
              placeholder="태그를 설정하세요."
              styles={SelectStyle}
            />
          </WriteTagBox>
          {renderEditor()}
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

export default Post_Modify;
