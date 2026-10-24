import React, { useState } from 'react';

import { useTheme } from '@mui/material';

import { CSPostReplyProps } from './AdminPageBoardType';
import {
  ReplyContainer,
  ReplyList,
  ReplyEach,
  ReplyUserProfileBox,
  ReplyUserProfileImg,
  ReplyUserId,
  ReplyUserProfileTextBox,
  ReplyUserDate,
  ReplyMiddle,
  ReplyMiddleText,
  ReplyEachTopBox,
  ReplyMoreButtonArea,
  ReplyMoreButton,
} from '../../../../styles/community/Community_Post';
import Board_Pagination from '../../../community/components/common/board/Board_Pagination';

const Cs_Post_ReplyArea: React.FC<CSPostReplyProps> = ({ commentData }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages] = useState<number>(1);
  const theme = useTheme();

  // paging handler
  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (!commentData) return <p>데이터 없음</p>;

  return (
    <>
      {Array.isArray(commentData) && commentData.length > 0 ? (
        <ReplyContainer>
          <ReplyList>
            {commentData.map((reply, index) => (
              <ReplyEach key={index}>
                <ReplyEachTopBox>
                  <ReplyUserProfileBox>
                    <ReplyUserProfileImg isProfile={null} />
                    <ReplyUserProfileTextBox>
                      <ReplyUserId>{reply.name}</ReplyUserId>
                      <ReplyUserDate>
                        {new Date(reply.createdAt)
                          .toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })
                          .replace(/\. /g, '. ')}{' '}
                        작성
                      </ReplyUserDate>
                    </ReplyUserProfileTextBox>
                  </ReplyUserProfileBox>
                  <ReplyMoreButtonArea>
                    <ReplyMoreButton theme={theme.palette.mode} />
                  </ReplyMoreButtonArea>
                </ReplyEachTopBox>
                <ReplyMiddle>
                  <ReplyMiddleText dangerouslySetInnerHTML={{ __html: reply.content }} />
                </ReplyMiddle>
              </ReplyEach>
            ))}
          </ReplyList>
          {totalPages > 1 && (
            <Board_Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </ReplyContainer>
      ) : null}
    </>
  );
};

export default Cs_Post_ReplyArea;
