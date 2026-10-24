import { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import Select, { MultiValue } from 'react-select';

import {
  WriteWrap,
  WriteContainer,
  WriteTagBox,
  WriteTitle,
  WriteTitleBox,
  PageTitleBar,
  SelectStyle,
  MentorOtherTagsLine,
  MentorOtherTagsLeft,
  MentorOtherTagsRight,
} from '../../../../styles/community/Community_Write';
import { MentorData, MentorFormData, OptionType } from '../../Communitu_Mentor_Interface';
import Post_WriteSort from '../../components/common/post/Post_WriteSort';
import Post_WriteEditor_Mentor from '../../components/mentor/Post_WriteEditor_Mentor';

const Post_Write_Mentor: React.FC = () => {
  const location = useLocation();
  const mentorData: MentorData = location.state?.mentorData || {};

  // 수정 모드인지 판단 (mentorId가 있으면 수정 모드로 간주)
  const isModifyMode = !!mentorData.mentorId;

  const [formData, setFormData] = useState<MentorFormData>({
    title: mentorData.title || '',
    tag: [],
    position: mentorData.position || '',
    career: [],
    currentJob: mentorData.currentJob || '',
    hour: mentorData.hour || '',
    price: mentorData.price || '',
    mentorId: mentorData.mentorId || null,
  });

  // 태그 드롭다운 옵션
  const MentorOptions: OptionType[] = [
    { value: 'PROGRAMMING', label: '프로그래밍' },
    { value: 'GAME', label: '게임' },
    { value: 'AI', label: '인공지능' },
    { value: 'SECURITY', label: '보안' },
    { value: 'DATA', label: '데이터' },
    { value: 'HARDWARE', label: '하드웨어' },
    { value: 'DESIGN', label: '디자인' },
    { value: 'STRATEGIC_MANAGEMENT', label: '기획경영' },
    { value: 'MARKETING', label: '마케팅' },
    { value: 'SELF_DEVELOPMENT', label: '자기계발' },
    { value: 'NETWORK', label: '네트워크' },
    { value: 'ETC', label: '기타' },
  ];

  // 커리어 드롭다운 옵션
  const careerOptions: OptionType[] = [
    { value: '신입(1년 미만)', label: '신입(1년 미만)' },
    { value: '주니어(1~3년)', label: '주니어(1~3년)' },
    { value: '미들(4~8년)', label: '미들(4~8년)' },
    { value: '시니어(9년이상)', label: '시니어(9년이상)' },
    { value: '리드Level', label: '리드Level' },
  ];

  // 초기 태그와 커리어 설정 (useEffect 내)
  useEffect(() => {
    if (!mentorData || Object.keys(mentorData).length === 0) return;

    const initialTags: OptionType[] = (mentorData.tag || [])
      .map((tag) => MentorOptions.find((option) => option.value === tag))
      .filter((option): option is OptionType => !!option); // 타입 가드로 undefined 제거

    const initialCareer = careerOptions.find((option) => option.value === mentorData.career);

    setFormData((prev) => ({
      ...prev,
      title: mentorData.title || prev.title,
      tag: initialTags,
      position: mentorData.position || prev.position,
      career: initialCareer ? [initialCareer] : [],
      currentJob: mentorData.currentJob || prev.currentJob,
      hour: mentorData.hour || prev.hour,
      price: mentorData.price || prev.price,
      mentorId: mentorData.mentorId || prev.mentorId,
    }));
  }, [mentorData]);

  // 상태를 업데이트하는 함수들
  const MAX_SELECTION = 12;
  const MAX_CAREER_SELECTION = 1;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  // 태그 설정
  const handleTagChange = (selectedOptions: MultiValue<OptionType>): void => {
    if (selectedOptions.length > MAX_SELECTION) {
      setDialogMessage(`최대 ${MAX_SELECTION}개까지 선택할 수 있습니다.`);
      setDialogOpen(true);
      return;
    }
    setFormData((prev) => ({ ...prev, tag: selectedOptions as OptionType[] }));
  };

  // 제목 설정
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

  // 직무 설정
  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value.length > 15) {
      setDialogMessage('최대 15자까지 입력 가능합니다.');
      setDialogOpen(true);
      return;
    }
    setFormData((prev) => ({ ...prev, position: value.slice(0, 15) }));
  };

  // 커리어 설정
  const handleCareerChange = (selectedOptions: MultiValue<OptionType>): void => {
    if (selectedOptions.length > MAX_CAREER_SELECTION) {
      setDialogMessage(`최대 ${MAX_CAREER_SELECTION}개까지 선택할 수 있습니다.`);
      setDialogOpen(true);
      return;
    }
    setFormData((prev) => ({ ...prev, career: selectedOptions as OptionType[] }));
  };

  // 현직 설정
  const handleCurrentJobChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value.length > 15) {
      setDialogMessage('최대 15자까지 입력 가능합니다.');
      setDialogOpen(true);
      return;
    }
    setFormData((prev) => ({ ...prev, currentJob: value.slice(0, 15) }));
  };

  // 시간 설정
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value && parseInt(value) > 5) {
      value = '5';
    }
    setFormData((prev) => ({ ...prev, hour: value }));
  };

  // 금액 설정
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value && parseInt(value) > 500000) {
      value = '500000';
    }
    const formattedValue = value ? Number(value).toLocaleString() : '';
    setFormData((prev) => ({ ...prev, price: formattedValue }));
  };

  return (
    <>
      <WriteWrap>
        <WriteContainer>
          <PageTitleBar>커뮤니티 글쓰기</PageTitleBar>
          <Post_WriteSort />
          <WriteTitleBox>
            <WriteTitle
              autoComplete="off"
              placeholder="제목을 입력하세요."
              value={formData.title}
              onChange={handleTitleChange}
            />
          </WriteTitleBox>
          <WriteTagBox>
            <Select
              options={MentorOptions}
              isMulti
              onChange={handleTagChange}
              placeholder="태그를 설정하세요."
              styles={SelectStyle}
              value={formData.tag}
            />
          </WriteTagBox>
          <WriteTagBox>
            <Select
              options={careerOptions}
              isMulti
              onChange={handleCareerChange}
              placeholder="커리어를 설정하세요."
              styles={SelectStyle}
              value={formData.career}
            />
          </WriteTagBox>
          <MentorOtherTagsLine>
            <MentorOtherTagsLeft
              autoComplete="off"
              placeholder="직무를 입력하세요."
              onChange={handlePositionChange}
              value={formData.position}
            />
            <MentorOtherTagsRight
              autoComplete="off"
              placeholder="회사명을 입력하세요."
              onChange={handleCurrentJobChange}
              value={formData.currentJob}
            />
          </MentorOtherTagsLine>
          <MentorOtherTagsLine>
            <MentorOtherTagsLeft
              autoComplete="off"
              placeholder="1회 멘토링 시간 (최대 5시간)"
              value={formData.hour}
              onChange={handleHourChange}
            />
            <MentorOtherTagsRight
              autoComplete="off"
              placeholder="1회 멘토링 요금 (최대 50만원)"
              value={formData.price}
              onChange={handlePriceChange}
            />
          </MentorOtherTagsLine>
          <Post_WriteEditor_Mentor
            formData={formData}
            mentorData={mentorData}
            isModifyMode={isModifyMode}
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

export default Post_Write_Mentor;
