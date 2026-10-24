export type OutletContextType = React.RefObject<HTMLDivElement>;

export type MainSection1ContentsComponentProps = {
  title: string;
  contents: string;
  defaultImg: string;
  hoverImg: string;
  navigateTo: string;
};

export type MainSection2ContentsComponentProps = MainSection1ContentsComponentProps & {
  lightImg: string;
};

export type MainSection4BoardListProps = {
  boardType: string;
  size: number;
};

export type QuestionType = {
  id: number;
  question: string;
  options: { value: string; label: string }[];
  correctAnswer: string;
  explanation: string;
}[];
