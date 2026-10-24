import React from 'react';

import { CodingTest_CodeResultConsole as CssWrapper } from '../../../styles/codingtest/CodingTest_CodeResultConsole';
import { CodeResultConsoleProps } from '../CodingTestType';

const CodingTest_CodeResultConsole: React.FC<CodeResultConsoleProps> = ({ message }) => {
  return (
    <CssWrapper>
      <div className="console-outputs">{message}</div>
    </CssWrapper>
  );
};

export default CodingTest_CodeResultConsole;
