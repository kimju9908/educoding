import React, { JSX, useMemo } from 'react';

import hljs from 'highlight.js';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import {
  EachClass,
  ClassHeader,
  ClassHeaderTitle,
  ClassContentsContainer,
  ClassContentsTitle1,
  ClassContentsTitle2,
  ClassContentsTitle3,
  ClassContentsText,
  ClassContentsCode,
  ClassTableBox,
  ClassTable,
  ClassTableTr,
  ClassTableTd,
  ClassContentsList,
  ClassContentsImg,
  ClassContentsCallout,
  ClassContentsAnchor,
  ClassContentsEmpty,
} from '../../../styles/study/Study_Class';
import 'highlight.js/styles/a11y-dark.css';

/*
 * DB에 저장된 마크다운 강의를 예전 하드코딩 강의와 같은 모양으로 그린다.
 *  ## → 큰 챕터 제목(Title1), ### → 소제목(Title2), #### → Title3
 *  > 인용문 → 안내 박스, ```lang 코드``` → 하이라이트된 코드 블록
 * 제목들은 예전과 같은 styled-component(id)를 쓰므로 오른쪽 챕터 내비게이터가 그대로 동작한다.
 */

// 표의 병합 셀(rowspan/colspan)처럼 마크다운으로 못 쓰는 부분은 HTML을 허용하되, 스크립트 등은 제거
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'u'],
  attributes: {
    ...defaultSchema.attributes,
    td: [...(defaultSchema.attributes?.td ?? []), 'rowSpan', 'colSpan'],
    th: [...(defaultSchema.attributes?.th ?? []), 'rowSpan', 'colSpan'],
  },
};

const highlight = (code: string, language: string): string => {
  const lang = hljs.getLanguage(language) ? language : 'plaintext';
  return hljs.highlight(code, { language: lang }).value; // 코드가 이스케이프된 HTML이 돌아옴
};

// 챗봇 등에서 레슨 내 특정 섹션으로 딥링크할 때 쓰는 data-heading-index를 각 제목에 매긴다.
// rag/chunking/chunk_lessons.py가 같은 마크다운을 문서 순서대로 훑어 동일한 인덱스를
// chunk.headingIndex로 저장하므로, 둘은 항상 같은 순서로 매칭된다. 레슨마다 0부터 다시
// 세어야 하므로 모듈 레벨 components가 아니라 content가 바뀔 때마다 새로 만든다(아래 useMemo).
const makeHeadingComponents = (): Pick<Components, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> => {
  let headingIndex = 0;
  const next = (): number => headingIndex++;
  return {
    h1: ({ children }) => <ClassContentsTitle1 data-heading-index={next()}>{children}</ClassContentsTitle1>,
    h2: ({ children }) => <ClassContentsTitle1 data-heading-index={next()}>{children}</ClassContentsTitle1>,
    h3: ({ children }) => <ClassContentsTitle2 data-heading-index={next()}>{children}</ClassContentsTitle2>,
    h4: ({ children }) => <ClassContentsTitle3 data-heading-index={next()}>{children}</ClassContentsTitle3>,
    h5: ({ children }) => <ClassContentsTitle3 data-heading-index={next()}>{children}</ClassContentsTitle3>,
    h6: ({ children }) => <ClassContentsTitle3 data-heading-index={next()}>{children}</ClassContentsTitle3>,
  };
};

const components: Omit<Components, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
  p: ({ children }) => <ClassContentsText>{children}</ClassContentsText>,
  ul: ({ children }) => <ClassContentsList>{children}</ClassContentsList>,
  ol: ({ children }) => <ClassContentsList as="ol">{children}</ClassContentsList>,
  blockquote: ({ children }) => <ClassContentsCallout>{children}</ClassContentsCallout>,
  img: ({ src, alt }) => <ClassContentsImg src={typeof src === 'string' ? src : ''} alt={alt ?? ''} loading="lazy" />,
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <ClassContentsAnchor
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {children}
      </ClassContentsAnchor>
    );
  },
  table: ({ children }) => (
    <ClassTableBox>
      <ClassTable>{children}</ClassTable>
    </ClassTableBox>
  ),
  tr: ({ children }) => <ClassTableTr>{children}</ClassTableTr>,
  td: ({ children, rowSpan, colSpan, style }) => (
    <ClassTableTd rowSpan={rowSpan} colSpan={colSpan} style={style}>
      {children}
    </ClassTableTd>
  ),
  th: ({ children, rowSpan, colSpan, style }) => (
    <ClassTableTd
      as="th"
      rowSpan={rowSpan}
      colSpan={colSpan}
      style={{ ...style, backgroundColor: 'var(--educoding-accent-soft)', fontFamily: 'bold' }}
    >
      {children}
    </ClassTableTd>
  ),
  // 코드 블록은 code에서 <pre>까지 직접 그리므로 바깥 pre는 그대로 통과
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const text = String(children ?? '');
    const match = /language-([\w+#-]+)/.exec(className ?? '');
    const isBlock = !!match || text.includes('\n');
    if (!isBlock) return <ClassContentsCode>{children}</ClassContentsCode>;
    const language = match?.[1] ?? 'plaintext';
    return (
      <pre>
        <code
          className={`hljs language-${language}`}
          // hljs가 코드 내용을 이스케이프한 HTML만 돌려주므로 안전
          dangerouslySetInnerHTML={{ __html: highlight(text.replace(/\n$/, ''), language) }}
        />
      </pre>
    );
  },
};

type LessonMarkdownProps = {
  title: string;
  content: string;
};

const Languages_LessonMarkdown = ({ title, content }: LessonMarkdownProps): JSX.Element => {
  const body = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{ ...components, ...makeHeadingComponents() }}
      >
        {content}
      </ReactMarkdown>
    ),
    [content],
  );

  return (
    <EachClass>
      <ClassHeader>
        <ClassHeaderTitle>{title}</ClassHeaderTitle>
      </ClassHeader>
      <ClassContentsContainer>
        {content.trim() ? (
          body
        ) : (
          <ClassContentsEmpty>
            🛠️ 아직 준비 중인 강의예요.
            <br />곧 내용이 채워질 예정이니 조금만 기다려 주세요!
          </ClassContentsEmpty>
        )}
      </ClassContentsContainer>
    </EachClass>
  );
};

export default React.memo(Languages_LessonMarkdown);
