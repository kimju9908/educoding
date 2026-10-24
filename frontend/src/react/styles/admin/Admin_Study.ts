import styled, { css } from 'styled-components';

// 관리자 "강의 관리" 페이지 전용 스타일

export const LanguageTabs = styled.div`
  display: flex;
  gap: 6px;
  padding: 14px 15px;
  border-bottom: 1px solid var(--educoding-line);
  flex-wrap: wrap;
`;

export const LanguageTab = styled.button<{ $active: boolean }>`
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid var(--educoding-line);
  background: ${({ $active }) => ($active ? 'var(--educoding-gradient)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#ffffff' : 'var(--educoding-white)')};
  font-family: bold, sans-serif;
  font-size: 13px;
  cursor: pointer;
  &:hover {
    border-color: var(--educoding-purple);
  }
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  font-size: 13px;
  color: var(--educoding-muted);
`;

type ButtonProps = { $variant?: 'primary' | 'danger' | 'ghost' };

export const Button = styled.button<ButtonProps>`
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-family: bold, sans-serif;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid var(--educoding-line);
  background: transparent;
  color: var(--educoding-white);
  &:hover {
    border-color: var(--educoding-purple);
    color: var(--educoding-purple);
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
  ${({ $variant }) =>
    $variant === 'primary' &&
    css`
      border: none;
      background: var(--educoding-gradient);
      color: #ffffff;
      &:hover {
        color: #ffffff;
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
      }
    `}
  ${({ $variant }) =>
    $variant === 'danger' &&
    css`
      color: #f87171;
      &:hover {
        border-color: #f87171;
        color: #ffffff;
        background-color: #ef4444;
      }
    `}
`;

export const ChapterCard = styled.div`
  margin: 0 15px 12px;
  border: 1px solid var(--educoding-line);
  border-radius: var(--educoding-radius);
  background-color: var(--educoding-surface);
  overflow: hidden;
`;

export const ChapterHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: var(--educoding-header);
  box-shadow: inset 3px 0 0 var(--educoding-purple);
  color: #ffffff;
  font-family: bold, sans-serif;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
`;

export const ChapterHeadTitle = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LessonRow = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px 9px 22px;
  font-size: 13px;
  cursor: pointer;
  color: ${({ $selected }) => ($selected ? 'var(--educoding-purple)' : 'var(--educoding-white)')};
  background-color: ${({ $selected }) => ($selected ? 'var(--educoding-accent-soft)' : 'transparent')};
  & + & {
    border-top: 1px solid var(--educoding-line);
  }
  &:hover {
    background-color: var(--educoding-accent-soft);
  }
`;

export const LessonLabel = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Badge = styled.span<{ $empty: boolean }>`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-family: bold, sans-serif;
  color: ${({ $empty }) => ($empty ? 'var(--educoding-orange)' : 'var(--educoding-muted)')};
  background-color: ${({ $empty }) =>
    $empty ? 'rgba(251, 146, 60, 0.12)' : 'var(--educoding-hover)'};
`;

export const EditorPanel = styled.div`
  margin: 0 15px 20px;
  padding: 16px;
  border: 1px solid var(--educoding-purple);
  border-radius: var(--educoding-radius);
  background-color: var(--educoding-surface);
  box-shadow: var(--educoding-shadow);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const EditorTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-family: extrabold, sans-serif;
  font-size: 15px;
  color: var(--educoding-white);
`;

export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 0.6fr 2fr 0.6fr;
  gap: 10px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
  font-family: bold, sans-serif;
  color: var(--educoding-muted);
`;

const inputStyle = css`
  padding: 9px 10px;
  border-radius: 8px;
  border: 1px solid var(--educoding-line);
  background-color: var(--educoding-dark);
  color: var(--educoding-white);
  font-size: 13px;
  font-family: regular, sans-serif;
  outline: none;
  &:focus {
    border-color: var(--educoding-purple);
    box-shadow: 0 0 0 3px var(--educoding-accent-soft);
  }
`;

export const Input = styled.input`
  ${inputStyle}
`;

export const Select = styled.select`
  ${inputStyle}
`;

export const ViewToggle = styled.div`
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  border: 1px solid var(--educoding-line);
`;

export const ViewToggleButton = styled.button<{ $active: boolean }>`
  padding: 5px 12px;
  border-radius: 999px;
  border: none;
  font-size: 12px;
  font-family: bold, sans-serif;
  cursor: pointer;
  background: ${({ $active }) => ($active ? 'var(--educoding-accent-soft)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--educoding-purple)' : 'var(--educoding-muted)')};
`;

export const EditorBody = styled.div<{ $split: boolean }>`
  display: grid;
  grid-template-columns: ${({ $split }) => ($split ? '1fr 1fr' : '1fr')};
  gap: 12px;
  min-height: 420px;
`;

export const MarkdownTextarea = styled.textarea`
  ${inputStyle}
  width: 100%;
  min-height: 520px;
  resize: vertical;
  font-family: 'JetBrainsMono', monospace;
  font-size: 12px;
  line-height: 1.6;
  tab-size: 2;
`;

export const PreviewBox = styled.div`
  max-height: 640px;
  overflow-y: auto;
  border: 1px solid var(--educoding-line);
  border-radius: 8px;
`;

export const HelpText = styled.div`
  font-size: 11px;
  line-height: 18px;
  color: var(--educoding-muted);
  code {
    padding: 1px 5px;
    border-radius: 4px;
    background-color: var(--educoding-hover);
    font-family: 'JetBrainsMono', monospace;
  }
`;

export const Message = styled.div<{ $error: boolean }>`
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-family: bold, sans-serif;
  color: ${({ $error }) => ($error ? '#f87171' : '#34d399')};
  background-color: ${({ $error }) => ($error ? 'rgba(248, 113, 113, 0.1)' : 'rgba(52, 211, 153, 0.1)')};
`;

export const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;
