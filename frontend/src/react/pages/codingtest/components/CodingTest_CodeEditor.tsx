import { useEffect, useState, useRef } from 'react';

import { Editor, OnMount, Monaco } from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { CodingTest_CodeEditor as CssWrapper } from '../../../styles/codingtest/CodingTest_CodeEditor';
import { CodeEditorProps } from '../CodingTestType';

const mapToMonacoLanguage = (lang: string): string => {
  const lowercaseLang = lang.toLowerCase();
  if (lowercaseLang === 'nodejs' || lowercaseLang === 'nodejsesm') {
    return 'javascript';
  }
  return lowercaseLang;
};

const CodingTest_CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  setLanguage,
  value,
  setValue,
  handleSubmitButtonClick,
  handleCancelButtonClick,
  isConnectedRef,
}) => {
  const [isButtonHovered, setIsButtonHovered] = useState<boolean>(false);
  const theme = useTheme();
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null); // Parameters<OnMount>[0]는 editor 매개변수의 타입을 추출
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    setEditorTheme(theme.palette.mode === 'dark' ? 'vs-dark' : 'vs');
  }, [theme.palette.mode]); // MUI 테마 변경 시 반영

  // Monaco Editor 모델 언어 설정 업데이트
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const currentModel = editorRef.current.getModel();

      if (currentModel) {
        const monacoLanguage = mapToMonacoLanguage(language);
        monacoRef.current.editor.setModelLanguage(currentModel, monacoLanguage);
      }
    }
  }, [language]);

  type ResizeObserverConstructor = {
    new (callback: ResizeObserverCallback): ResizeObserver;
    prototype: ResizeObserver;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // 정적 속성을 포함하는 타입
  };
  /**
   * [설명]
   * Monaco Editor를 사용할 때 automaticLayout=true로 설정한 경우
   * 종종 ResizeObserver loop limit exceeded 에러가 발생하는 버그를 해결하기 위해 적용
   * https://github.com/microsoft/vscode/issues/183324
   *
   * [동작]
   * 브라우저에 할당된 ResizeObserver를 최적화된 버전으로 재할당
   */
  useEffect(() => {
    // Save a reference to the original ResizeObserver
    const OriginalResizeObserver: ResizeObserverConstructor = window.ResizeObserver;

    // // Create a new ResizeObserver constructor
    // window.ResizeObserver = function (callback: ResizeObserverCallback): ResizeObserver {
    //   const wrappedCallback: ResizeObserverCallback = (entries, observer): void => {
    //     window.requestAnimationFrame(() => {
    //       callback(entries, observer);
    //     });
    //   };

    //   // Create an instance of the original ResizeObserver
    //   // with the wrapped callback
    //   return new OriginalResizeObserver(wrappedCallback);
    // }; // 기존 코드
    class PatchedResizeObserver extends window.ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        super((entries, observer) => {
          window.requestAnimationFrame(() => {
            callback(entries, observer);
          });
        });
      }
    }

    // 기존 `ResizeObserver`를 `PatchedResizeObserver`로 교체
    window.ResizeObserver = PatchedResizeObserver;

    // // Copy over static methods, if any
    // for (const staticMethod in OriginalResizeObserver) {
    //   if (Object.prototype.hasOwnProperty.call(OriginalResizeObserver, staticMethod)) {
    //     window.ResizeObserver[staticMethod] = OriginalResizeObserver[staticMethod];
    //   }
    // } // 기존 코드
    Object.keys(OriginalResizeObserver).forEach((staticMethod) => {
      // eslint-disable-next-line security/detect-object-injection
      (window.ResizeObserver as ResizeObserverConstructor)[staticMethod] =
        // eslint-disable-next-line security/detect-object-injection
        OriginalResizeObserver[staticMethod];
    });

    // 클린업 함수: 원래의 ResizeObserver로 복원
    return (): void => {
      window.ResizeObserver = OriginalResizeObserver;
    };
  }, []);

  // Monaco Editor onMount 핸들러
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.focus();

    // 초기 언어 설정
    const initialLanguage = mapToMonacoLanguage(language);

    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, initialLanguage);
    }
  };

  return (
    <CssWrapper>
      <div>
        <span>코드 입력</span>
        <div>
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <Select
              style={{
                color: 'var(--educoding-white)',
                fontSize: '12px',
                width: '120px',
                height: '30px',
              }}
              value={language}
              onChange={(event) => {
                setLanguage(event.target.value);
              }}
            >
              <MenuItem style={{ fontSize: '12px' }} value={'java'}>
                Java
              </MenuItem>
              <MenuItem style={{ fontSize: '12px' }} value={'c'}>
                C
              </MenuItem>
              <MenuItem style={{ fontSize: '12px' }} value={'cpp'}>
                C++
              </MenuItem>
              <MenuItem style={{ fontSize: '12px' }} value={'python'}>
                Python
              </MenuItem>
              <MenuItem style={{ fontSize: '12px' }} value={'nodejs'}>
                NodeJS
              </MenuItem>
              <MenuItem style={{ fontSize: '12px' }} value={'nodejsesm'}>
                NodeJS (ESM)
              </MenuItem>
            </Select>
          </FormControl>
          <button
            style={{ display: isConnectedRef.current ? 'none' : '' }}
            className="run-btn"
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            onClick={handleSubmitButtonClick}
          >
            <img src="/images/icon/run_code.png" />
            <p style={{ display: isButtonHovered ? 'inline-block' : 'none' }}>코드를 실행합니다.</p>
          </button>
          <button
            style={{ display: isConnectedRef.current ? '' : 'none' }}
            className="stop-btn"
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            onClick={handleCancelButtonClick}
          >
            <img src="/images/icon/stop_code.png" />
            <p style={{ display: isButtonHovered ? 'inline-block' : 'none' }}>실행을 중지합니다.</p>
          </button>
        </div>
      </div>
      <Editor
        height="calc(100% - 49px)"
        defaultLanguage={mapToMonacoLanguage(language)}
        onMount={handleEditorDidMount}
        // theme="vs-dark"
        theme={editorTheme}
        value={value}
        onChange={(value) => setValue(value as string)}
        options={{
          scrollBeyondLastLine: false, // 마지막 줄 이후로 스크롤 X
          tabSize: 2, // 탭 크기 설정 (2칸)
          minimap: {
            enabled: false,
          },
          automaticLayout: true,
        }}
      />
    </CssWrapper>
  );
};

export default CodingTest_CodeEditor;
