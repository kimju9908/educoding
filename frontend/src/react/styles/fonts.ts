import { css } from 'styled-components';

/*
 * 사이트 전체가 'regular', 'bold', 'extrabold' 같은 굵기 이름을 font-family로 직접 쓰고 있어서,
 * 이 이름들이 가리키는 실제 폰트만 여기서 바꾸면 전체에 반영된다.
 * 본문: Pretendard (예전 NanumSquareNeo), 코드: JetBrains Mono
 */
const PRETENDARD = 'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web';
const JETBRAINS_MONO = 'https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5/files';

const pretendard = (family: string, file: string, weight: number): string => `
  @font-face {
    font-family: '${family}';
    font-weight: ${weight};
    font-display: swap;
    src: url(${PRETENDARD}/static/woff2/Pretendard-${file}.woff2) format('woff2');
  }
`;

export const Fonts = css`
  ${pretendard('light', 'Light', 300)}
  ${pretendard('regular', 'Regular', 400)}
  ${pretendard('medium', 'Medium', 500)}
  ${pretendard('semibold', 'SemiBold', 600)}
  ${pretendard('bold', 'Bold', 700)}
  ${pretendard('extrabold', 'ExtraBold', 800)}
  ${pretendard('heavy', 'Black', 900)}

  @font-face {
    font-family: 'variable';
    font-weight: 45 920;
    font-display: swap;
    src: url(${PRETENDARD}/variable/woff2/PretendardVariable.woff2) format('woff2-variations');
  }

  @font-face {
    font-family: 'JetBrainsMono';
    font-weight: 400;
    font-display: swap;
    src: url(${JETBRAINS_MONO}/jetbrains-mono-latin-400-normal.woff2) format('woff2');
  }

  @font-face {
    font-family: 'JetBrainsMono';
    font-weight: 700;
    font-display: swap;
    src: url(${JETBRAINS_MONO}/jetbrains-mono-latin-700-normal.woff2) format('woff2');
  }
`;
export default Fonts;
