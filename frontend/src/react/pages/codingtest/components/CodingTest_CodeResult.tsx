import React from 'react';

import Console from './CodingTest_CodeResultConsole';
import { CodingTest_CodeResult as CssWrapper } from '../../../styles/codingtest/CodingTest_CodeResult';
import { CodeResultProps, FailureCauseMap, FailureCauseType } from '../CodingTestType';

const CodingTest_CodeResult: React.FC<CodeResultProps> = ({ results }) => {
  const isFailureCauseType = (cause: string | undefined): cause is FailureCauseType => {
    return !!cause && cause in FailureCauseMap;
  };

  const renderError = () => {
    if (!results) return null;

    const errorEntry = Object.entries(results).find(([idx]) => idx === '-1');
    if (!errorEntry) return null;

    const [, errorResult] = errorEntry;
    const { failureCause, failureDetail } = errorResult as {
      failureCause: string;
      failureDetail: string | null;
    };

    return (
      <div className="error-container">
        {failureCause && isFailureCauseType(failureCause) ? (
          <strong className="error-title">{FailureCauseMap[failureCause]}</strong>
        ) : (
          failureCause && <p className="error-title">{failureCause} (알 수 없는 오류)</p>
        )}
        <Console message={failureDetail ?? ''} />
      </div>
    );
  };

  const renderResults = () => {
    if (!results || !Object.keys(results).length) {
      return <p>코드 실행 결과가 여기에 표시됩니다.</p>;
    }

    if (results['-1']) {
      return renderError();
    }

    return (
      <ul>
        {Object.entries(results).map(([idx, result]) => {
          const { passed, memoryUsageMb, elapsedTimeMs } = result as {
            passed: boolean;
            memoryUsageMb: number | null;
            elapsedTimeMs: number | null;
          };

          const isPending = Object.keys(result).length === 0;

          return (
            <li key={idx}>
              <strong>
                {isPending ? `[테스트 케이스 ${idx}] 채점 중 ⏳` : `[테스트 케이스 ${idx}]`}
              </strong>
              {!isPending && (
                <>
                  <p>채점 결과: {passed ? '통과 ✅' : '실패 ❌'}</p>
                  {memoryUsageMb !== null && <p>메모리 사용량: {memoryUsageMb}MB</p>}
                  {elapsedTimeMs !== null && <p>실행 시간: {elapsedTimeMs}ms</p>}
                </>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <CssWrapper>
      <div>
        <span>결과 출력</span>
      </div>
      <div>{renderResults()}</div>
    </CssWrapper>
  );
};

export default CodingTest_CodeResult;
