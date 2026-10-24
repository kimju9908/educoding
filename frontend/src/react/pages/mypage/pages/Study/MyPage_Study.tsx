import { JSX, useLayoutEffect, useState } from 'react';

import { useNavigate, useOutletContext } from 'react-router-dom';

import {
  StudyEachSubject,
  StudySubjectContainer,
  StudySubjectHoverArrow,
  StudySubjectHoverContainer,
  StudySubjectHoverText,
  StudySubjectIMG,
  StudySubjectName,
  StudySubjectRateContainer,
  StudySubjectRateDot,
  StudySubjectRateText,
} from '../../../../styles/mypage/MyPage_Dashboard';
import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  PageSubTitleBar,
} from '../../../../styles/mypage/MyPage_Main';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';
import { OutletContextType } from '../../MyPageType';

const MyPage_Study = (): JSX.Element => {
  const navigate = useNavigate();
  const mainContentRef = useOutletContext<OutletContextType>();
  const [isJavaHovered, setIsJavaHovered] = useState<boolean>(false);
  const [isPythonHovered, setIsPythonHovered] = useState<boolean>(false);
  const [isCHovered, setIsCHovered] = useState<boolean>(false);
  const [isCPlusHovered, setIsCPlusHovered] = useState<boolean>(false);
  const [isJavaScriptHovered, setIsJavaScriptHovered] = useState<boolean>(false);

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  // Java onClick
  const handleJavaCheck = (): void => {
    navigate('/study/java');
  };

  // Python onClick
  const handlePythonCheck = (): void => {
    navigate('/study/python');
  };

  // C onClick
  const handleCCheck = (): void => {
    navigate('/study/c');
  };

  // C++ onClick
  const handleCPlusCheck = (): void => {
    navigate('/study/cplus');
  };

  // JavaScript onClick
  const handleJavaScriptCheck = (): void => {
    navigate('/study/javascript');
  };
  type ProgressValueType = Record<'Java' | 'C' | 'CPlus' | 'JavaScript' | 'Python', number>;
  const progressValues: ProgressValueType = {
    Java: 0,
    C: 0,
    CPlus: 0,
    JavaScript: 0,
    Python: 0,
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
            <PageSubTitleBar>언어공부</PageSubTitleBar>
            <StudySubjectContainer>
              <StudyEachSubject
                onMouseEnter={() => setIsJavaHovered(true)}
                onMouseLeave={() => setIsJavaHovered(false)}
                onClick={() => handleJavaCheck()}
              >
                <StudySubjectIMG
                  style={{ backgroundImage: 'url(/images/program/java_full.png)' }}
                />
                <StudySubjectName>Java</StudySubjectName>
                {isJavaHovered ? (
                  <StudySubjectHoverContainer>
                    {progressValues.Java === 0 ? (
                      <>
                        <StudySubjectHoverText>Java 학습 전입니다.</StudySubjectHoverText>
                      </>
                    ) : progressValues.Java === 100 ? (
                      <>
                        <StudySubjectHoverText>Java 학습을 완료했습니다.</StudySubjectHoverText>
                      </>
                    ) : (
                      <>
                        <StudySubjectHoverText>00. 챕터명</StudySubjectHoverText>
                        <StudySubjectHoverArrow>{`>`}</StudySubjectHoverArrow>
                        <StudySubjectHoverText>클래스명</StudySubjectHoverText>
                      </>
                    )}
                  </StudySubjectHoverContainer>
                ) : (
                  <StudySubjectRateContainer>
                    {progressValues.Java === 0 ? (
                      <StudySubjectRateText>학습전</StudySubjectRateText>
                    ) : progressValues.Java === 100 ? (
                      <StudySubjectRateText>학습 완료</StudySubjectRateText>
                    ) : (
                      <>
                        <StudySubjectRateText>
                          `${progressValues.Java}% 학습중`
                        </StudySubjectRateText>
                        <StudySubjectRateDot />
                      </>
                    )}
                  </StudySubjectRateContainer>
                )}
              </StudyEachSubject>
              <StudyEachSubject
                onMouseEnter={() => setIsPythonHovered(true)}
                onMouseLeave={() => setIsPythonHovered(false)}
                onClick={() => handlePythonCheck()}
              >
                <StudySubjectIMG
                  style={{ backgroundImage: 'url(/images/program/python_full.png)' }}
                />
                <StudySubjectName>Python</StudySubjectName>
                {isPythonHovered ? (
                  <StudySubjectHoverContainer>
                    {progressValues.Python === 0 ? (
                      <>
                        <StudySubjectHoverText>Python 학습 전입니다.</StudySubjectHoverText>
                      </>
                    ) : progressValues.Python === 100 ? (
                      <>
                        <StudySubjectHoverText>Python 학습을 완료했습니다.</StudySubjectHoverText>
                      </>
                    ) : (
                      <>
                        <StudySubjectHoverText>00. 챕터명</StudySubjectHoverText>
                        <StudySubjectHoverArrow>{`>`}</StudySubjectHoverArrow>
                        <StudySubjectHoverText>클래스명</StudySubjectHoverText>
                      </>
                    )}
                  </StudySubjectHoverContainer>
                ) : (
                  <StudySubjectRateContainer>
                    {progressValues.Python === 0 ? (
                      <StudySubjectRateText>학습전</StudySubjectRateText>
                    ) : progressValues.Python === 100 ? (
                      <StudySubjectRateText>학습 완료</StudySubjectRateText>
                    ) : (
                      <>
                        <StudySubjectRateText>
                          `${progressValues.Python}% 학습중`
                        </StudySubjectRateText>
                        <StudySubjectRateDot />
                      </>
                    )}
                  </StudySubjectRateContainer>
                )}
              </StudyEachSubject>
              <StudyEachSubject
                onMouseEnter={() => setIsCHovered(true)}
                onMouseLeave={() => setIsCHovered(false)}
                onClick={() => handleCCheck()}
              >
                <StudySubjectIMG style={{ backgroundImage: 'url(/images/program/c_full.png)' }} />
                <StudySubjectName>C</StudySubjectName>
                {isCHovered ? (
                  <StudySubjectHoverContainer>
                    {progressValues.C === 0 ? (
                      <>
                        <StudySubjectHoverText>C 학습 전입니다.</StudySubjectHoverText>
                      </>
                    ) : progressValues.C === 100 ? (
                      <>
                        <StudySubjectHoverText>C 학습을 완료했습니다.</StudySubjectHoverText>
                      </>
                    ) : (
                      <>
                        <StudySubjectHoverText>00. 챕터명</StudySubjectHoverText>
                        <StudySubjectHoverArrow>{`>`}</StudySubjectHoverArrow>
                        <StudySubjectHoverText>클래스명</StudySubjectHoverText>
                      </>
                    )}
                  </StudySubjectHoverContainer>
                ) : (
                  <StudySubjectRateContainer>
                    {progressValues.C === 0 ? (
                      <StudySubjectRateText>학습전</StudySubjectRateText>
                    ) : progressValues.C === 100 ? (
                      <StudySubjectRateText>학습 완료</StudySubjectRateText>
                    ) : (
                      <>
                        <StudySubjectRateText>`${progressValues.C}% 학습중`</StudySubjectRateText>
                        <StudySubjectRateDot />
                      </>
                    )}
                  </StudySubjectRateContainer>
                )}
              </StudyEachSubject>
              <StudyEachSubject
                onMouseEnter={() => setIsCPlusHovered(true)}
                onMouseLeave={() => setIsCPlusHovered(false)}
                onClick={() => handleCPlusCheck()}
              >
                <StudySubjectIMG
                  style={{ backgroundImage: 'url(/images/program/cplus_full.png)' }}
                />
                <StudySubjectName>C++</StudySubjectName>
                {isCPlusHovered ? (
                  <StudySubjectHoverContainer>
                    {progressValues.CPlus === 0 ? (
                      <>
                        <StudySubjectHoverText>C++ 학습 전입니다.</StudySubjectHoverText>
                      </>
                    ) : progressValues.CPlus === 100 ? (
                      <>
                        <StudySubjectHoverText>C++ 학습을 완료했습니다.</StudySubjectHoverText>
                      </>
                    ) : (
                      <>
                        <StudySubjectHoverText>00. 챕터명</StudySubjectHoverText>
                        <StudySubjectHoverArrow>{`>`}</StudySubjectHoverArrow>
                        <StudySubjectHoverText>클래스명</StudySubjectHoverText>
                      </>
                    )}
                  </StudySubjectHoverContainer>
                ) : (
                  <StudySubjectRateContainer>
                    {progressValues.CPlus === 0 ? (
                      <StudySubjectRateText>학습전</StudySubjectRateText>
                    ) : progressValues.CPlus === 100 ? (
                      <StudySubjectRateText>학습 완료</StudySubjectRateText>
                    ) : (
                      <>
                        <StudySubjectRateText>
                          `${progressValues.CPlus}% 학습중`
                        </StudySubjectRateText>
                        <StudySubjectRateDot />
                      </>
                    )}
                  </StudySubjectRateContainer>
                )}
              </StudyEachSubject>
              <StudyEachSubject
                onMouseEnter={() => setIsJavaScriptHovered(true)}
                onMouseLeave={() => setIsJavaScriptHovered(false)}
                onClick={() => handleJavaScriptCheck()}
              >
                <StudySubjectIMG style={{ backgroundImage: 'url(/images/program/js_full.png)' }} />
                <StudySubjectName>JavaScript</StudySubjectName>
                {isJavaScriptHovered ? (
                  <StudySubjectHoverContainer>
                    {progressValues.JavaScript === 0 ? (
                      <>
                        <StudySubjectHoverText>JavaScript 학습 전입니다.</StudySubjectHoverText>
                      </>
                    ) : progressValues.JavaScript === 100 ? (
                      <>
                        <StudySubjectHoverText>
                          JavaScript 학습을 완료했습니다.
                        </StudySubjectHoverText>
                      </>
                    ) : (
                      <>
                        <StudySubjectHoverText>00. 챕터명</StudySubjectHoverText>
                        <StudySubjectHoverArrow>{`>`}</StudySubjectHoverArrow>
                        <StudySubjectHoverText>클래스명</StudySubjectHoverText>
                      </>
                    )}
                  </StudySubjectHoverContainer>
                ) : (
                  <StudySubjectRateContainer>
                    {progressValues.JavaScript === 0 ? (
                      <StudySubjectRateText>학습전</StudySubjectRateText>
                    ) : progressValues.JavaScript === 100 ? (
                      <StudySubjectRateText>학습 완료</StudySubjectRateText>
                    ) : (
                      <>
                        <StudySubjectRateText>
                          `${progressValues.JavaScript}% 학습중`
                        </StudySubjectRateText>
                        <StudySubjectRateDot />
                      </>
                    )}
                  </StudySubjectRateContainer>
                )}
              </StudyEachSubject>
            </StudySubjectContainer>
          </RightContainer>
        </Container>
      </Wrap>
    </>
  );
};

export default MyPage_Study;
