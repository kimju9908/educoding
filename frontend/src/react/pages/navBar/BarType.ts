export interface CssProps {
  isMenuOpen?: boolean;
  isUser?: boolean;
  isToggleMyPage?: boolean;
  theme: 'light' | 'dark';
}

export type SideBarProps = {
  isMenuOpen: boolean;
};

export type ExamBarProps = {
  isMenuOpen: boolean;
  onValidDialogState: (state: boolean) => void;
  toggleMenu: (menu: string) => void;
};

export type MyPageBarProps = {
  mode: 'light' | 'dark';
  isMenuOpen: boolean;
  toggleTheme: () => void;
  onValidDialogState: (state: boolean) => void;
  toggleMenu: (menu: string) => void;
};
