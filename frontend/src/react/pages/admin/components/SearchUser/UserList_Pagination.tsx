import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import { UserListPaginationProps } from '../../AdminType';

const UserList_Pagination: React.FC<UserListPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handleChange = (event: React.ChangeEvent<unknown>, value: number): void => {
    onPageChange(value);
  };

  return (
    <Stack spacing={2} alignItems="center">
      <Pagination
        count={totalPages} // 총 페이지 수
        page={currentPage} // 현재 페이지
        onChange={handleChange} // 페이지 변경 이벤트
        color="secondary"
        size="large"
        showFirstButton // 처음 페이지 이동 버튼 추가
        showLastButton // 마지막 페이지 이동 버튼 추가
      />
    </Stack>
  );
};

export default UserList_Pagination;
