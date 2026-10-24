export type OutletContextType = React.RefObject<HTMLDivElement>;

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

export type ReportReplyEditorProps = {
  handleCloseEditor: () => void;
};

export type ReportReplyAreaProps = {
  commentData: ReportReplyDataType[];
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

export type UserSearchProps = {
  onSearchChange: React.Dispatch<React.SetStateAction<string | null>>;
};

export type HeaderType = string[];

export type UserListData = HeaderType[];

export type TableObject = {
  data: UserListData;
};

export interface UserListState {
  page: number | string;
  size: number | string;
  sortBy: string;
  order: string;
  search: string | null;
  userKey: number;
  userId: string;
  email: string;
  nickname: string;
  registeredAt: string;
  role: string | null;
}
export interface UserListProps {
  page: number | string;
  size: number | string;
  sortBy: string;
  order: string;
  search: string | null;
}

export type UserListPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (value: number) => void;
};
