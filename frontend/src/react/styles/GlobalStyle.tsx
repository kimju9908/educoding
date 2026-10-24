import { createGlobalStyle } from 'styled-components';

import Fonts from './fonts';

interface GlobalStyleProps {
  mode: 'light' | 'dark'; // mode 타입 정의
}

const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
  ${Fonts}

  /*
   * 색상 토큰 — 기존 변수 이름은 그대로 두고 값만 인디고 팔레트로 교체
   *  --educoding-dark   : 페이지 배경
   *  --educoding-black  : 배경 위에 올라가는 면 / 텍스트의 반대색
   *  --educoding-white  : 기본 텍스트
   *  --educoding-purple : 포인트 색 (이름은 예전 그대로지만 지금은 인디고)
   */
  [data-theme="dark"] {
    --educoding-hover: #1c2030;
    --educoding-dark: #0f1117;
    --educoding-line: #262a36;
    --educoding-purple: #6366f1;
    --educoding-orange: #fb923c;
    --educoding-yellow: #facc15;
    --educoding-black: #171a23;
    --educoding-white: #e5e7eb;
    --educoding-blue: #22d3ee;

    /* 새로 추가한 토큰 */
    --educoding-surface: #161923; /* 카드 */
    --educoding-header: #1b1f2c; /* 섹션 헤더 바 (예전 검정 바) */
    --educoding-muted: #9ca3af; /* 보조 텍스트 */
    --educoding-accent-2: #8b5cf6;
    --educoding-accent-soft: rgba(99, 102, 241, 0.14);
    --educoding-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    --educoding-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    --educoding-shadow-hover: 0 14px 34px rgba(0, 0, 0, 0.45);
    --educoding-radius: 12px;
  }

  [data-theme="light"] {
    --educoding-hover: #eef0f6;
    --educoding-dark: #f7f8fa;
    --educoding-line: #e3e6ec;
    --educoding-purple: #6366f1;
    --educoding-orange: #ea7a1f;
    --educoding-yellow: #eab308;
    --educoding-black: #ffffff;
    --educoding-white: #1f2937;
    --educoding-blue: #0891b2;

    --educoding-surface: #ffffff;
    --educoding-header: #1f2433;
    --educoding-muted: #6b7280;
    --educoding-accent-2: #8b5cf6;
    --educoding-accent-soft: rgba(99, 102, 241, 0.1);
    --educoding-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    --educoding-shadow: 0 8px 24px rgba(31, 41, 55, 0.08);
    --educoding-shadow-hover: 0 14px 34px rgba(31, 41, 55, 0.14);
    --educoding-radius: 12px;
  }

  /* 적용될 기본 body 스타일 */
  body[data-theme='dark'],
  body[data-theme='light'] {
    background-color: var(--educoding-dark);
    color: var(--educoding-white);
    transition: background-color 0.3s ease, color 0.3s ease;
    font-family: regular, sans-serif;
    letter-spacing: -0.01em; /* Pretendard는 살짝 좁혀야 더 정돈돼 보임 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::selection {
    background-color: rgba(99, 102, 241, 0.35);
  }

  /* 버튼·링크 공통: 딱딱하게 바뀌지 않고 부드럽게 전환 */
  a,
  button {
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  :focus-visible {
    outline: 2px solid var(--educoding-purple);
    outline-offset: 2px;
  }

    /* 라이트 모드 색상 */
  body[data-theme='light'] {
    --educoding-background: var(--educoding-white);
    --educoding-text: black;
  }


  *{
    box-sizing : border-box;
    margin: 0;
    padding: 0;
    /* font-family: regular; */
  }

  h1 {
    font-family: extrabold;
    margin: 1rem 0;
  }

  h2 {
    font-family: extrabold;
    margin: 0.75rem 0;
  }

  h3 {
    font-family: extrabold;
    margin: 0.5rem 0;
  }

  blockquote {
    border-left: 3px solid var(--educoding-purple);
    margin: 1.5rem 0;
    padding: 0.5rem 1rem;
    border-radius: 0 8px 8px 0;
    background-color: var(--educoding-accent-soft);
  }

  hr {
    border: none;
    border-top: 1px solid var(--educoding-line);
    margin: 2rem 0;
  }

  p {
    font-family:'regular', sans-serif;
    font-size: 13px;
    line-height: 24px;
  } 

  pre {
  width: 100%;
  background: #151823; /* 기본 배경색 */
  border: 1px solid #262a36;
  border-radius: 10px; /* 모서리 라운딩 */
  color: white;
  font-family: "JetBrainsMono", monospace; /* 폰트 설정 */
  margin: 1.5rem 0; /* 상하 여백 */
  padding: 0.75rem 1rem; /* 안쪽 여백 */
  overflow-x: auto; /* 코드 줄바꿈 방지 및 스크롤 */
}

/* pre 안의 code 기본 스타일링 */
pre code {
  background: none; /* 중복 배경 제거 */
  color: inherit; /* 상속된 텍스트 색상 */
  font-size: 0.8rem; /* 코드 폰트 크기 */
  padding: 0; /* 중복 padding 제거 */
  line-height: 1.5; /* 가독성을 위한 줄 간격 */
}

/* Lowlight.js의 클래스 스타일 추가 (GitHub 테마 기반) */
.hljs-comment,
.hljs-quote {
  color: #6a737d; /* 주석, 인용문 */
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-section {
  color: #d73a49; /* 키워드 */
}

.hljs-string,
.hljs-title,
.hljs-name,
.hljs-variable,
.hljs-template-variable,
.hljs-builtin-name,
.hljs-literal {
  color: #28a745; /* 문자열, 변수 */
}

.hljs-number,
.hljs-symbol,
.hljs-bullet {
  color: #005cc5; /* 숫자, 기호 */
}

.hljs-meta,
.hljs-link {
  color: #d7ff48; /* 메타 정보, 링크 */
}

.hljs-attribute {
  color: #6f42c1; /* 속성 */
}

.hljs-title.class_,
.hljs-type {
  color: #005cc5; /* 클래스, 타입 */
}

.hljs-tag {
  color: #22863a; /* 태그 */
}

.hljs-deletion {
  color: #b31d28; /* 삭제 텍스트 */
  background-color: #ffeef0;
}

.hljs-addition {
  color: #22863a; /* 추가 텍스트 */
  background-color: #f0fff4;
}

.hljs-emphasis {
  font-style: italic; /* 강조 */
}

.hljs-strong {
  font-weight: bold; /* 강한 강조 */
}


  
.fade-enter {
  opacity: 0.2;
  transition: opacity 0.3s ease-in;
}

.fade-enter-active {
  opacity: 1;
}

.css-1rju2q6-MuiButtonBase-root-MuiMenuItem-root.Mui-selected {
  background-color: transparent !important;
}

.css-1rju2q6-MuiButtonBase-root-MuiMenuItem-root.Mui-selected:hover {
  background-color: rgba(0, 0, 0, 0.25) !important;
}

.css-1toxriw-MuiList-root-MuiMenu-list {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.css-rizt0-MuiTypography-root {
  font-family: regular !important;
  font-size: 12px !important;
  text-align: center;
}

.css-1gu340z-MuiChartsAxis-root-MuiChartsXAxis-root .MuiChartsAxis-tick {
  display: none;
}


`;

export default GlobalStyle;
