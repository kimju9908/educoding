import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import EditIcon from '@mui/icons-material/Edit';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import Fab from '@mui/material/Fab';

import { useAppDispatch, useAppSelector } from '../../../../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../../../../redux/slice/LoginModalSlice';
import { BoardWriteButtonProps } from '../../../CommunityType';

const Board_WriteButton: React.FC<BoardWriteButtonProps> = ({ boardType }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userAuth = useAppSelector((state) => state.auth.accesstoken);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false); // 다이얼로그 상태 관리
  const handleLoginRedirect = (): void => {
    dispatch(openLoginModal());
  };

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const handleWritePost = (): void => {
    if (userAuth === '') {
      setDialogOpen(true); // 로그인하지 않은 경우 다이얼로그 열기
      return;
    }
    navigate(`/community/${boardType}/write`, {
      state: {
        id: boardType,
      },
    });
  };

  const fabStyle = {
    position: 'fixed',
    bottom: 96,
    right: 30,
  };

  return (
    <>
      <Fab sx={fabStyle} color="secondary" size="large" aria-label="edit" onClick={handleWritePost}>
        <EditIcon />
      </Fab>
      {/* 로그인 확인 다이얼로그 */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
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
          로그인이 필요한 서비스입니다.
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'right' }}>
          <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleDialogClose}>
            취소
          </Button>
          <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleLoginRedirect}>
            로그인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Board_WriteButton;
