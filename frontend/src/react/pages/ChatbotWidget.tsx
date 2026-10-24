import { JSX, KeyboardEvent, useRef, useState } from 'react';

import { Link, useParams } from 'react-router-dom';

import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fab from '@mui/material/Fab';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

import type { ChatbotSource } from '../../api/AxiosApi/ChatbotApi/ChatbotApiType';

import ChatbotApi, { getChatbotApiErrorMessage } from '../../api/AxiosApi/ChatbotApi/ChatbotApi';

type ChatMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; sources: ChatbotSource[] }
  | { role: 'error'; text: string };

// 사이트 전체에서 "맨 위로" 버튼 자리를 대신하는 플로팅 챗봇(Layout.tsx에서 한 번만 렌더링).
// 학습 페이지(/study/:language/...)에서 열면 현재 보고 있는 언어로 검색 범위를 제한하고,
// 그 외 페이지에서는 전체 언어를 대상으로 검색한다.
const ChatbotWidget = (): JSX.Element => {
  const { language } = useParams();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const scrollToBottom = (): void => {
    requestAnimationFrame(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
  };

  const handleAsk = async (): Promise<void> => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setQuestion('');
    setLoading(true);
    scrollToBottom();

    try {
      const result = await ChatbotApi.ask({ question: trimmed, language: language?.toLowerCase() });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: result.answer, sources: result.sources },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'error', text: getChatbotApiErrorMessage(error, '답변을 가져오지 못했어요.') },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleAsk();
    }
  };

  return (
    <>
      <Fab
        ref={anchorRef}
        sx={{ position: 'fixed', bottom: 30, right: 30, backgroundColor: 'var(--educoding-purple)' }}
        size="large"
        aria-label="학습 챗봇"
        onClick={() => setOpen(true)}
      >
        <ChatIcon style={{ color: '#ffffff' }} />
      </Fab>

      {/* 배경을 어둡게 가리는 모달 대신, 버튼 위에 작게 뜨고 바깥을 누르면 닫히는 팝업 */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="top-end"
        transition
        style={{ zIndex: 1300 }}
        modifiers={[{ name: 'offset', options: { offset: [0, 12] } }]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <Paper elevation={8} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <div
                  style={{
                    width: 340,
                    maxWidth: '90vw',
                    height: 440,
                    maxHeight: '70vh',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'var(--educoding-dark)',
                    color: 'var(--educoding-white)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderBottom: '1px solid var(--educoding-line)',
                      fontFamily: 'bold, sans-serif',
                      fontSize: 13,
                    }}
                  >
                    📚 학습 챗봇
                    <IconButton size="small" onClick={() => setOpen(false)} aria-label="닫기">
                      <CloseIcon style={{ color: 'var(--educoding-white)' }} fontSize="small" />
                    </IconButton>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {messages.length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--educoding-muted)' }}>
                        학습 중인 내용에 대해 궁금한 걸 물어보세요. 답변 아래에 관련 학습 자료 링크를 같이 보여드려요.
                      </div>
                    )}
                    {messages.map((message, idx) => (
                      <ChatBubble key={idx} message={message} />
                    ))}
                    {loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--educoding-muted)' }}>
                        <CircularProgress size={14} />
                        답변을 준비하고 있어요...
                      </div>
                    ) : null}
                    <div ref={listEndRef} />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 8,
                      padding: 10,
                      borderTop: '1px solid var(--educoding-line)',
                    }}
                  >
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="질문을 입력하세요 (Shift+Enter로 줄바꿈)"
                      rows={2}
                      style={{
                        flex: 1,
                        resize: 'none',
                        borderRadius: 8,
                        border: '1px solid var(--educoding-line)',
                        backgroundColor: 'var(--educoding-black)',
                        color: 'var(--educoding-white)',
                        padding: '8px 10px',
                        fontSize: 13,
                        fontFamily: 'inherit',
                      }}
                    />
                    <IconButton
                      onClick={() => void handleAsk()}
                      disabled={loading || !question.trim()}
                      aria-label="질문 보내기"
                      style={{ color: 'var(--educoding-purple)' }}
                    >
                      <SendIcon />
                    </IconButton>
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

const ChatBubble = ({ message }: { message: ChatMessage }): JSX.Element => {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          whiteSpace: 'pre-wrap',
          fontSize: 13,
          lineHeight: 1.5,
          padding: '8px 12px',
          borderRadius: 10,
          backgroundColor: isUser
            ? 'var(--educoding-purple)'
            : isError
              ? 'var(--educoding-orange)'
              : 'var(--educoding-header)',
          // purple/orange/header는 테마가 바뀌어도 항상 어두운 고정 악센트색이라
          // (라이트 테마의 --educoding-white는 거의 검정에 가까워 대비가 깨짐)
          // 다른 컴포넌트들처럼 고정 흰색 텍스트를 쓴다.
          color: '#ffffff',
        }}
      >
        {message.text}
      </div>

      {message.role === 'assistant' && message.sources.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {message.sources.map((source, idx) => (
            <Link
              key={`${source.url}-${idx}`}
              to={source.url}
              style={{
                fontSize: 11,
                // accent-soft는 배경 틴트용 저투명도 색이라 텍스트로 쓰면 거의 안 보임 --
                // 다른 본문 링크(ClassContentsAnchor)와 같은 purple을 사용
                color: 'var(--educoding-purple)',
                textDecoration: 'none',
                border: '1px solid var(--educoding-line)',
                borderRadius: 6,
                padding: '4px 8px',
              }}
            >
              [{idx + 1}] {source.chapterTitle} &gt; {source.lessonLabel} &gt; {source.heading.split(' > ').pop()}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
