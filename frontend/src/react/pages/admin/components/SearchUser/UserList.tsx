import { JSX, useEffect, useLayoutEffect, useState } from 'react';

import { useOutletContext } from 'react-router-dom';

import { Dialog, DialogActions, DialogContent, Button } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';

import UserList_Pagination from './UserList_Pagination';
import AdminApi from '../../../../../api/AxiosApi/AdminApi/AdminApi';
import { SearchUserRequest } from '../../../../../api/AxiosApi/AdminApi/AdminApiTypes';
import {
  UserDeleteButton,
  UserDeleteContainer,
  UserDeleteText,
  UserListTable,
  UserListTableStyledTD,
  UserListTableStyledTH,
  UserListTableStyledTR,
} from '../../../../styles/admin/Admin_UserSearch';
import { HeaderType, UserListProps, UserListState } from '../../AdminType';
import { OutletContextType } from '../Board/AdminPageBoardType';

const headers: HeaderType = ['No.', '구분', '닉네임', '아이디', '이메일주소', '가입일자'];

const UserList: React.FC<UserListProps> = ({ page, size, sortBy, order, search }) => {
  const mainContentRef = useOutletContext<OutletContextType>();
  const [selectAll, setSelectAll] = useState(false);
  const [userList, setUserList] = useState<UserListState[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  // 전체 선택
  const handleSelectAllUser = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      // 모든 유저의 userKey를 선택 목록에 추가
      setSelectedUsers(new Set(userList.map((user) => user.userKey)));
    } else {
      // 선택 목록 초기화
      setSelectedUsers(new Set());
    }
  };
  // 개별 선택
  const handleSelectEachUser =
    (userKey: number) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const updatedSelectedUsers = new Set(selectedUsers);
      if (event.target.checked) {
        updatedSelectedUsers.add(userKey);
      } else {
        updatedSelectedUsers.delete(userKey);
      }
      setSelectedUsers(updatedSelectedUsers);
    };

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useLayoutEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // 유저 리스트 조회
  useEffect(() => {
    const loadUserList = async (): Promise<void> => {
      try {
        const params: SearchUserRequest = {
          page: currentPage,
          // size: Number(size),
          size: 20,
          sortBy,
          order,
          search: search !== null ? String(search) : '',
        };

        const response = await AdminApi.searchUsers(params);
        setUserList(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('유저 리스트 가져오는 중 오류 발생 : ', error);
      }
    };
    loadUserList();
  }, [currentPage, sortBy, order, search, size]);

  // 유저 삭제
  const handleDeleteUsers = async (): Promise<void> => {
    try {
      if (selectedUsers.size === 0) {
        handleOpenDialog('삭제할 사용자를 선택하세요.');
        return;
      }
      const userKeysArray = Array.from(selectedUsers);
      const usersToDelete = userList.filter((user) => userKeysArray.includes(user.userKey));
      if (!usersToDelete.length) {
        handleOpenDialog('선택한 사용자를 찾을 수 없습니다.');
        return;
      }
      if (usersToDelete.some((user) => user.role === 'ADMIN')) {
        handleOpenDialog(
          <div style={{ lineHeight: '20px' }}>
            삭제할 수 없는 사용자가 선택되었습니다.
            <br />
            관리자는 삭제할 수 없습니다.
          </div>,
        );
        return;
      }
      handleOpenDialog('정말 삭제하시겠습니까?', async () => {
        try {
          const response = await AdminApi.deleteUsers(usersToDelete.map((user) => user.userKey));
          if (response) {
            handleOpenDialog('선택한 회원이 삭제되었습니다.');
            setUserList((prevList) => prevList.filter((user) => !selectedUsers.has(user.userKey)));
            setSelectedUsers(new Set());
          }
        } catch (error) {
          console.error('회원 삭제 중 오류 발생: ', error);
        }
      });
    } catch (error) {
      console.error('회원 삭제 중 오류 발생: ', error);
    }
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | JSX.Element>('');
  const [isConfirmDialog, setIsConfirmDialog] = useState(false);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  const handleOpenDialog = (message: string | JSX.Element, confirmAction?: () => void): void => {
    setDialogMessage(message);
    setIsConfirmDialog(!!confirmAction);
    setOnConfirm(() => confirmAction || null);
    setOpenDialog(true);
  };
  const handleCloseDialog = (): void => {
    setOpenDialog(false);
  };

  const handleConfirm = (): void => {
    if (onConfirm) onConfirm();
    setOpenDialog(false);
  };

  // paging handler
  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <UserListTable>
        <thead>
          <UserListTableStyledTH>
            <UserListTableStyledTD style={{ width: '20px' }}>
              <Checkbox
                color="secondary"
                size="small"
                checked={selectAll}
                onChange={handleSelectAllUser}
                indeterminate={selectedUsers.size > 0 && selectedUsers.size < userList.length}
              />
            </UserListTableStyledTD>
            {headers.map((header, index) => (
              <UserListTableStyledTD key={index}>{header}</UserListTableStyledTD>
            ))}
          </UserListTableStyledTH>
        </thead>
        <tbody>
          {userList.map((user) => (
            <UserListTableStyledTR key={user.userKey}>
              <UserListTableStyledTD>
                <Checkbox
                  color="secondary"
                  size="small"
                  checked={selectedUsers.has(user.userKey)} // Set을 이용해 선택 여부 확인
                  onChange={handleSelectEachUser(user.userKey)} // 해당 행의 체크박스만 변경
                />
              </UserListTableStyledTD>

              <UserListTableStyledTD>{user.userKey}</UserListTableStyledTD>
              <UserListTableStyledTD>{user.role}</UserListTableStyledTD>
              <UserListTableStyledTD>{user.nickname}</UserListTableStyledTD>
              <UserListTableStyledTD>{user.userId}</UserListTableStyledTD>
              <UserListTableStyledTD>{user.email}</UserListTableStyledTD>
              <UserListTableStyledTD>
                {new Date(user.registeredAt).toLocaleDateString('en-CA').replace(/\//g, '.')}
              </UserListTableStyledTD>
            </UserListTableStyledTR>
          ))}
        </tbody>
      </UserListTable>
      <UserDeleteContainer>
        <UserDeleteText>
          선택된 유저{' '}
          <span
            style={{
              paddingLeft: '10px',
              paddingRight: '5px',
              fontFamily: 'heavy',
              color: 'var(--educoding-purple)',
            }}
          >
            {selectedUsers.size}
          </span>
          명
        </UserDeleteText>
        <UserDeleteButton onClick={() => handleDeleteUsers()}>삭제</UserDeleteButton>
      </UserDeleteContainer>
      <UserList_Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            fontFamily: 'regular',
            minWidth: '400px', // 최소 가로 너비 설정
            maxWidth: '500px', // 최대 가로 너비 설정
          },
        }}
      >
        <DialogContent
          sx={{
            fontFamily: 'bold',
            fontSize: '14px',
            textAlign: 'center', // 가로 정렬
            display: 'flex',
            justifyContent: 'center', // 세로 정렬
            alignItems: 'center', // 세로 정렬
          }}
        >
          {dialogMessage}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'right' }}>
          {isConfirmDialog ? (
            <>
              <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleCloseDialog}>
                취소
              </Button>
              <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleConfirm}>
                확인
              </Button>
            </>
          ) : (
            <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleCloseDialog}>
              닫기
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserList;
