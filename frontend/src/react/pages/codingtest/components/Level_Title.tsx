import { JSX } from 'react';

import { useNavigate } from 'react-router-dom';

import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { styled, useTheme } from '@mui/material/styles';

import {
  SubjectContainer,
  SubjectImgContainer,
  SubjectTitle,
  SubjectContents,
  SubjectRateContainer,
  SubjectRateContents,
  SubjectTextContainer,
} from '../../../styles/codingtest/CodingTest_Components';
import { LevelTitleProps, LevelTypeObject, ProgressValueType } from '../CodingTestType';

export const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 13,
  borderRadius: 10,
}));

const Level_Title = ({ level }: LevelTitleProps): JSX.Element => {
  const theme = useTheme();
  const isLightMode = theme.palette.mode === 'light';

  const levelImages: LevelTypeObject = {
    practice: isLightMode
      ? 'url(/images/codingtest/practice_full_light.png)'
      : 'url(/images/codingtest/practice_full.png)',
    basic: isLightMode
      ? 'url(/images/codingtest/basic_full_light.png)'
      : 'url(/images/codingtest/basic_full.png)',
    intermediate: isLightMode
      ? 'url(/images/codingtest/intermediate_full_light.png)'
      : 'url(/images/codingtest/intermediate_full.png)',
    expert: isLightMode
      ? 'url(/images/codingtest/expert_full_light.png)'
      : 'url(/images/codingtest/expert_full.png)',
  };

  const progressValues: ProgressValueType = {
    practice: 0,
    basic: 0,
    intermediate: 0,
    expert: 0,
  };

  const levelNames: LevelTypeObject = {
    practice: '연습문제',
    basic: '1단계',
    intermediate: '2단계',
    expert: '3단계',
  };

  const progress = progressValues[level as keyof LevelTypeObject] || 0;
  const navigate = useNavigate();

  const handleNavigate = (): void => {
    navigate(`/codingtest/${level}`);
  };

  return (
    <>
      <SubjectContainer onClick={handleNavigate}>
        <SubjectImgContainer
          style={{ backgroundImage: levelImages[level as keyof LevelTypeObject] || 'none' }}
        />
        <SubjectTextContainer>
          <SubjectTitle>{levelNames[level as keyof LevelTypeObject]}</SubjectTitle>
          <SubjectContents>
            {progress === 0
              ? '이 단계에 도전해보세요!'
              : progress === 100
                ? '테스트 진행 중'
                : '전체 문제 풀이 완료'}
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

export default Level_Title;
