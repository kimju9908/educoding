import { useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import MentorApi from '../../../../../api/AxiosApi/mentorApi/MentorApi';
import { openModal, closeModal } from '../../../../../redux/mentorSlice/MentorModalSlice';
import {
  setCurrentPage,
  setTotalPages,
} from '../../../../../redux/mentorSlice/MentorPaginationSlice';
import {
  Container,
  Wrap,
  LeftContainer,
  RightContainer,
  BoardContainer,
  PageTitleBar,
} from '../../../../styles/community/Community_Main';
import {
  MentorItem,
  MentorModalState,
  MentorPageRenderingData,
  MentorPaginationState,
} from '../../Communitu_Mentor_Interface';
import { MentorType } from '../../CommunityType';
import Board_Order from '../../components/common/board/Board_Order';
import Board_Pagination from '../../components/common/board/Board_Pagination';
import Boards_Title from '../../components/common/board/Board_Title';
import Board_WriteButton from '../../components/common/board/Board_WriteButton';
import Side_BoardList from '../../components/common/side/Side_BoardList';
import Side_MentorPopularTags from '../../components/common/side/Side_Mentor_PopularTag';
import TopWriters from '../../components/common/side/Side_TopWriters';
import WeeklyBest from '../../components/common/side/Side_WeeklyBest';
import Board_Mentor_Search from '../../components/mentor/Board_Mentor_Search';
import Mentor_Modal from '../../components/mentor/Mentor_Modal';
import Mentor_PostList from '../../components/mentor/Mentor_PostList';

interface RootState {
  mentorPagination: MentorPaginationState;
  mentorModal: MentorModalState;
}

const Community_Mentor: React.FC = () => {
  const boardType = 'mentor';
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchInput, setSearchInput] = useState<string>('');
  const [searchButton, setSearchButton] = useState<string>('');
  const [sortyBy, setSortBy] = useState<string>('createdAt');
  const [contentData, setContentData] = useState<MentorItem[]>([]);
  const [readContentDataErr, setReadContentDataErr] = useState<Error | null>(null);
  const [enumFilter, setEnumFilter] = useState<MentorType | null>(null);
  const [isMentorDeleted, setIsMentorDeleted] = useState<boolean>(false);

  const currentPage = useSelector((state: RootState) => state.mentorPagination.currentPage);
  const detailItemsPerPage = useSelector((state: RootState) => state.mentorPagination.itemsPerPage);
  const totalPages = useSelector((state: RootState) => state.mentorPagination.totalPages);

  const { isOpen, selectedMentorId, modalType } = useSelector(
    (state: RootState) => state.mentorModal,
  );

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const mentorPageRenderingData: MentorPageRenderingData = {
        currentPage,
        size: detailItemsPerPage,
        searchKeyword: searchButton,
        sortType: sortyBy,
        tag: enumFilter,
      };
      try {
        const response = await MentorApi.getContentData(mentorPageRenderingData);
        setContentData(response.data.mentorItemBox);
        dispatch(setTotalPages(response.data.totalPages));
      } catch (error) {
        setReadContentDataErr(error as Error);
      }
    };
    fetchData();
  }, [
    sortyBy,
    searchButton,
    currentPage,
    enumFilter,
    isMentorDeleted,
    dispatch,
    detailItemsPerPage,
  ]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mentorId = queryParams.get('mentor_id');
    const modalTypeParam = queryParams.get('modalType') as 'detail' | 'rating' | null;

    if (mentorId && modalTypeParam) {
      dispatch(openModal({ mentorId: Number(mentorId), modalType: modalTypeParam }));
    } else {
      dispatch(closeModal());
    }
  }, [location.search, dispatch]);

  if (readContentDataErr) return <div>에러 발생: {readContentDataErr.message}</div>;

  useEffect(() => {
    return (): void => {
      if (isOpen) {
        dispatch(closeModal());
      }
    };
  }, [dispatch, isOpen]);

  const handleEnumFilterChange = (newEnumFilter: MentorType | null): void => {
    setEnumFilter(newEnumFilter);
  };

  const mentorDelete = (): void => {
    dispatch(closeModal());
    setIsMentorDeleted(true);
    navigate('/community/mentor');
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchInput(e.target.value);
  };

  const handleSearchButtonClick = (): void => {
    setSearchButton(searchInput);
  };

  const filterCleanButtonClick = (): void => {
    setEnumFilter(null);
    setSearchInput('');
    setSearchButton('');
    dispatch(setCurrentPage(1));
  };

  const handleBoxClick = (mentorId?: number): void => {
    if (mentorId !== undefined) {
      dispatch(openModal({ mentorId, modalType: 'detail' }));
      navigate(`?mentor_id=${mentorId}&modalType=detail`);
    }
  };

  const handleStarRatingClick = (mentorId?: number): void => {
    if (mentorId !== undefined) {
      dispatch(openModal({ mentorId, modalType: 'rating' }));
      navigate(`?mentor_id=${mentorId}&modalType=rating`);
    }
  };

  const handleSortChange = (newSortBy: string): void => {
    setSortBy(newSortBy);
  };

  const handlePageChange = (pageNumber: number): void => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      dispatch(setCurrentPage(pageNumber));
    }
  };

  return (
    <Wrap>
      <Container>
        <LeftContainer>
          <Boards_Title boardType={boardType} />
          <Side_BoardList boardType={boardType} />
          <Side_MentorPopularTags
            enumFilter={enumFilter}
            onEnumFilterChange={handleEnumFilterChange}
          />
          <WeeklyBest />
          <TopWriters />
        </LeftContainer>
        <RightContainer>
          <PageTitleBar>멘토링 게시판</PageTitleBar>
          <BoardContainer>
            <Board_Mentor_Search
              onSearchInput={handleSearchInputChange}
              onSearchButton={handleSearchButtonClick}
              onFilterCleanButton={filterCleanButtonClick}
              searchInput={searchInput}
              enumFilter={enumFilter}
            />
            <Board_Order boardType={boardType} onSortChange={handleSortChange} />
            <Mentor_PostList
              onBox={handleBoxClick}
              contentData={contentData}
              onStarRating={handleStarRatingClick}
            />
            {isOpen && selectedMentorId !== null && modalType !== null ? (
              <Mentor_Modal
                mentorId={selectedMentorId}
                modalType={modalType}
                mentorDelete={mentorDelete}
              />
            ) : null}
          </BoardContainer>
          <Board_Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </RightContainer>
      </Container>
      {!isOpen && (
        <>
          <Board_WriteButton boardType={boardType} />
        </>
      )}
    </Wrap>
  );
};

export default Community_Mentor;
