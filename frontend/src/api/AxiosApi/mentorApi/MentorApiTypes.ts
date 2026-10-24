export interface MentorContentData {
  mentorId: number;
  profileUrl: string;
  userNickname: string;
  menteeCount: number;
  position: string;
  career: string;
  currentJob: string;
  title: string;
  content: string;
  hour: string;
  price: string;
  mentorUserKey: number;
}

export interface MentorPostData {
  title: string;
  position: string;
  content: string;
  career: string;
  currentJob: string;
  tag: string[];
  hour: string;
  price: string;
  userKey: number | null;
  mentorId?: number;
}

export interface PreviewRequest {
  userKey: number | null;
}

export interface PreviewResponse {
  profileUrl: string;
  userNickname: string;
  menteeCount: number;
  rating?: number;
}

export interface ReviewData {
  reviewId: number;
  profileUrl: string;
  nickname: string;
  menteeKey: number;
  createdAt: string;
  rating: number;
  reviewText: string;
}

export interface UpdatedReviewData {
  rating: number;
  reviewText: null;
}

export interface SubmitReviewData {
  mentorId: number;
  menteeKey: number;
  rating: number;
  reviewText: string;
}

export interface MenteeCheckResponse {
  isMentee: boolean;
}

export interface MentorItem {
  mentorId?: number;
  profileUrl?: string;
  userNickname?: string;
  menteeCount?: number;
  title: string;
  position: string;
  career: string;
  currentJob: string;
  rating?: number;
  content: string | null;
}

export interface MentorApiResponse {
  currentPage: number;
  mentorItemBox: MentorItem[];
  reviewItemBox: null | unknown; // reviewItemBox의 정확한 타입이 필요하면 정의
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface MentorPageRenderingData {
  currentPage: number;
  size: number;
  searchKeyword: string;
  sortType: string;
  tag: string | null;
}

export interface MentoringListResponse {
  mentoringId: number;
  mentoringNickname: string;
  mentoringProfileUrl: string;
  mentoringEmail: string;
  mentoringCreatedAt: string;
  mentoringPosition: string;
  mentoringCareer: string;
  mentoringPrice: string;
  mentoringRating: number;
  mentoringTitle: string;
  mentoringContent: string;
  mentoringHour: string;
  mentorId: number; // 멘티 목록에서 리뷰 모달창 이동할때만 사용
  hasReview: boolean; // 멘티 목록에서 리뷰 모달창 이동할때만 사용
}

export interface PaginationResponse {
  totalItems: number;
  totalPages: number;
  size: number;
  currentPage: number;
  mentoringListItemBox: MentoringListResponse[];
}
