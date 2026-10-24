export type LanguageType = {
  name: string;
};

export type LanguageArrange = Record<string, string>[];

export type LanguageTitleProps = {
  language: string;
  mainContentRef?: OutletContextType;
  selectedChapters?: ChapterType[];
};

export type LanguageRefArray = React.RefObject<HTMLDivElement | null>[];

export type LanguageChapterListProps = {
  language: string;
  mainContentRef: React.RefObject<HTMLDivElement>;
};

export type LanguageClassListProps = {
  language: string;
  selectedChapters?: ChapterType[];
  filtered?: boolean;
};

export type LanguageListProps = {
  language: string | undefined;
};

export type LanguageArrowProps = {
  direction: string;
  language: string | undefined;
};

export type OutletContextType = React.RefObject<HTMLDivElement>;

export type ChapterType = {
  id: string;
  title: string;
  contents: {
    label: string;
    navigatepath: string;
    thirdpath: string;
  }[];
};
