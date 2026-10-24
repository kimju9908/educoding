import { JSX, useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import { purple } from '@mui/material/colors';
import Radio from '@mui/material/Radio';
import { styled } from '@mui/material/styles';

import { QuestionType } from './MainType';
import {
  MiddleTitle,
  MiddleTitleBar,
  MiddleTitleContainer,
  MainSection3Container,
  MainSection3ContentsContainer,
  MainSection3Contents,
  MainSection3TitleArea,
  MainSection3TitleLeft,
  MainSection3TitleRight,
  MainSection3ExamplesArea,
  MainSection3EachExample,
  MainSection3EachExampleLeft,
  MainSection3EachExampleRight,
  MainSection3AnswerArea,
  MainSection3AnswerText,
  MainSection3AnswerTextLine,
  MainSection3AnswerTextLeft,
  MainSection3AnswerTextRight,
} from '../../styles/main/Main';

const MainSection3 = (): JSX.Element => {
  const questions: QuestionType = [
    {
      id: 1,
      question: '소프트웨어 설계에서 "모듈화"의 주요 목적은 무엇인가?',
      options: [
        { value: '1', label: '코드의 재사용성 향상' },
        { value: '2', label: '개발 속도 향상' },
        { value: '3', label: '유지보수의 용이성' },
        { value: '4', label: '사용자 인터페이스 개선' },
      ],
      correctAnswer: '1',
      explanation: '모듈화는 코드의 재사용성을 높이고 유지보수를 쉽게 만듭니다.',
    },
    {
      id: 2,
      question: '객체지향 설계에서 "상속"을 사용하는 이유는 무엇인가?',
      options: [
        { value: '1', label: '코드 중복을 줄이기 위해' },
        { value: '2', label: '객체 간의 관계를 쉽게 표현하기 위해' },
        { value: '3', label: '객체의 상태를 쉽게 관리하기 위해' },
        { value: '4', label: '클래스 간의 의존성을 줄이기 위해' },
      ],
      correctAnswer: '1',
      explanation: '상속은 코드의 중복을 줄이고 기능을 확장하는 데 사용됩니다.',
    },
    {
      id: 3,
      question: '소프트웨어 개발 생명주기에서 가장 중요한 단계는 무엇인가?',
      options: [
        { value: '1', label: '요구사항 분석' },
        { value: '2', label: '설계' },
        { value: '3', label: '구현' },
        { value: '4', label: '테스트' },
      ],
      correctAnswer: '1',
      explanation:
        '요구사항 분석은 개발 초기 단계에서 매우 중요하며, 시스템이 충족해야 할 기능과 조건을 명확히 정의하는 과정입니다.',
    },
    {
      id: 4,
      question: '소프트웨어 개발에서 테스트 주도 개발(TDD)의 주요 장점은 무엇인가?',
      options: [
        { value: '1', label: '코드 품질 향상' },
        { value: '2', label: '빠른 개발' },
        { value: '3', label: '최적화된 성능' },
        { value: '4', label: '간결한 코드' },
      ],
      correctAnswer: '1',
      explanation:
        '테스트 주도 개발(TDD)은 코드를 작성하기 전에 먼저 테스트를 작성하여, 코드 품질을 높이고 버그를 미리 방지하는 방법입니다.',
    },
    {
      id: 5,
      question: 'SQL에서 ORDER BY 절은 무엇을 수행하는가?',
      options: [
        { value: '1', label: '데이터를 그룹화하기 위해' },
        { value: '2', label: '데이터를 삽입하기 위해' },
        { value: '3', label: '데이터를 정렬하기 위해' },
        { value: '4', label: '데이터를 갱신하기 위해' },
      ],
      correctAnswer: '3',
      explanation: 'ORDER BY 절은 결과를 지정된 기준에 따라 오름차순 또는 내림차순으로 정렬합니다.',
    },
    {
      id: 6,
      question: 'SQL에서 SELECT DISTINCT가 사용하는 주된 목적은 무엇인가?',
      options: [
        { value: '1', label: '데이터를 삽입하기 위해' },
        { value: '2', label: '중복된 데이터를 제거하기 위해' },
        { value: '3', label: '데이터를 갱신하기 위해' },
        { value: '4', label: '데이터를 삭제하기 위해' },
      ],
      correctAnswer: '2',
      explanation:
        'SELECT DISTINCT는 쿼리 결과에서 중복된 값을 제거하고 고유한 값을 반환하는 데 사용됩니다.',
    },
    {
      id: 7,
      question: '자바에서 인터페이스의 목적은 무엇인가?',
      options: [
        { value: '1', label: '클래스 간의 상속을 지원한다.' },
        { value: '2', label: '객체를 생성한다.' },
        { value: '3', label: '구현을 강제하는 계약을 정의한다.' },
        { value: '4', label: '메서드를 선언한다.' },
      ],
      correctAnswer: '3',
      explanation: '인터페이스는 클래스가 구현해야 하는 메서드의 계약을 정의합니다.',
    },
    {
      id: 8,
      question: 'C에서 struct의 목적은 무엇인가?',
      options: [
        { value: '1', label: '데이터의 집합을 정의한다.' },
        { value: '2', label: '여러 데이터 타입을 묶어서 하나의 데이터 구조를 만든다.' },
        { value: '3', label: '메모리 주소를 저장한다.' },
        { value: '4', label: '상수값을 저장한다.' },
      ],
      correctAnswer: '2',
      explanation: 'struct는 여러 개의 다른 데이터 타입을 하나의 구조체로 묶는 데 사용됩니다.',
    },
    {
      id: 9,
      question: '시스템 구축에서 테스트 결과 분석의 중요성은 무엇인가?',
      options: [
        { value: '1', label: '테스트 비용을 줄이기 위해서' },
        { value: '2', label: '시스템의 성능을 향상시키기 위해서' },
        { value: '3', label: '시스템을 빠르게 배포하기 위해서' },
        { value: '4', label: '시스템의 결함을 파악하고 수정하기 위해서' },
      ],
      correctAnswer: '4',
      explanation:
        '테스트 결과 분석은 시스템의 결함을 파악하고 이를 수정하여 최종적으로 안정적인 시스템을 구현하는 데 중요합니다.',
    },
    {
      id: 10,
      question: '시스템 구축에서 시스템 테스트가 중요한 이유는 무엇인가?',
      options: [
        { value: '1', label: '시스템을 빠르게 배포하기 위해서' },
        { value: '2', label: '시스템의 보안을 강화하기 위해서' },
        { value: '3', label: '시스템이 요구사항을 충족하는지 검증하기 위해서' },
        { value: '4', label: '시스템 성능을 최적화하기 위해서' },
      ],
      correctAnswer: '3',
      explanation:
        '시스템 테스트는 시스템이 요구사항을 충족하는지 검증하고, 시스템의 품질을 보장하는 중요한 단계입니다.',
    },
  ];

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string | null>>(
    questions.reduce(
      (acc, question) => {
        acc[question.id] = null;
        return acc;
      },
      {} as Record<number, string | null>,
    ),
  );

  // Answer Visible Setting
  const [isAnswerVisible, setIsAnswerVisible] = useState<Record<number, boolean>>(
    questions.reduce(
      (acc, question) => {
        acc[question.id] = false;
        return acc;
      },
      {} as Record<number, boolean>,
    ),
  );

  // Answer Button Click
  const handleAnswerButtonClick = (questionId: number): void => {
    setIsAnswerVisible((prev) => {
      const isClosing = prev[questionId as number]; // 현재 정답 보기가 열려있는 상태인지 확인
      // 정답 닫기 시 선택 초기화
      if (isClosing) {
        setSelectedAnswers((prev) => ({
          ...prev,
          [questionId]: null, // 선택 초기화
        }));
      }
      return {
        ...prev,
        [questionId]: !isClosing, // 정답 보기 toggle
      };
    });
  };

  // Radio Button Click
  const handleAnswerChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    questionId: number,
  ): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId as number] === event.target.value ? null : event.target.value,
    }));
  };

  // Example Index Click
  const handleOptionClick = (optionValue: string, questionId: number): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId as number] === optionValue ? null : optionValue,
    }));
  };

  const MainSection3AnswerButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: 'var(--educoding-header)',
    borderRadius: '0px',
    fontFamily: 'bold, sans-serif',
    fontSize: '14px',
    width: '100px', // width 설정
    height: '70px', // height 설정
    minWidth: 'unset', // 기본 Button의 min-width를 제거
    borderRight: '1px solid var(--educoding-line)',
    '&:hover': {
      backgroundColor: 'var(--educoding-purple)',
    },
    '@media (max-width: 768px)': {
      fontSize: '12px', // 모바일에서는 폰트 크기를 줄임
      width: '100%',
      height: '50px',
      borderBottom: '1px solid var(--educoding-line)',
      borderRight: 'none',
    },
  }));

  const [randomQuestions, setRandomQuestions] = useState<QuestionType>([]);
  useEffect(() => {
    setRandomQuestions([...questions].sort(() => Math.random() - 0.5).slice(0, 2));
  }, []); // 빈 배열 `[]`을 넣어 처음 마운트될 때만 실행

  return (
    <MainSection3Container>
      <MiddleTitleContainer>
        <MiddleTitleBar />
        <MiddleTitle>정처기 랜덤문제풀이</MiddleTitle>
      </MiddleTitleContainer>
      <MainSection3ContentsContainer>
        {randomQuestions.map((question) => (
          <MainSection3Contents key={question.id}>
            <MainSection3TitleArea>
              <MainSection3TitleLeft>Q.</MainSection3TitleLeft>
              <MainSection3TitleRight>{question.question}</MainSection3TitleRight>
            </MainSection3TitleArea>
            <MainSection3ExamplesArea>
              {question.options.map((option) => (
                <MainSection3EachExample key={option.value}>
                  <MainSection3EachExampleLeft>
                    <Radio
                      checked={
                        isAnswerVisible[question.id]
                          ? option.value === question.correctAnswer // 정답 공개 시 정답 옵션만 checked
                          : selectedAnswers[question.id] === option.value // 클릭 시 사용자가 선택한 답변만 checked
                      }
                      onChange={(e) => handleAnswerChange(e, question.id)}
                      value={option.value}
                      name={`radio-buttons-${question.id}`}
                      inputProps={{ 'aria-label': option.value }}
                      color="secondary"
                      disabled={isAnswerVisible[question.id]} // 정답 보기 상태에서는 선택 불가
                    />
                  </MainSection3EachExampleLeft>
                  <MainSection3EachExampleRight
                    onClick={() => {
                      // 정답 보기 상태에서는 선택지 클릭을 막음
                      if (!isAnswerVisible[question.id]) {
                        handleOptionClick(option.value, question.id);
                      }
                    }}
                    style={{
                      color: isAnswerVisible[question.id]
                        ? option.value === question.correctAnswer
                          ? 'var(--educoding-purple)' // 정답일 경우 색상
                          : selectedAnswers[question.id] === option.value
                            ? 'red' // 틀린 답일 경우 색상
                            : ''
                        : selectedAnswers[question.id] === option.value
                          ? 'var(--educoding-purple)' // 사용자가 선택한 답일 경우 색상
                          : '',
                    }}
                  >
                    {option.label}
                    {/* '내가 선택한 답' 문구 추가 */}
                    {selectedAnswers[question.id] === option.value && (
                      <span
                        style={{
                          marginLeft: '10px',
                          marginTop: '2px',
                          color: 'gray',
                          fontSize: '11px',
                        }}
                      >
                        (내가 선택한 답)
                      </span>
                    )}
                  </MainSection3EachExampleRight>
                </MainSection3EachExample>
              ))}
            </MainSection3ExamplesArea>
            {selectedAnswers[question.id] ? (
              <MainSection3AnswerArea>
                <MainSection3AnswerButton onClick={() => handleAnswerButtonClick(question.id)}>
                  {isAnswerVisible[question.id] ? '정답 닫기' : '정답 보기'}
                </MainSection3AnswerButton>

                {isAnswerVisible[question.id] ? (
                  <MainSection3AnswerText>
                    <MainSection3AnswerTextLine>
                      <MainSection3AnswerTextLeft>채점</MainSection3AnswerTextLeft>
                      <MainSection3AnswerTextRight
                        style={{
                          color:
                            selectedAnswers[question.id] === question.correctAnswer
                              ? 'green'
                              : 'red',
                        }}
                      >
                        {selectedAnswers[question.id] === question.correctAnswer
                          ? '맞았습니다.'
                          : '틀렸습니다.'}
                      </MainSection3AnswerTextRight>
                    </MainSection3AnswerTextLine>
                    <MainSection3AnswerTextLine>
                      <MainSection3AnswerTextLeft>정답</MainSection3AnswerTextLeft>
                      <MainSection3AnswerTextRight>
                        {
                          question.options.find((option) => option.value === question.correctAnswer)
                            ?.label
                        }
                      </MainSection3AnswerTextRight>
                    </MainSection3AnswerTextLine>
                    <MainSection3AnswerTextLine>
                      <MainSection3AnswerTextLeft>설명</MainSection3AnswerTextLeft>
                      <MainSection3AnswerTextRight>
                        {question.explanation}
                      </MainSection3AnswerTextRight>
                    </MainSection3AnswerTextLine>
                  </MainSection3AnswerText>
                ) : null}
              </MainSection3AnswerArea>
            ) : null}
          </MainSection3Contents>
        ))}
      </MainSection3ContentsContainer>
    </MainSection3Container>
  );
};

export default MainSection3;
