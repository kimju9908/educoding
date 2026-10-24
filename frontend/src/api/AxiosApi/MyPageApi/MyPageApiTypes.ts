import { z } from 'zod';

export const ImageUrlSchema = z.string();

export type ImageUrlResponse = z.infer<typeof ImageUrlSchema>;

// export type MyProfileResponse = {
//   userId: string;
//   postCnt: number;
//   email: string;
//   nickname: string;
//   role: string;
//   registeredAt: string;
//   updatedAt: string;
//   profileUrl: string;
//   introduction: string;
// };

export const MyProfileSchema = z.object({
  userId: z.string(),
  postCnt: z.number(),
  email: z.string().email(),
  nickname: z.string(),
  role: z.string(),
  registeredAt: z.string(),
  updatedAt: z.string(),
  profileUrl: z.string().nullable(),
  introduction: z.string().nullable(),
});

export type MyProfileResponse = z.infer<typeof MyProfileSchema>;

// export type MyBoardRequest = {
//   page: number;
//   size: number;
//   sortBy: string;
//   order: string;
// };

export const MyBoardRequestSchema = z.object({
  page: z.number(),
  size: z.number(),
  sortBy: z.string(),
  order: z.string(),
});

export type MyBoardRequest = z.infer<typeof MyBoardRequestSchema>;

export const SortSchema = z.object({
  empty: z.boolean(),
  sorted: z.boolean(),
  unsorted: z.boolean(),
});

export const PageableSchema = z.object({
  offset: z.number(),
  pageNumber: z.number(),
  pageSize: z.number(),
  paged: z.boolean(),
  sort: SortSchema,
  unpaged: z.boolean(),
});

export const CourseSchema = z.enum([
  'COMPANY',
  'PORTFOLIO',
  'SALARY',
  'RESUME',
  'BOOTCAMP',
  'PROJECT',
  'ETC',
]);

export const LanguageSchema = z.enum([
  'JAVA',
  'JS',
  'PYTHON',
  'C',
  'CPP',
  'CS',
  'SPB',
  'RE',
  'AN',
  'EX',
  'NO',
  'HTML',
  'CSS',
  'ETC',
]);

export const StudySchema = z.enum(['ALGORITHM', 'STRUCTURE', 'CODING', 'ETC']);

export const TeamSchema = z.enum(['FRONT', 'BACK', 'DBA', 'DBS', 'DESIGNER', 'ETC']);

export const ReportSchema = z.enum(['ILLEGAL_CONTENT', 'VIOLENCE', 'SPAM', 'PLAGIARISM', 'ETC']);

export const BoardDataSchema = z.object({
  boardId: z.number(),
  boardType: z.string().nullable(),
  commentCnt: z.number(),
  comments: z.string().nullable(),
  content: z.string(),
  course: z.array(CourseSchema).nullable(),
  createdAt: z.string(),
  dislikeCnt: z.number(),
  imgUrl: z.string().nullable(),
  language: z.array(LanguageSchema).nullable(),
  likeCnt: z.number(),
  name: z.string(),
  postCnt: z.number(),
  profileUrl: z.string().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).nullable(),
  study: z.array(StudySchema).nullable(),
  team: z.array(TeamSchema).nullable(),
  title: z.string(),
  updatedAt: z.string().nullable(),
  userKey: z.number().nullable(),
  viewCnt: z.number(),
});

export type BoardDataType = z.infer<typeof BoardDataSchema>;

export const ReportBoardDataSchema = z.object({
  boardId: z.number(),
  content: z.string(),
  createdAt: z.string(),
  imgUrl: z.string().nullable(),
  name: z.string(),
  report: z.array(ReportSchema).nullable(),
  reportCommentResponses: z.string().optional(),
  reportId: z.number(),
  status: z.string(),
  title: z.string(),
});

export type ReportBoardDataType = z.infer<typeof ReportBoardDataSchema>;

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

export const MyBoardResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    empty: z.boolean(),
    first: z.boolean(),
    last: z.boolean(),
    number: z.number(),
    numberOfElements: z.number(),
    pageable: PageableSchema,
    size: z.number(),
    sort: SortSchema,
    totalElements: z.number(),
    totalPages: z.number(),
  });

export const MyBoardListSchema = MyBoardResponseSchema(BoardDataSchema);

export type MyBoardListResponse = z.infer<typeof MyBoardListSchema>;

export const MyReportListSchema = MyBoardResponseSchema(ReportBoardDataSchema);

export type MyReportBoardListResponse = z.infer<typeof MyReportListSchema>;

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

// export type MyReportBoardRequest = {
//   page: number;
//   size: number;
//   sortBy: string;
//   order: string;
//   status: string;
// };

export const MyReportBoardRequestSchema = z.object({
  page: z.number(),
  size: z.number(),
  sortBy: z.string(),
  order: z.string(),
  status: z.string(),
});

export type MyReportBoardRequest = z.infer<typeof MyReportBoardRequestSchema>;

export const MyReportPostRequestSchema = z.number();

export type MyReportPostRequest = z.infer<typeof MyReportPostRequestSchema>;

export type DelMyReportRequest = MyReportPostRequest;

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

export type ModifyNicknameRequest = {
  nickname: string;
};

export type ModifyIntroductionRequest = {
  introduction: string;
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
