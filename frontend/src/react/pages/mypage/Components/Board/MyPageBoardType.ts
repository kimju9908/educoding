import {
  MyReportCommentResponse,
  ReportBoardDataType,
} from '../../../../../api/AxiosApi/MyPageApi/MyPageApiTypes';

export type OutletContextType = React.RefObject<HTMLDivElement>;

export type MyBoardNameConverterType = {
  type: string;
  display: string;
}[];

export type CSPostUserProfileProps = {
  postCnt: number;
};

export type CSPostMainContentProps = {
  postData: ReportBoardDataType | null;
};

export type CSPostReplyProps = {
  commentData: MyReportCommentResponse[] | null;
};
