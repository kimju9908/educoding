export type OutletContextType = React.RefObject<HTMLDivElement>;

export type HeaderType = string[];

export type CodingTestData = HeaderType[];

export type TableObject = {
  data: CodingTestData;
};

export type MenuType = {
  id: string;
  sort: string;
  label: string;
  link: string;
}[];

export type MyPageReportProps = {
  page: number;
  size: number;
  status: string;
  onPageChange: (newPage: number) => void;
};

export type MyPageCommunityProps = Omit<MyPageReportProps, 'status'>;

export type UserFeedWriteEditorProps = {
  handleCloseEditor: () => void;
  introduction: string;
};

export type SNSListType = {
  name: string;
  iconLight: string;
  iconDark: string;
}[];

export type AlertSwitchProps = {
  checked: boolean;
  onChange: (_event: React.SyntheticEvent, checked: boolean) => void;
};

export type CropType = {
  x: number;
  y: number;
};
export type CropSizeType = {
  width: number;
  height: number;
};

export type CroppedAreaPixelType = CropType & CropSizeType;

// 멘토링 관련

// 멘토링 데이터 타입 정의
export interface MentoringListItem {
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

// API 응답 타입 정의
export interface MentorApiResponse {
  data: {
    mentoringListItemBox: MentoringListItem[];
    totalPages: number;
  };
}

// 컴포넌트 props 타입 정의
export interface BoardMentorListMyPageProps {
  page: number;
  size: number;
  onPageChange: (newPage: number) => void;
}
