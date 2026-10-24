import { useEffect, useState } from 'react';

import { Button, Radio } from '@mui/material';
import { purple } from '@mui/material/colors';
import { styled } from '@mui/material/styles';

import ExamApi from '../../../../api/AxiosApi/ExamApi/ExamApi';
import { ExamData } from '../../../../api/AxiosApi/ExamApi/ExamApiType';
import {
  EachQuest,
  ExamContainer,
  ExamContentsContainer,
  ExamHeader,
  ExamHeaderTitle,
  QuestAnswerArea,
  QuestAnswerText,
  QuestAnswerTextEachLine,
  QuestAnswerTextLeft,
  QuestAnswerTextRight,
  QuestEachExample,
  QuestEachExampleLeft,
  QuestEachExampleRight,
  QuestExamplesArea,
  QuestTitleArea,
  QuestTitleLeft,
  QuestTitleRight,
} from '../../../styles/exam/Exam_Exam';
import { AnswerVisibility, ExamListProps, SelectedAnswers } from '../ExamType';

// 페이지당 문제 수
const ITEMS_PER_PAGE = 10;

const Exam_Mock_Random_Data: React.FC<ExamListProps> = () => {
  const [examData, setExamData] = useState<ExamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnswerVisible, setIsAnswerVisible] = useState<AnswerVisibility>({});
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [currentPage] = useState(1);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        // 5개의 모의고사 데이터를 모두 받아오기
        const response1 = await ExamApi.getMockData01();
        const response2 = await ExamApi.getMockData02();
        const response3 = await ExamApi.getMockData03();
        const response4 = await ExamApi.getMockData04();
        const response5 = await ExamApi.getMockData05();

        // 데이터를 하나로 합치기
        const allMockData = [...response1, ...response2, ...response3, ...response4, ...response5];

        // 랜덤으로 10문제 선택
        const randomMockData: any[] = [];
        while (randomMockData.length < ITEMS_PER_PAGE) {
          const randomIndex = Math.floor(Math.random() * allMockData.length);
          const randomQuestion = allMockData[randomIndex];
          if (!randomMockData.includes(randomQuestion)) {
            randomMockData.push(randomQuestion);
          }
        }
        setExamData(randomMockData);
      } catch (error) {
        setError('데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (examData) {
      const initialAnswerVisibility: AnswerVisibility = {};
      const initialSelectedAnswers: SelectedAnswers = {};
      // examData.data가 배열이므로 배열 순회
      examData.forEach((question: ExamData) => {
        initialAnswerVisibility[question.qnumber] = false;
        initialSelectedAnswers[question.qnumber] = '';
      });
      setIsAnswerVisible(initialAnswerVisibility);
      setSelectedAnswers(initialSelectedAnswers);
    }
  }, [examData]);

  if (loading)
    return (
      <div
        style={{
          color: 'var(--educoding-white)',
          fontFamily: 'bold',
          textAlign: 'center',
          paddingTop: '50px',
          fontSize: '14px',
        }}
      >
        😇 데이터 가져오는중
      </div>
    );
  if (error)
    return (
      <div
        style={{
          color: 'var(--educoding-white)',
          fontFamily: 'bold',
          textAlign: 'center',
          paddingTop: '50px',
          fontSize: '14px',
        }}
      >
        😓 {error}
      </div>
    );

  const handleAnswerButtonClick = (questionId: number): void => {
    setIsAnswerVisible((prev) => {
      const isClosing = prev[questionId];
      if (isClosing) {
        setSelectedAnswers((prev) => ({
          ...prev,
          [questionId]: '',
        }));
      }
      return {
        ...prev,
        [questionId]: !isClosing,
      };
    });
  };

  const handleAnswerChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    questionId: number,
  ): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: event.target.value,
    }));
  };

  const handleOptionClick = (optionValue: string, questionId: number): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === optionValue ? '' : optionValue,
    }));
  };

  const QuestAnswerButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: 'var(--educoding-header)',
    borderRadius: '0px',
    fontFamily: 'bold, sans-serif',
    fontSize: '14px',
    width: '100px', // width 설정
    minWidth: 'unset', // 기본 Button의 min-width를 제거
    borderRight: '1px solid var(--educoding-line)',
    '&:hover': {
      backgroundColor: 'var(--educoding-purple)',
    },
    '@media (max-width: 768px)': {
      fontSize: '12px', // 모바일에서는 폰트 크기를 줄임
      width: '100%',
      height: '50px',
      borderRight: 'none',
    },
  }));

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentQuests = examData ? examData.slice(startIdx, startIdx + ITEMS_PER_PAGE) : [];
  const totalPages = examData ? Math.ceil(examData.length / ITEMS_PER_PAGE) : 0;

  return (
    <ExamContainer>
      <ExamHeader>
        <ExamHeaderTitle>모의시험 {` > `} 랜덤문제풀이</ExamHeaderTitle>
      </ExamHeader>
      <ExamContentsContainer>
        {currentQuests.map((mock, index) => (
          <EachQuest key={index}>
            <QuestTitleArea>
              <QuestTitleLeft>Q.</QuestTitleLeft>
              <QuestTitleRight>
                {mock.qname1}
                <br />
                {mock.qname2 ? (
                  <img src={mock.qname2} style={{ width: '100%', height: 'auto' }} />
                ) : null}
              </QuestTitleRight>
            </QuestTitleArea>
            <QuestExamplesArea>
              {[mock.example1, mock.example2, mock.example3, mock.example4].map((example, idx) => (
                <QuestEachExample key={idx}>
                  <QuestEachExampleLeft>
                    <Radio
                      checked={
                        isAnswerVisible[mock.qnumber]
                          ? example === mock.answer
                          : selectedAnswers[mock.qnumber] === example
                      }
                      onChange={(e) => handleAnswerChange(e, mock.qnumber)}
                      value={example}
                      name={`radio-buttons-${mock.qnumber}`}
                      inputProps={{ 'aria-label': example }}
                      color="secondary"
                      disabled={isAnswerVisible[mock.qnumber]} // 정답 보기 상태에서는 선택 불가
                    />
                  </QuestEachExampleLeft>
                  <QuestEachExampleRight
                    onClick={() => {
                      if (!isAnswerVisible[mock.qnumber]) {
                        // 정답 보기 상태에서는 선택지 클릭을 막음
                        handleOptionClick(example, mock.qnumber);
                      }
                    }}
                    style={{
                      color: isAnswerVisible[mock.qnumber]
                        ? example === mock.answer
                          ? 'var(--educoding-purple)' // 정답일 경우 색상
                          : selectedAnswers[mock.qnumber] === example
                            ? 'red' // 틀린 답일 경우 색상
                            : '' // 정답도 아니고 틀린 답도 아닌 경우 색상
                        : selectedAnswers[mock.qnumber] === example
                          ? 'var(--educoding-purple)' // 사용자가 선택한 답일 경우 색상 (정답일 경우 보라색)
                          : '', // 선택되지 않은 답은 기본 색상
                    }}
                  >
                    {example.slice(1).trimStart()}
                    {/* '내가 선택한 답' 문구 추가 */}
                    {selectedAnswers[mock.qnumber] === example && (
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
                  </QuestEachExampleRight>
                </QuestEachExample>
              ))}
            </QuestExamplesArea>
            {selectedAnswers[mock.qnumber] ? (
              <QuestAnswerArea>
                <QuestAnswerButton onClick={() => handleAnswerButtonClick(mock.qnumber)}>
                  {isAnswerVisible[mock.qnumber] ? '정답 닫기' : '정답 보기'}
                </QuestAnswerButton>
                {isAnswerVisible[mock.qnumber] ? (
                  <QuestAnswerText>
                    <QuestAnswerTextEachLine>
                      <QuestAnswerTextLeft>채점</QuestAnswerTextLeft>
                      <QuestAnswerTextRight
                        style={{
                          color: selectedAnswers[mock.qnumber] === mock.answer ? 'green' : 'red',
                        }}
                      >
                        {selectedAnswers[mock.qnumber] === mock.answer
                          ? '맞았습니다.'
                          : '틀렸습니다.'}
                      </QuestAnswerTextRight>
                    </QuestAnswerTextEachLine>
                    <QuestAnswerTextEachLine>
                      <QuestAnswerTextLeft>정답</QuestAnswerTextLeft>
                      <QuestAnswerTextRight>
                        {mock.answer.slice(1).trimStart()}
                      </QuestAnswerTextRight>
                    </QuestAnswerTextEachLine>
                    <QuestAnswerTextEachLine>
                      <QuestAnswerTextLeft>설명</QuestAnswerTextLeft>
                      <QuestAnswerTextRight>{mock.explain}</QuestAnswerTextRight>
                    </QuestAnswerTextEachLine>
                  </QuestAnswerText>
                ) : null}
              </QuestAnswerArea>
            ) : null}
          </EachQuest>
        ))}
      </ExamContentsContainer>
      {/* <Stack spacing={2} alignItems="center" sx={{ marginTop: '20px' }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(event, value) => setCurrentPage(value)}
          color="secondary"
        />
      </Stack> */}
    </ExamContainer>
  );
};

export default Exam_Mock_Random_Data;
