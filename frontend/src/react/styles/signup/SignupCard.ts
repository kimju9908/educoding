import styled, { css, keyframes } from 'styled-components';

// 회원가입 — 화면 가운데 카드 하나에 양식을 위에서 아래로 배치

const rise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Page = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 16px;
  background:
    radial-gradient(circle at 15% 10%, rgba(99, 102, 241, 0.18) 0%, transparent 40%),
    radial-gradient(circle at 85% 90%, rgba(139, 92, 246, 0.14) 0%, transparent 40%),
    var(--educoding-dark);
`;

export const Card = styled.form`
  width: 100%;
  max-width: 440px;
  padding: 36px 32px 28px;
  border-radius: 18px;
  border: 1px solid var(--educoding-line);
  background-color: var(--educoding-surface);
  box-shadow: var(--educoding-shadow);
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: ${rise} 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  @media (max-width: 480px) {
    padding: 28px 20px 22px;
  }
`;

export const Title = styled.h1`
  margin: 0 0 6px;
  text-align: center;
  font-family: extrabold, sans-serif;
  font-size: 24px;
  color: var(--educoding-white);
`;

export const SubTitle = styled.p`
  margin: -4px 0 6px;
  text-align: center;
  font-size: 13px;
  line-height: 20px;
  color: var(--educoding-muted);
`;

export const AvatarArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
`;

export const AvatarLabel = styled.label`
  position: relative;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--educoding-line);
  background-color: var(--educoding-hover);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
  &:hover {
    border-color: var(--educoding-purple);
    transform: scale(1.03);
  }
  img,
  svg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  input {
    display: none;
  }
`;

export const AvatarBadge = styled.span`
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #ffffff;
  background: var(--educoding-gradient);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

export const TextButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--educoding-muted);
  &:hover {
    color: var(--educoding-purple);
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FieldLabel = styled.label`
  font-size: 12px;
  font-family: bold, sans-serif;
  color: var(--educoding-muted);
`;

export const Row = styled.div`
  display: flex;
  gap: 8px;
  /* 버튼 옆 입력칸만 가로로 늘림 (세로 배치에서 flex: 1을 주면 높이가 0으로 눌림) */
  & > input {
    flex: 1;
    min-width: 0;
  }
`;

export const Input = styled.input<{ $invalid?: boolean }>`
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ $invalid }) => ($invalid ? '#f87171' : 'var(--educoding-line)')};
  background-color: var(--educoding-dark);
  color: var(--educoding-white);
  font-size: 14px;
  font-family: regular, sans-serif;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  &::placeholder {
    color: var(--educoding-muted);
  }
  &:focus {
    border-color: var(--educoding-purple);
    box-shadow: 0 0 0 3px var(--educoding-accent-soft);
  }
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  /* 날짜 선택 아이콘이 다크 배경에서도 보이게 */
  &::-webkit-calendar-picker-indicator {
    filter: invert(0.6);
    cursor: pointer;
  }
`;

const buttonBase = css`
  height: 44px;
  border-radius: 10px;
  font-family: bold, sans-serif;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const SideButton = styled.button<{ $done?: boolean }>`
  ${buttonBase}
  padding: 0 14px;
  border: 1px solid ${({ $done }) => ($done ? '#34d399' : 'var(--educoding-purple)')};
  background-color: ${({ $done }) => ($done ? 'rgba(52, 211, 153, 0.12)' : 'transparent')};
  color: ${({ $done }) => ($done ? '#34d399' : 'var(--educoding-purple)')};
  &:not(:disabled):hover {
    background-color: ${({ $done }) => ($done ? 'rgba(52, 211, 153, 0.12)' : 'var(--educoding-accent-soft)')};
  }
`;

export const SubmitButton = styled.button`
  ${buttonBase}
  margin-top: 8px;
  height: 48px;
  border: none;
  font-size: 15px;
  color: #ffffff;
  background: var(--educoding-gradient);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  &:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 26px rgba(99, 102, 241, 0.45);
  }
  &:disabled {
    box-shadow: none;
  }
`;

export const Hint = styled.p<{ $tone?: 'ok' | 'error' | 'muted' }>`
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: ${({ $tone }) =>
    $tone === 'ok' ? '#34d399' : $tone === 'error' ? '#f87171' : 'var(--educoding-muted)'};
`;

export const ErrorBox = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  color: #f87171;
  background-color: rgba(248, 113, 113, 0.1);
`;

export const Footer = styled.div`
  margin-top: 4px;
  text-align: center;
  font-size: 13px;
  color: var(--educoding-muted);
  button {
    margin-left: 6px;
    border: none;
    background: none;
    cursor: pointer;
    font-family: bold, sans-serif;
    font-size: 13px;
    color: var(--educoding-purple);
  }
`;
