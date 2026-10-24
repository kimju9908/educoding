import { JSX } from 'react';

import { LeftMiddleSubjectContainer } from '../../../styles/codingtest/CodingTest_Main';
import { LevelExplainProps } from '../CodingTestType';

const Level_Explain = ({ level }: LevelExplainProps): JSX.Element => {
  // level 값에 따른 문구 정의
  let message = '';

  switch (level) {
    case 'practice':
      message = `연습문제 카테고리의 문제들은 프로그래밍에 익숙하지 않은 분들도 부담 없이 도전할 수 있도록 설계되었어요 🧾\n
차근차근 문제를 풀다 보면 어느새 자연스럽게 프로그래밍에 익숙해진 자신을 발견할 거예요 😉`;
      break;
    case 'basic':
      message = `1단계는 전형적이고 기본적인 코딩테스트 문제들을 통해 프로그래밍의 기본 개념을 익히는 단계예요! 🏗️\n
테스트 문제들을 통해 간단한 문법과 로직을 연습하면서 프로그래밍의 기초를 탄탄하게 만들어봐요.`;
      break;
    case 'intermediate':
      message = `2단계는 연습문제, 1단계의 문제들 보다는 조금 더 복잡하고 문제 해결력을 요하는 문제에 도전하는 단계예요! 🔍\n
조건문, 반복문, 자료구조 등보다 복잡한 로직들을 활용하며 논리적인 사고력을 키워볼까요?`;
      break;
    case 'expert':
      message = `3단계는 실전 감각을 익히기 위한 단계로, 실제 개발에서 자주 쓰이는 개념들을 연습하는 단계예요! 🚀\n
알고리즘 최적화와 효율적인 코드 작성법을 익히면서 개발자로서 한 단계 더 성장해봐요.`;
      break;
    default:
      message = '카테고리를 선택하세요 🔍';
      break;
  }

  return <LeftMiddleSubjectContainer>{message}</LeftMiddleSubjectContainer>;
};

export default Level_Explain;
