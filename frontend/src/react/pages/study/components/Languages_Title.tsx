import React from 'react';

import { useNavigate } from 'react-router-dom';

import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import {
  SubjectContainer,
  SubjectImgContainer,
  SubjectTitle,
  SubjectContents,
  SubjectRateContainer,
  SubjectRateContents,
  SubjectTextContainer,
} from '../../../styles/study/Study_Components';
import { LanguageTitleProps } from '../StudyType';

export const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 13,
  borderRadius: 10,
}));

const Languages_Title: React.FC<LanguageTitleProps> = ({ language }) => {
  const languageImages = {
    Java: 'url(/images/program/java_full.png)',
    C: 'url(/images/program/c_full.png)',
    CPlus: 'url(/images/program/cplus_full.png)',
    JavaScript: 'url(/images/program/js_full.png)',
    Python: 'url(/images/program/python_full.png)',
  };

  type ProgressValueType = Record<'Java' | 'C' | 'CPlus' | 'JavaScript' | 'Python', number>;

  type LanguageType = keyof ProgressValueType;

  const progressValues: ProgressValueType = {
    Java: 0,
    C: 0,
    CPlus: 0,
    JavaScript: 0,
    Python: 0,
  };

  const languageMap: Record<string, LanguageType> = {
    java: 'Java',
    c: 'C',
    cplus: 'CPlus',
    javascript: 'JavaScript',
    python: 'Python',
  };

  const formattedLanguage = language ? languageMap[language] || '' : '';
  const progress: number = progressValues[formattedLanguage as LanguageType] || 0;

  const navigate = useNavigate();

  const handleNavigate = (): void => {
    navigate(`/study/${language.toLowerCase()}`);
  };

  return (
    <>
      <SubjectContainer onClick={handleNavigate}>
        <SubjectImgContainer
          style={{ backgroundImage: languageImages[language as LanguageType] || 'none' }}
        />
        <SubjectTextContainer>
          <SubjectTitle>{language}</SubjectTitle>
          <SubjectContents>
            {progress === 0 ? '학습전' : progress === 100 ? '학습 완료' : '학습중'}
          </SubjectContents>
        </SubjectTextContainer>
        <SubjectRateContainer>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <BorderLinearProgress variant="determinate" value={progress} color="secondary" />
          </Stack>
          <SubjectRateContents>{progress}%</SubjectRateContents>
        </SubjectRateContainer>
      </SubjectContainer>
    </>
  );
};

export default React.memo(Languages_Title);
