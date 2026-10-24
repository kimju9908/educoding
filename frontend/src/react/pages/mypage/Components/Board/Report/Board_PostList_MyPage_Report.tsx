import React, { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import MyPageApi from '../../../../../../api/AxiosApi/MyPageApi/MyPageApi';
import {
  MyBoardResponse,
  MyReportBoardRequest,
  ReportBoardDataType,
} from '../../../../../../api/AxiosApi/MyPageApi/MyPageApiTypes';
import { useAppSelector } from '../../../../../../redux/hooks/reduxHooks';
import {
  PostEach,
  PostListContainer,
  PostTop,
  PostTopUser,
  PostTopUserId,
  PostTopUserImg,
  PostTopDays,
  PostMiddle,
  PostMiddleContentsTitle,
  PostMiddleContentsText,
  PostMiddleContentsUpper,
  PostMiddleContentsSolved,
  PostMiddleContentsPending,
  PostBottom,
  PostBottomTagsBox,
  PostBottomTag,
} from '../../../../../styles/community/Community_Board';
import Board_Pagination from '../../../../community/components/common/board/Board_Pagination';
import { MyPageReportProps } from '../../../MyPageType';
import { ReportDisplayNames } from '../Cs_DisplayNames';

const Board_PostList_MyPage_Report: React.FC<MyPageReportProps> = ({
  page,
  size,
  status,
  onPageChange,
}) => {
  const navigate = useNavigate();

  const profileUrl = useAppSelector((state) => state.auth.profile);

  // useEffect(() => {
  //   const fetchMyReportPosts = async (): Promise<void> => {
  //     try {
  //       const request = { page, size, sortBy: 'createdAt', order: 'DESC', status };

  //       const response = await MyPageApi.getMyReportBoard(request);
  //       setReportPosts(response.data.content);
  //       setTotalPages(response.data.totalPages);
  //       console.log('신고 목록 게시글 타입 확인: ', response);
  //     } catch (error) {
  //       console.error('내 신고한 게시글 불러오기 오류:', error);
  //     }
  //   };
  //   fetchMyReportPosts();
  // }, [page, size, status]); // status 변경 시 데이터 새로 불러오기

  const useMyReportBoardData = (
    params: MyReportBoardRequest,
  ): UseQueryResult<AxiosResponse<MyBoardResponse<ReportBoardDataType>>, Error> => {
    return useQuery({
      queryKey: ['myreportboard', params],
      queryFn: MyPageApi.getMyReportBoardQuery,
      enabled: !!params,
    });
  };

  const param: MyReportBoardRequest = useMemo(
    () => ({
      page,
      size,
      sortBy: 'createdAt',
      order: 'DESC',
      status,
    }),
    [page, size, status],
  );

  const { data, error } = useMyReportBoardData(param);

  if (error) console.error('내 신고 게시글 불러오기 오류', error);

  // HTML 태그 제거 함수
  const getTextFromHTML = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const handlePostClick = (post: ReportBoardDataType): void => {
    navigate(`/mypage/report/post/${post.reportId}`);
  };

  return (
    <>
      <PostListContainer>
        {Array.isArray(data?.data.content) && data.data.content.length > 0 ? (
          data?.data.content.map((post) => (
            <PostEach
              key={post.boardId}
              style={{ cursor: 'pointer' }}
              onClick={() => handlePostClick(post)}
            >
              <PostTop>
                <PostTopUser>
                  <PostTopUserImg
                    style={{
                      backgroundImage: `url(${profileUrl ?? '/images/general/default_profile.png'})`,
                    }}
                  />
                  <PostTopUserId>{post.name ?? '알 수 없음'}</PostTopUserId>
                </PostTopUser>
                <PostTopDays>
                  {new Date(post.createdAt).toISOString().slice(0, 10).replace(/-/g, '.')}
                  {'. '}
                  작성
                </PostTopDays>
              </PostTop>
              <PostMiddle>
                <PostMiddleContentsUpper>
                  {post.status === 'INACTIVE' ? (
                    <PostMiddleContentsSolved>해결됨</PostMiddleContentsSolved>
                  ) : (
                    <PostMiddleContentsPending>미해결</PostMiddleContentsPending>
                  )}
                  <PostMiddleContentsTitle>{post.title}</PostMiddleContentsTitle>
                </PostMiddleContentsUpper>
                <PostMiddleContentsText>{getTextFromHTML(post.content)}</PostMiddleContentsText>
              </PostMiddle>
              <PostBottom>
                {Array.isArray(post.report) && post.report.some((item) => item.trim() !== '') && (
                  <PostBottomTagsBox>
                    {post.report && post.report.length > 0
                      ? post.report.map((lang, index) => (
                          <PostBottomTag>{ReportDisplayNames[lang]}</PostBottomTag>
                        ))
                      : null}
                  </PostBottomTagsBox>
                )}
              </PostBottom>
            </PostEach>
          ))
        ) : (
          <div
            style={{
              width: '100%',
              color: 'var(--educoding-white)',
              fontFamily: 'bold',
              padding: '30px',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            신고한 게시글이 없습니다.
          </div>
        )}
      </PostListContainer>

      <Board_Pagination
        currentPage={page}
        totalPages={data?.data.totalPages ?? 1}
        onPageChange={onPageChange}
      />
    </>
  );
};

export default Board_PostList_MyPage_Report;
