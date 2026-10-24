export type OutletContextType = React.RefObject<HTMLDivElement>;

export type BoardTitleProps = {
  boardType: string | undefined;
};

export type SideBoardListProps = BoardTitleProps;

export type SideCodingPopularProps = {
  onEnumFilterChange: (
    newEnumFilter: LanguageType | StudyType | TeamType | CourseType | null,
  ) => void;
  enumFilter: string[] | string | null;
};
export type SideCoursePopularProps = SideCodingPopularProps;
export type SideStudyPopularProps = SideCodingPopularProps;
export type SideTeamPopularProps = SideCodingPopularProps;

export type SideMentorPopularProps = {
  onEnumFilterChange: (newEnumFilter: MentorType | null) => void;
  enumFilter: string[] | string | null;
};

export type BoardTopSortProps = {
  onStatusChange: React.Dispatch<React.SetStateAction<string | null>>;
  boardType: string | undefined;
};

export type BoardSearchProps = {
  onSearchChange: React.Dispatch<React.SetStateAction<string | null>>;
  onEnumFilterRefresh: () => void;
  enumFilter: LanguageType | StudyType | TeamType | CourseType | null;
};

export type BoardOrderProps = {
  onSortChange: (newSortBy: string) => void; // 함수 타입으로 변경
  boardType: string | undefined; // undefined 제거
};

export type BoardPostListProps = {
  boardType: string | undefined;
  page: number | string;
  size: number | string;
  sortBy: string;
  order: string;
  status: string | null;
  enumFilter: LanguageType | StudyType | TeamType | CourseType | null;
  search: string | null;
};

export type BoardWriteButtonProps = {
  boardType: string | undefined;
};

export type RelatedPostsProps = {
  boardId: string | undefined;
};

export type PostMainContentProps = {
  post: BoardDataType;
  setPost: React.Dispatch<React.SetStateAction<BoardDataType>>;
};

export type PostUserProfileProps = {
  post: BoardDataType;
};

export type BoardCommunityUserProps = {
  writerName: string;
  writerKey: number;
  writerProfile: string | null;
  page: number;
  size: number;
};

export type PostReplyAreaProps = {
  boardType: string | undefined;
  page: number;
  size: number;
  sortBy: string;
  order: string;
  postBoardId: number;
};

export type PostReplyEditorProps = {
  handleCloseEditor: () => void;
  postBoardId: number;
};

export type PostReplyModifyEditorProps = {
  handleCloseModifyEditor: () => void;
  postBoardId: number;
  replyContents: string | null;
  replyId: number;
  replyUserName: string;
};
export type PostWriteEditorCodingPros = {
  title: string;
  language: LanguageTypeArray;
};

export type PostModifyEditorCodingProps = {
  boardId: string | undefined;
  content: string;
  title: string;
  language: LanguageTypeArray;
};

export type PostWriteEditorCoursePros = {
  title: string;
  course: CourseTypeArray;
};

export type PostModifyEditorCourseProps = {
  boardId: string | undefined;
  content: string;
  title: string;
  course: CourseTypeArray;
};

export type PostWriteEditorStudyPros = {
  title: string;
  study: StudyTypeArray;
};

export type PostModifyEditorStudyProps = {
  boardId: string | undefined;
  content: string;
  title: string;
  study: StudyTypeArray;
};

export type PostWriteEditorTeamPros = {
  title: string;
  team: TeamTypeArray;
};

export type PostModifyEditorTeamProps = {
  boardId: string | undefined;
  content: string;
  title: string;
  team: TeamTypeArray;
};

export type BoardPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (value: number) => void;
};

export type BoardImageType = Record<string, string>;
export type BoardNameType = BoardImageType;
export type BoardExplainType = BoardImageType;

export type CodingEnumFilterType = Record<string, string>;
export type CourseEnumFilterType = CodingEnumFilterType;
export type StudyEnumFilterType = CodingEnumFilterType;
export type TeamEnumFilterType = CodingEnumFilterType;

export type BoardType = {
  name: string;
}[];

export type BoardNameConverterType = {
  type: string;
  display: string;
}[];

export type CourseType =
  | 'COMPANY'
  | 'PORTFOLIO'
  | 'SALARY'
  | 'RESUME'
  | 'BOOTCAMP'
  | 'PROJECT'
  | 'ETC';

export type CourseTypeArray = CourseType[];

export type LanguageType =
  | 'JAVA'
  | 'JS'
  | 'PYTHON'
  | 'C'
  | 'CPP'
  | 'CS'
  | 'SPB'
  | 'RE'
  | 'AN'
  | 'EX'
  | 'NO'
  | 'HTML'
  | 'CSS'
  | 'ETC';

export type LanguageTypeArray = LanguageType[];

export type StudyType = 'ALGORITHM' | 'STRUCTURE' | 'CODING' | 'ETC';

export type StudyTypeArray = StudyType[];

export type TeamType = 'FRONT' | 'BACK' | 'DBA' | 'DBS' | 'DESIGNER' | 'ETC';

export type TeamTypeArray = TeamType[];

export type MentorType =
  | 'PROGRAMMING'
  | 'GAME'
  | 'AI'
  | 'SECURITY'
  | 'DATA'
  | 'HARDWARE'
  | 'DESIGN'
  | 'STRATEGIC_MANAGEMENT'
  | 'MARKETING'
  | 'SELF_DEVELOPMENT'
  | 'NETWORK'
  | 'ETC';

export type MentorTypeArray = MentorType[];

export type BoardDataType = {
  boardId: number;
  boardType: string;
  commentCnt: number;
  comments: string | null;
  content: string;
  course: CourseTypeArray | null;
  createdAt: string;
  dislikeCnt: number;
  imgUrl: string | null;
  language: LanguageTypeArray | null;
  likeCnt: number;
  name: string;
  postCnt: number;
  profileUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE' | null;
  study: StudyTypeArray | null;
  team: TeamTypeArray | null;
  title: string;
  updatedAt: string;
  userKey: number | null;
  viewCnt: number;
};

export type TagOptionType = {
  coding: TagType[];
  course: TagType[];
  study: TagType[];
  team: TagType[];
};

export type TagType = {
  value: string;
  label: string;
};

export type TagNameType = {
  coding: string;
  course: string;
  study: string;
  team: string;
};

export type ReplyDataType = {
  boardId: number;
  commentId: number;
  content: string;
  createdAt: string;
  name: string;
  profileUrl: string | null;
  updataedAt: string | null;
  userKey: number;
  userId: string;
};
