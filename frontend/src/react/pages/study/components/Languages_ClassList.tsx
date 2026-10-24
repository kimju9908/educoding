import React, { useState, useEffect, forwardRef, useCallback } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';

import type { ChapterType, LanguageClassListProps, LanguageRefArray } from '../StudyType';

import { useAppDispatch, useAppSelector } from '../../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../../redux/slice/LoginModalSlice';
import {
  EachClass,
  ClassHeader,
  ClassHeaderTitle,
  ClassHeaderTitleButton,
  ClassContents,
  ClassSet,
  ClassName,
} from '../../../styles/study/Study_Components';

const Languages_ClassList = forwardRef<LanguageRefArray, LanguageClassListProps>(
  ({ language, selectedChapters, filtered }, ref) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { cat1 } = useParams();

    const getRefByIndex = (index: number): React.RefObject<HTMLDivElement | null> | null => {
      // 타입 확인 메소드
      if (ref && 'current' in ref && Array.isArray(ref.current)) {
        return ref.current[index as number];
      }
      return null;
    };

    // // Class Contents onClick
    // const handleNavigation = (navigatepath: string): void => {
    //   navigate(navigatepath);
    // };

    const isAuth = useAppSelector((state) => state.auth.accesstoken);
    const [dialogOpen, setDialogOpen] = useState(false); // 다이얼로그 상태 관리
    const handleLoginRedirect = (): void => {
      dispatch(openLoginModal());
    };

    const handleDialogClose = (): void => {
      setDialogOpen(false);
    };

    const handleNavigation = (navigatepath: string): void => {
      if (isAuth === '') {
        setDialogOpen(true); // 로그인하지 않은 경우 다이얼로그 열기
        return;
      }
      navigate(navigatepath); // 클릭한 클래스에 해당하는 경로로 이동
    };

    // Class Header Toggle
    const [isToggleOpenId, setIsToggleOpenId] = useState<ChapterType['id'][]>([]);
    const toggleVisibility = useCallback((id: string): void => {
      setIsToggleOpenId((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    }, []);

    const [chapters, setChapters] = useState<ChapterType[] | undefined>([] as ChapterType[]);

    useEffect(() => {
      const filteredChapters = filtered
        ? selectedChapters?.filter((cls) => cls.id === cat1)
        : selectedChapters;

      setChapters(filteredChapters);
    }, [language, selectedChapters, filtered, cat1]);

    // Class List Set
    const EachClassComponent: React.FC<{
      num: number;
      cls: ChapterType;
      isOpen: boolean;
      onToggle: (id: string) => void;
    }> = ({ num, cls, isOpen, onToggle }) => (
      <EachClass key={cls.id} ref={getRefByIndex(num)}>
        <ClassHeader isOpen={isOpen}>
          <ClassHeaderTitle>{cls.title}</ClassHeaderTitle>
          {!filtered && <ClassHeaderTitleButton isOpen={isOpen} onClick={() => onToggle(cls.id)} />}
        </ClassHeader>
        <ClassContents isOpen={isOpen}>
          {cls.contents.map((content, index) => (
            <ClassSet key={`${cls.id}-${content.label}-${index}`}>
              {' '}
              {/* 고유한 key를 만들어 줍니다 */}
              <ClassName
                onClick={() => handleNavigation(content.navigatepath)}
                style={{
                  paddingLeft: filtered ? '15px' : '38px',
                }}
              >
                {filtered ? content.label : content.label.substring(4)}{' '}
              </ClassName>
            </ClassSet>
          ))}
        </ClassContents>
      </EachClass>
    );

    return (
      <>
        {chapters?.map((cls, index) => (
          <EachClassComponent
            key={cls.id}
            num={index} // cls.id와 index를 결합하여 유일한 key 생성
            cls={cls}
            isOpen={isToggleOpenId.includes(cls.id)}
            onToggle={() => toggleVisibility(cls.id)}
          />
        ))}
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
  },
);

export default React.memo(Languages_ClassList);
