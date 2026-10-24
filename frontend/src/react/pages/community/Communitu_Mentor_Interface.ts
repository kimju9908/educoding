// Community_Mentor 파일
// Redux 상태 타입 정의
export interface MentorPaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface MentorModalState {
  isOpen: boolean;
  selectedMentorId: number;
  modalType: 'detail' | 'rating' | null;
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

export interface MentorPageRenderingData {
  currentPage: number;
  size: number;
  searchKeyword: string;
  sortType: string;
  tag: string | null;
}

// Select 옵션 타입 정의
export interface OptionType {
  value: string;
  label: string;
}

// Form 데이터 타입 정의
export interface MentorFormData {
  title: string;
  tag: OptionType[];
  position: string;
  career: OptionType[];
  currentJob: string;
  hour: string;
  price: string;
  mentorId: number | null;
}

// MentorData 타입 정의 (전달된 데이터 구조에 따라 조정 가능)
export interface MentorData {
  mentorId?: number;
  title?: string;
  tag?: string[];
  position?: string;
  career?: string;
  currentJob?: string;
  hour?: string;
  price?: string;
}

// Mentor_Modal 파일
export interface MentorModalData {
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

export interface MentorDetailResponse {
  data: MentorModalData;
}

export interface MentorModalProps {
  mentorId: number;
  modalType: 'detail' | 'rating';
  mentorDelete: (mentorId: number) => void;
}

// Mentor_PostList 파일
// Mentor 데이터 타입 정의
export interface MentorData {
  mentorId?: number;
  profileUrl?: string;
  userNickname?: string;
  menteeCount?: number;
  title?: string;
  position?: string;
  career?: string;
  currentJob?: string;
  rating?: number;
  content?: string | null;
}
// 컴포넌트 props 타입 정의
export interface MentorPostListProps {
  onBox: (mentorId: number) => void; // mentorId 타입은 데이터에 따라 string으로 변경 가능
  contentData: MentorData[]; // contentData가 null일 수 있음
  onStarRating: (mentorId: number) => void; // mentorId 타입은 데이터에 따라 string으로 변경 가능
}

// Form 데이터 타입 정의
export interface OptionType {
  value: string;
  label: string;
}

export interface MentorFormData {
  title: string;
  tag: OptionType[];
  position: string;
  career: OptionType[];
  currentJob: string;
  hour: string;
  price: string;
  mentorId: number | null;
}

export interface MentorData {
  mentorId?: number;
  title?: string;
  tag?: string[];
  position?: string;
  career?: string;
  currentJob?: string;
  hour?: string;
  price?: string;
  content?: string | null;
}

// MentorDisPlaynames 타입 정의
export type DisplayNames = Record<string, string>;

// 컴포넌트 props 타입 정의
export interface BoardMentorSearchProps {
  searchInput: string;
  onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchButton: () => void;
  onFilterCleanButton: () => void;
  enumFilter: string | null; // enumFilter는 문자열 또는 null일 수 있음
}

// Modal_Detail 파일
// mentorModalData 타입 정의
export interface MentorModalData {
  mentorId: number; // 또는 string, 데이터에 따라 조정
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
  mentorUserKey: number; // 또는 string, userKey와 일치해야 함
}

// 컴포넌트 props 타입 정의
export interface ModalDetailProps {
  mentorDelete: (mentorId: number) => void; // mentorId 타입은 데이터에 따라 string으로 변경 가능
  mentorModalData: MentorModalData;
  modalType: string; // 현재 사용되지 않음, 필요 시 구체화 가능
  onApplyClick: () => void;
}

// Modal_Post_WriteEditor_Preview 파일
// PreviewData 타입 정의 (Post_WriteEditor_Mentor에서 가져오거나 공유)
export interface PreviewData {
  title: string;
  tag: string[];
  position: string;
  career: string;
  currentJob: string;
  hour: string;
  price: string;
  content: string;
  profileUrl: string;
  rating: number | null;
  userNickname: string;
  menteeCount: number;
}

// 컴포넌트 props 타입 정의
export interface PreviewModalProps {
  previewData: PreviewData | null; // null 허용
}

// Modal_Review 파일
export interface ReviewData {
  reviewId: number;
  profileUrl: string;
  nickname: string;
  menteeKey: number;
  createdAt: string;
  rating: number;
  reviewText: string;
}

export interface ModalReviewProps {
  mentorId: number;
}

// Post_WriteEditor_Mentor 파일
export interface MentorModalState {
  isOpen: boolean;
}

export interface PreviewData {
  title: string;
  tag: string[];
  position: string;
  career: string;
  currentJob: string;
  hour: string;
  price: string;
  content: string;
  profileUrl: string;
  rating: number | null;
  userNickname: string;
  menteeCount: number;
}

export interface PreviewRequest {
  userKey: number | null;
}

export interface PreviewResponse {
  data: {
    title?: string;
    tag?: string[];
    position?: string;
    career?: string;
    currentJob?: string;
    hour?: string;
    price?: string;
    profileUrl?: string;
    rating?: number;
    userNickname?: string;
    menteeCount?: number;
  };
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

export interface PostWriteEditorMentorProps {
  formData: MentorFormData;
  mentorData: MentorData;
  isModifyMode: boolean;
}
