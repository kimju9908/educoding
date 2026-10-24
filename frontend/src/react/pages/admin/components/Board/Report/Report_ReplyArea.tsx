import React, { useState } from 'react';

import { useTheme } from '@mui/material';

import Write_Report_Reply from './Write_Report_Reply';
import { useAppDispatch, useAppSelector } from '../../../../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../../../../redux/slice/LoginModalSlice';
import {
  ReplyContainer,
  SuggestBox,
  ReplyList,
  ReplyEach,
  ReplyUserProfileBox,
  ReplyUserId,
  ReplyUserProfileTextBox,
  ReplyMiddle,
  ReplyMiddleText,
  EditorBox,
  ReplyEachTopBox,
  ReplyMoreButtonArea,
  ReplyMoreButton,
} from '../../../../../styles/community/Community_Post';
import Board_Pagination from '../../../../community/components/common/board/Board_Pagination';
import { ReportReplyAreaProps } from '../../../AdminType';

const Report_ReplyArea: React.FC<ReportReplyAreaProps> = ({ commentData }) => {
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages] = useState<number>(1);
  const dispatch = useAppDispatch();
  const theme = useTheme();

  // paging handler
  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reply Editor Open
  const handleBoxClick = (): void => {
    if (!editorOpen) {
      setEditorOpen(true); // 클릭 시 에디터 열기
    }
  };

  // Reply Editor Close
  const handleCloseEditor = (): void => {
    setEditorOpen(false);
  };

  const nickname = useAppSelector((state) => state.auth.nickname);

  return (
    <>
      <ReplyContainer>
        <SuggestBox
          expanded={editorOpen}
          onClick={nickname ? handleBoxClick : (): void => { dispatch(openLoginModal()); }}
        >
          <span style={{ marginLeft: '15px', cursor: 'pointer' }}>
            📝
            {nickname
              ? ` ${nickname}님, 이 글에 대한 답변을 남겨 주세요!`
              : ' 로그인하고 이 글에 대한 의견을 남겨 주세요!'}
          </span>
          {editorOpen ? (
            <EditorBox expanded={editorOpen}>
              <Write_Report_Reply handleCloseEditor={handleCloseEditor} />
            </EditorBox>
          ) : null}
        </SuggestBox>
        {Array.isArray(commentData) && commentData.length > 0 ? (
          <ReplyList>
            {commentData.map((reply, index) => (
              <ReplyEach key={index}>
                <ReplyEachTopBox>
                  <ReplyUserProfileBox>
                    <ReplyUserProfileTextBox>
                      <ReplyUserId>{reply.name}</ReplyUserId>
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
        ) : null}
        {totalPages > 1 && (
          <Board_Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </ReplyContainer>
    </>
  );
};

export default Report_ReplyArea;
