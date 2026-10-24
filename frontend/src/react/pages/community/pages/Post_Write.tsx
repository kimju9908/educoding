import { JSX, useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import Select, { ActionMeta, MultiValue } from 'react-select';

import type {
  CourseTypeArray,
  LanguageTypeArray,
  StudyTypeArray,
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
import Post_WriteEditor_Coding from '../components/coding/Post_WriteEditor_Coding';
import Post_WriteSort from '../components/common/post/Post_WriteSort';
import Post_WriteEditor_Course from '../components/course/Post_WriteEditor_Course';
import Post_WriteEditor_Study from '../components/study/Post_WriteEditor_Study';
import Post_WriteEditor_Team from '../components/team/Post_WriteEditor_Team';

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

const Post_Write = (): JSX.Element => {
  const [title, setTitle] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const { boardType } = useParams();
  const options = tagOptions[boardType as keyof TagOptionType] || []; // 해당 타입의 태그 옵션 가져오기

  // boardType 변경 시 선택된 태그 리셋
  useEffect(() => {
    setSelectedTags([]); // boardType이 바뀌면 선택된 태그를 리셋
  }, [boardType]);

  const handleChange = (newValue: MultiValue<TagType>, actionMeta: ActionMeta<TagType>): void => {
    setSelectedTags([...newValue].slice(0, MAX_SELECTION));
  };

  const renderEditor = (): JSX.Element => {
    switch (boardType) {
      case 'coding':
        return (
          <Post_WriteEditor_Coding
            title={title}
            language={selectedTags.map((option) => option.value) as LanguageTypeArray}
          />
        );
      case 'course':
        return (
          <Post_WriteEditor_Course
            title={title}
            course={selectedTags.map((option) => option.value) as CourseTypeArray}
          />
        );
      case 'study':
        return (
          <Post_WriteEditor_Study
            title={title}
            study={selectedTags.map((option) => option.value) as StudyTypeArray}
          />
        );
      case 'team':
        return (
          <Post_WriteEditor_Team
            title={title}
            team={selectedTags.map((option) => option.value) as TeamTypeArray}
          />
        );
      default:
        return (
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
            잘못된 게시판 타입입니다.
          </div>
        );
    }
  };

  return (
    <WriteWrap>
      <WriteContainer>
        <PageTitleBar>커뮤니티 글쓰기</PageTitleBar>
        <Post_WriteSort />
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
            options={options}
            isMulti
            onChange={handleChange}
            placeholder="태그를 설정하세요."
            styles={SelectStyle}
            value={options.filter((option) =>
              selectedTags.some((tag) => tag.value === option.value),
            )}
          />
        </WriteTagBox>
        {renderEditor()}
      </WriteContainer>
    </WriteWrap>
  );
};

export default Post_Write;
