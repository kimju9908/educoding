import { JSX, useLayoutEffect } from 'react';

import { useNavigate, useOutletContext } from 'react-router-dom';

import {
  MobileInner,
  PageSubContainer,
  PageSubTitleBarCodingTest,
  PageSubTitleBarLeftBox,
  PageSubTitleBarRightArrow,
  PageSubTitleBarRightBox,
  PageSubTitleBarRightText,
  PCInner,
  StyledTD,
  StyledTH,
  StyledTR,
  TableBox,
} from '../../../../styles/mypage/MyPage_Dashboard';
import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
} from '../../../../styles/mypage/MyPage_Main';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';
import { CodingTestData, HeaderType, OutletContextType, TableObject } from '../../MyPageType';

const MyPage_CodingTest = (): JSX.Element => {
  const navigate = useNavigate();
  const mainContentRef = useOutletContext<OutletContextType>();

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  // Practice onClick
  const handlePractice = (): void => {
    navigate('/codingtest/practice');
  };

  // Basic onClick
  const handleBasic = (): void => {
    navigate('/codingtest/basic');
  };

  // Practice onClick
  const handleIntermediate = (): void => {
    navigate('/codingtest/intermediate');
  };

  // Practice onClick
  const handleExpert = (): void => {
    navigate('/codingtest/expert');
  };

  const headers: HeaderType = [
    '단계',
    '언어',
    '맞은문제',
    '틀린문제',
    '시간초과',
    '메모리초과',
    '런타임에러',
    '컴파일에러',
    '제출',
    '정답비율',
  ];

  const practiceData: CodingTestData = [
    ['연습문제', 'Java', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['연습문제', 'Python', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['연습문제', 'C', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['연습문제', 'C++', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['연습문제', 'C#', '-', '-', '-', '-', '-', '-', '-', '-'],
  ];

  const basicData: CodingTestData = [
    ['1단계', 'Java', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['1단계', 'Python', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['1단계', 'C', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['1단계', 'C++', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['1단계', 'C#', '-', '-', '-', '-', '-', '-', '-', '-'],
  ];

  const intermediateData: CodingTestData = [
    ['2단계', 'Java', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['2단계', 'Python', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['2단계', 'C', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['2단계', 'C++', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['2단계', 'C#', '-', '-', '-', '-', '-', '-', '-', '-'],
  ];

  const expertData: CodingTestData = [
    ['3단계', 'Java', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['3단계', 'Python', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['3단계', 'C', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['3단계', 'C++', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['3단계', 'C#', '-', '-', '-', '-', '-', '-', '-', '-'],
  ];

  // 행과 열을 바꾸는 함수 (Transpose)
  const transpose = (arr: CodingTestData): CodingTestData =>
    arr[0].map((_, colIndex) => arr.map((row) => row[colIndex as number]));

  // PC 테이블
  const PCTable = ({ data }: TableObject): JSX.Element => (
    <TableBox>
      <StyledTH>
        {headers.map((header, index) => (
          <StyledTD key={index}>{header}</StyledTD>
        ))}
      </StyledTH>
      {data.map((row, rowIndex) => (
        <StyledTR key={rowIndex}>
          {row.map((cell, colIndex) => (
            <StyledTD key={colIndex}>{cell}</StyledTD>
          ))}
        </StyledTR>
      ))}
    </TableBox>
  );

  // MO 테이블 (행열 변환)
  const MobileTable = ({ data }: TableObject): JSX.Element => {
    const transposedData = transpose([headers, ...data]); // headers 포함하여 데이터 변환
    return (
      <TableBox>
        <tbody>
          {transposedData.map((row, rowIndex) => (
            <StyledTR key={rowIndex}>
              {row.map((cell, colIndex) => {
                // 첫 번째 열에는 background-color만 변경
                if (colIndex === 0) {
                  return (
                    <StyledTD key={colIndex} style={{ backgroundColor: 'var(--educoding-dark)' }}>
                      {cell}
                    </StyledTD>
                  );
                }
                // 나머지 셀은 그대로 StyledTD로 표시
                return <StyledTD key={colIndex}>{cell}</StyledTD>;
              })}
            </StyledTR>
          ))}
        </tbody>
      </TableBox>
    );
  };

  return (
    <>
      <Wrap>
        <Container>
          <LeftContainer>
            <LeftTopProfile />
            <LeftMenus />
          </LeftContainer>
          <RightContainer>
            <PageTitleBar>공부방</PageTitleBar>
            <PageSubContainer>
              <PageSubTitleBarCodingTest>
                <PageSubTitleBarLeftBox>코딩테스트 연습문제</PageSubTitleBarLeftBox>
                <PageSubTitleBarRightBox onClick={() => handlePractice()}>
                  <PageSubTitleBarRightText>연습문제 바로가기</PageSubTitleBarRightText>
                  <PageSubTitleBarRightArrow>{`>`}</PageSubTitleBarRightArrow>
                </PageSubTitleBarRightBox>
              </PageSubTitleBarCodingTest>
              <PCInner>
                <PCTable data={practiceData} />
              </PCInner>
              <MobileInner>
                <MobileTable data={practiceData} />
              </MobileInner>
            </PageSubContainer>
            <PageSubContainer>
              <PageSubTitleBarCodingTest>
                <PageSubTitleBarLeftBox>코딩테스트 1단계</PageSubTitleBarLeftBox>
                <PageSubTitleBarRightBox onClick={() => handleBasic()}>
                  <PageSubTitleBarRightText>1단계 바로가기</PageSubTitleBarRightText>
                  <PageSubTitleBarRightArrow>{`>`}</PageSubTitleBarRightArrow>
                </PageSubTitleBarRightBox>
              </PageSubTitleBarCodingTest>
              <PCInner>
                <PCTable data={basicData} />
              </PCInner>
              <MobileInner>
                <MobileTable data={basicData} />
              </MobileInner>
            </PageSubContainer>
            <PageSubContainer>
              <PageSubTitleBarCodingTest>
                <PageSubTitleBarLeftBox>코딩테스트 2단계</PageSubTitleBarLeftBox>
                <PageSubTitleBarRightBox onClick={() => handleIntermediate()}>
                  <PageSubTitleBarRightText>2단계 바로가기</PageSubTitleBarRightText>
                  <PageSubTitleBarRightArrow>{`>`}</PageSubTitleBarRightArrow>
                </PageSubTitleBarRightBox>
              </PageSubTitleBarCodingTest>
              <PCInner>
                <PCTable data={intermediateData} />
              </PCInner>
              <MobileInner>
                <MobileTable data={intermediateData} />
              </MobileInner>
            </PageSubContainer>
            <PageSubContainer>
              <PageSubTitleBarCodingTest>
                <PageSubTitleBarLeftBox>코딩테스트 3단계</PageSubTitleBarLeftBox>
                <PageSubTitleBarRightBox onClick={() => handleExpert()}>
                  <PageSubTitleBarRightText>3단계 바로가기</PageSubTitleBarRightText>
                  <PageSubTitleBarRightArrow>{`>`}</PageSubTitleBarRightArrow>
                </PageSubTitleBarRightBox>
              </PageSubTitleBarCodingTest>
              <PCInner>
                <PCTable data={expertData} />
              </PCInner>
              <MobileInner>
                <MobileTable data={expertData} />
              </MobileInner>
            </PageSubContainer>
          </RightContainer>
        </Container>
      </Wrap>
    </>
  );
};

export default MyPage_CodingTest;
