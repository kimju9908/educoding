export type TopWriterData = {
  name: string;
  profileUrl: string;
  postCnt: number;
  userKey: number;
};

export type PopularPostData = {
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

export type OtherPostRequest = {
  userId: number;
  page: number;
  size: number;
};

export type OtherPostResponse<T> = {
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

export type OtherProfileRequest = {
  userId: number;
};

export type OtherProfileResponse = {
  introduction: string | null;
  nickname: string;
  postCnt: number;
  profileUrl: string | null;
  registeredAt: string;
};

export type BoardRequest = {
  page: number;
  size: number;
  boardType: string; // 'coding' | 'course' | ...
  sortBy: string;
  order: string;
  status: string;
  enumFilter: string;
  search: string;
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

export type PostCheckRequest = {
  id: number;
};

export type ModifyPostStatusRequest = {
  boardId: number;
  status: string;
  boardType: string;
};

export type DeletePostRequest = {
  id: number;
};

export type PostRequest = {
  id: number;
};

export type PostResponse = {
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

export type BoardReactionStatusRequest = {
  boardId: number;
  userId: number;
};

export type BoardReactionStatusResponse = {
  dislikeCnt: number;
  likeCnt: number;
  reaction: 'LIKE' | 'DISLIKE' | 'NONE';
};

export type BoardReactionRequest = {
  boardId: number;
  userId: number;
  reaction: 'LIKE' | 'DISLIKE';
};

export type BoardReactionResponse = string | '';

export type WriteCodingPostRequest = {
  boardType: string; // 리터럴 타입 설정할지 고민
  title: string;
  language: LanguageType;
  content: string;
};

export type ModifyCodingPostRequest = WriteCodingPostRequest & { boardId: number };

export type WriteCoursePostRequest = {
  boardType: string;
  title: string;
  course: CourseType;
  content: string;
};

export type ModifyCoursePostRequset = WriteCoursePostRequest & { boardId: number };

export type WriteStudyPostRequest = {
  boardType: string;
  title: string;
  study: StudyType;
  content: string;
};

export type ModifyStudyPostRequest = WriteStudyPostRequest & { boardId: number };

export type WriteTeamPostRequest = {
  boardType: string;
  title: string;
  team: TeamType;
  content: string;
};

export type ModifyTeamPostRequest = WriteTeamPostRequest & { boardId: number };

export type ReplyRequest = {
  boardId: number;
  page: number;
  size: number;
  sortBy: string;
  order: string;
};

export type ReplyResponse<T> = {
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

export type WriteReplyRequest = {
  boardId: number;
  content: string;
};

export type ModifyReplyRequest = {
  boardId: number;
  commentId: number;
  name?: string;
  content: string;
};

export type DeleteReplyRequest = number;
export type SimilarPostRequest = number;

export type SimilarPostResponse = {
  boardId: number;
  title: string;
  content: string;
  boardType: string;
  viewCnt: number;
  commentCnt: number;
};

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
