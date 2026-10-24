import { JSX, useState } from 'react';

import { useTheme } from '@mui/material';

import '../react/styles/community/PostEditor.css';

import type { ColorType, ToolBarProps } from './ToolBarType';

const ToolBar = ({ editor }: ToolBarProps): JSX.Element | null => {
  const theme = useTheme();
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  if (!editor) return null;

  // 드롭다운 표시/숨기기
  const toggleDropdown = (): void => {
    setDropdownVisible(!isDropdownVisible);
  };

  // 색상 변경 처리
  const handleColorChange = (color: ColorType): void => {
    // 색상 코드 매핑
    const colorMap: Record<ColorType, string> = {
      black: '#000000',
      blue: '#228be6',
      red: '#fa5252',
      green: '#00C471',
      yellow: '#ffff00',
      gray: '#868e96',
    };
    const selectedColor = colorMap[color as ColorType];
    editor.chain().focus().setColor(selectedColor).run(); // setColor 메서드 사용
    setDropdownVisible(false); // 색상 변경 후 드롭다운 숨김
  };

  function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className="toolbar">
      <div className="button-group" style={{ display: 'flex', alignItems: 'center' }}>
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_01_Bold_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_01_Bold.svg)', // 다크 테마일 때
          }}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        />
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_02_Italic_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_02_Italic.svg)',
          }}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        />

        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_03_UnderLine_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_03_UnderLine.svg)',
          }}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
        />

        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_04_StrikeThrough_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_04_StrikeThrough.svg)',
          }}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        />

        {/* 색상 변경 버튼 */}
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_05_TextColor_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_05_TextColor.svg)',
            backgroundSize: '80%',
          }}
          onClick={toggleDropdown}
        />

        {/* 드롭다운 메뉴 */}
        <div className={`dropdown-menu ${isDropdownVisible ? 'show' : ''}`}>
          {['black', 'blue', 'red', 'green', 'yellow', 'gray'].map((color, index) => (
            <button
              key={color}
              style={{
                zIndex: '10',
                backgroundColor: '#fff',
                backgroundImage: `url(/images/tiptap/Editor_Toolbar_05_0${
                  index + 1
                }_${capitalizeFirstLetter(color)}.svg)`, // 동적으로 이미지 경로 설정
                backgroundSize: '80%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
              onClick={() => handleColorChange(color as ColorType)}
            />
          ))}
        </div>

        <div
          style={{
            display: 'inline-block',
            height: '20px',
            borderLeft: '1px solid var(--educoding-line)',
            margin: '0 5px',
          }}
        />
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_06_Code_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_06_Code.svg)',
          }}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'is-active' : ''}
        />
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_07_CodeBlock_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_07_CodeBlock.svg)',
          }}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
        />
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_08_Quote_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_08_Quote.svg)',
          }}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
        />
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_09_Image_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_09_Image.svg)',
          }}
          onClick={() => {
            const url = window.prompt('이미지 URL을 입력하세요');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="upload-button"
        />

        <div
          style={{
            display: 'inline-block',
            height: '20px',
            borderLeft: '1px solid var(--educoding-line)',
            margin: '0 5px',
          }}
        />
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_10_H1_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_10_H1.svg)',
          }}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        />
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_11_H2_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_11_H2.svg)',
          }}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        />
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_12_H3_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_12_H3.svg)',
          }}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        />
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_13_UL_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_13_UL.svg)',
          }}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        />
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_14_OL_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_14_OL.svg)',
          }}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        />
        <button
          style={{
            backgroundImage:
              theme.palette.mode === 'light'
                ? 'url(/images/tiptap/Editor_Toolbar_15_Line_Light.svg)' // 라이트 테마일 때
                : 'url(/images/tiptap/Editor_Toolbar_15_Line.svg)',
          }}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
      </div>
    </div>
  );
};

export default ToolBar;
