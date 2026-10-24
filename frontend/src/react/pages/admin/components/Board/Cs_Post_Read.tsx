import { JSX, useLayoutEffect } from 'react';

import { useLocation, useOutletContext, useParams } from 'react-router-dom';

import { useQueries } from '@tanstack/react-query';

import type { MyBoardNameConverterType, OutletContextType } from './AdminPageBoardType';

import Cs_Post_MainContents from './Cs_Post_MainContents';
import Cs_Post_UserProfile from './Cs_Post_UserProfile';
import Report_ReplyArea from './Report/Report_ReplyArea';
import AdminApi from '../../../../../api/AxiosApi/AdminApi/AdminApi';
import {
  MyReportCommentRequest,
  MyReportPostRequest,
  ReportBoardDataType,
  ReportReplyDataType,
} from '../../../../../api/AxiosApi/AdminApi/AdminApiTypes';
import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
} from '../../../../styles/community/Community_Main';

const Cs_Post_Read = (): JSX.Element => {
  const location = useLocation();
  const mainContentRef = useOutletContext<OutletContextType>();
  const { boardType, boardId } = useParams();
  const queryParams = new URLSearchParams(location.search);

  const page: number = Number(queryParams.get('page')) || 1;
  const size: number = Number(queryParams.get('size')) || 10;
  const sortBy: string = queryParams.get('sortBy') || 'createdAt';
  const order: string = queryParams.get('order') || 'ASC';

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  const boardNameConverter: MyBoardNameConverterType = [{ type: 'report', display: '신고 게시글' }];

  const boardDisplayName =
    boardNameConverter.find((item) => item.type === boardType)?.display || boardType;

  const boardIdNumber = boardId ? Number(boardId) : undefined;
  const isReport = boardType === 'report' && boardIdNumber !== undefined;

  const pathVariable = boardIdNumber as MyReportPostRequest;
  const params = { reportId: boardIdNumber, page, size, sortBy, order } as MyReportCommentRequest;

  const results = useQueries({
    queries: [
      {
        queryKey: ['myreportpost', pathVariable],
        queryFn: () => AdminApi.getMyReportPost(pathVariable),
        enabled: isReport,
      },
      {
        queryKey: ['myreportcomment', params],
        queryFn: () => AdminApi.getMyReportComments(params),
        enabled: isReport,
      },
    ],
  });
  const [postQuery, commentQuery] = results;

  const postData: ReportBoardDataType | null =
    postQuery.isSuccess && postQuery.data?.data ? postQuery.data.data : null;
  const commentData: ReportReplyDataType[] | null =
    commentQuery.isSuccess && commentQuery.data?.data ? commentQuery.data.data.content : null;

  if (!postData || !commentData) {
    return <p>초기 로딩 중...</p>;
  }

  return (
    <>
      <Wrap>
        <Container>
          <LeftContainer>
            <Cs_Post_UserProfile />
          </LeftContainer>
          <RightContainer>
            {/* 커뮤니티로 이동 기능? */}
            <PageTitleBar>{boardDisplayName}</PageTitleBar>
            {/* 실제 게시글 정보 불러오기는 여기서 */}
            <Cs_Post_MainContents postData={postData} />
            <PageTitleBar>신고글 답변</PageTitleBar>
            <Report_ReplyArea commentData={commentData} />
          </RightContainer>
        </Container>
      </Wrap>
    </>
  );
};

export default Cs_Post_Read;
