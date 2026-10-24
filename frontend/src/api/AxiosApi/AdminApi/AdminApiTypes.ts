// 관리자 정보
export interface ProfileData {
  userId: string;
  email: string;
  nickname: string;
  role: string;
  registeredAt: string;
  updatedAt: string;
  profileUrl: string;
}

// 관리자 이메일 변경 요청
export interface EmailRequest {
  email: string;
}

// 관리자 비밀번호 변경
export interface PwRequest {
  password: string;
}

// 관리자 프로필 변경
export interface ProfilePicRequest {
  profileUrl: string;
}

export type ImageUrlResponse = string;

// 유저검색 정렬 요청
export interface SearchUserRequest {
  page: number;
  size: number;
  sortBy: string;
  order: string;
  search: string;
}

// 유저검색, 찾기 응답 데이터 반환값
export interface SearchUserData {
  userKey: number;
  userId: string;
  email: string;
  nickname: string;
  registeredAt: string;
  page: number | string;
  size: number | string;
  sortBy: string;
  order: string;
  search: string | null;
  role: string;
}

export type DeleteUserRequest = number[];

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// 유저 일별 증가량 응답 데이터 반환값
export type UserIncrementalData = Record<string, number>;

// Report Categories
export type ReportType = ('ILLEGAL_CONTENT' | 'VIOLENCE' | 'SPAM' | 'PLAGIARISM' | 'ETC')[];

// 신고글 데이터 타입
export type ReportBoardDataType = {
  boardId: number;
  content: string;
  createdAt: string;
  imgUrl: string | null;
  name: string;
  report: ReportType;
  reportCommentResponses?: string;
  reportId: number;
  status: string;
  title: string;
};

export type MyReportCommentRequest = {
  reportId: number;
  page: number;
  size: number;
  sortBy: string;
  order: string;
};

export type MyReportCommentResponse = {
  name: string;
  reportId: number;
  commentId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type MyReportPostRequest = number;

// 유저신고, 건의 게시판 페이지네이션 요청
export type CsBoardRequest = {
  page: number;
  size: number;
  sortBy: string;
  order: string;
  status: string;
};

export type CsPostRequest = number;

export type ReportReplyRequest = {
  reportId: number;
  content: string;
};

// 유저신고 댓글 목록 요청
export type ReportReplyListRequest = {
  reportId: number;
  page: number;
  size: number;
  sortBy: string;
  order: string;
};

// 유저신고 댓글 반환
export type ReportReplyListResponse = {
  name: string;
  reportId: number;
  commentId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type DelCsPostRequest = number;

export type MyBoardResponse<T> = {
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

export type ReportReplyDataType = {
  reportId: number;
  commentId: number;
  content: string;
  createdAt: string;
  name: string;
  profileUrl: string | null;
  updataedAt: string | null;
  userKey: number;
};

export type MyReplyResponse<T> = {
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
