import React, { JSX, useState } from 'react';

import {
  MiddleSortOuterContiner,
  MiddleSortInnerContainer,
  MiddleSortContentsBox,
  MiddleSortTitleActive,
  MiddleSortTitleInactive,
} from '../../../../../styles/community/Community_Board';
import { BoardOrderProps } from '../../../CommunityType';

const Board_Order: React.FC<BoardOrderProps> = ({ boardType, onSortChange }) => {
  const [activeOrder, setActiveOrder] = useState('createdAt');

  // order posts
  const handleSort = (sortBy: string): void => {
    setActiveOrder(sortBy);
    onSortChange(sortBy);
  };

  const renderOrderOptions = (): JSX.Element | null => {
    switch (boardType) {
      case 'coding':
        return (
          <MiddleSortContentsBox>
            {activeOrder === 'createdAt' ? (
              <MiddleSortTitleActive onClick={() => handleSort('createdAt')}>
                최신순
              </MiddleSortTitleActive>
            ) : (
              <MiddleSortTitleInactive onClick={() => handleSort('createdAt')}>
                최신순
              </MiddleSortTitleInactive>
            )}
            {activeOrder === 'viewCnt' ? (
              <MiddleSortTitleActive onClick={() => handleSort('viewCnt')}>
                조회순
              </MiddleSortTitleActive>
            ) : (
              <MiddleSortTitleInactive onClick={() => handleSort('viewCnt')}>
                조회순
              </MiddleSortTitleInactive>
            )}
            {activeOrder === 'commentCnt' ? (
              <MiddleSortTitleActive onClick={() => handleSort('commentCnt')}>
                답변많은순
              </MiddleSortTitleActive>
            ) : (
              <MiddleSortTitleInactive onClick={() => handleSort('commentCnt')}>
                답변많은순
              </MiddleSortTitleInactive>
            )}
            {activeOrder === 'likeCnt' ? (
              <MiddleSortTitleActive onClick={() => handleSort('likeCnt')}>
                좋아요순
              </MiddleSortTitleActive>
            ) : (
              <MiddleSortTitleInactive onClick={() => handleSort('likeCnt')}>
                좋아요순
              </MiddleSortTitleInactive>
            )}
          </MiddleSortContentsBox>
        );
      case 'course':
      case 'study':
      case 'team':
        return (
          <MiddleSortContentsBox>
            {activeOrder === 'createdAt' ? (
              <MiddleSortTitleActive onClick={() => handleSort('createdAt')}>
                최신순
              </MiddleSortTitleActive>
            ) : (
              <MiddleSortTitleInactive onClick={() => handleSort('createdAt')}>
                최신순
              </MiddleSortTitleInactive>
            )}
            {activeOrder === 'viewCnt' ? (
              <MiddleSortTitleActive onClick={() => handleSort('viewCnt')}>
                조회순
              </MiddleSortTitleActive>
            ) : (
              <MiddleSortTitleInactive onClick={() => handleSort('viewCnt')}>
                조회순
              </MiddleSortTitleInactive>
            )}
            {activeOrder === 'commentCnt' ? (
              <MiddleSortTitleActive onClick={() => handleSort('commentCnt')}>
                댓글많은순
              </MiddleSortTitleActive>
            ) : (
              <MiddleSortTitleInactive onClick={() => handleSort('commentCnt')}>
                댓글많은순
              </MiddleSortTitleInactive>
            )}
            {activeOrder === 'likeCnt' ? (
              <MiddleSortTitleActive onClick={() => handleSort('likeCnt')}>
                좋아요순
              </MiddleSortTitleActive>
            ) : (
              <MiddleSortTitleInactive onClick={() => handleSort('likeCnt')}>
                좋아요순
              </MiddleSortTitleInactive>
            )}
          </MiddleSortContentsBox>
        );
      case 'mentor':
        return (
          <MiddleSortContentsBox>
            {activeOrder === 'createdAt' ? (
              <MiddleSortTitleActive onClick={() => handleSort('createdAt')}>
                신규멘토순
              </MiddleSortTitleActive>
            ) : (
              <MiddleSortTitleInactive onClick={() => handleSort('createdAt')}>
                신규멘토순
              </MiddleSortTitleInactive>
            )}
            {activeOrder === 'menteeCount' ? (
              <MiddleSortTitleActive onClick={() => handleSort('menteeCount')}>
                멘티많은순
              </MiddleSortTitleActive>
            ) : (
              <MiddleSortTitleInactive onClick={() => handleSort('menteeCount')}>
                멘티많은순
              </MiddleSortTitleInactive>
            )}
            {activeOrder === 'rating' ? (
              <MiddleSortTitleActive onClick={() => handleSort('rating')}>
                평점높은순
              </MiddleSortTitleActive>
            ) : (
              <MiddleSortTitleInactive onClick={() => handleSort('rating')}>
                평점높은순
              </MiddleSortTitleInactive>
            )}
          </MiddleSortContentsBox>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <MiddleSortOuterContiner>
        <MiddleSortInnerContainer>{renderOrderOptions()}</MiddleSortInnerContainer>
      </MiddleSortOuterContiner>
    </>
  );
};

export default Board_Order;
