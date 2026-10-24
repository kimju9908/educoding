export type MainBoardRequest = {
  page: number;
  size: number;
  boardType: string; // 'coding' | 'course' | ...
};

export type BoardResponse<T> = {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableType;
  size: number;
  sort: SortType;
  totalElements: number;
  totalPages: number;
};

export type BoardDataType = {
  boardId: number;
  boardType: string;
  commentCnt: number;
  comments: string | null;
  content: string;
  course: CourseType | null;
  createdAt: string;
  dislikeCnt: number;
  imgUrl: string | null;
  language: LanguageType | null;
  likeCnt: number;
  name: string;
  postCnt: number;
  profileUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE' | null;
  study: StudyType | null;
  team: TeamType | null;
  title: string;
  updatedAt: string;
  userKey: number | null;
  viewCnt: number;
};

export type CourseType = (
  | 'COMPANY'
  | 'PORTFOLIO'
  | 'SALARY'
  | 'RESUME'
  | 'BOOTCAMP'
  | 'PROJECT'
  | 'ETC'
)[];

export type LanguageType = (
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
  | 'ETC'
)[];

export type StudyType = ('ALGORITHM' | 'STRUCTURE' | 'CODING' | 'ETC')[];

export type TeamType = ('FRONT' | 'BACK' | 'DBA' | 'DBS' | 'DESIGNER' | 'ETC')[];

export type PageableType = {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: SortType;
  unpaged: boolean;
};

export type SortType = {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
};
