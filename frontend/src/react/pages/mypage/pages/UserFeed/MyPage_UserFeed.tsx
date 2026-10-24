import { JSX, useEffect, useLayoutEffect, useState } from 'react';

import { useNavigate, useOutletContext } from 'react-router-dom';

import Button from '@mui/material/Button';
import { useQuery } from '@tanstack/react-query';

import MyPageApi from '../../../../../api/AxiosApi/MyPageApi/MyPageApi';
import { useAppDispatch } from '../../../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../../../redux/slice/LoginModalSlice';
import {
  Wrap,
  Container,
  LeftContainer,
  RightContainer,
  PageTitleBar,
  PageSubTitleBar,
} from '../../../../styles/mypage/MyPage_Main';
import {
  RightContainerEach,
  RightFeedContainer,
  RightFeedText,
  RightFeedContentsBox,
  WriteButtonsArea,
  WriteCancelButton,
} from '../../../../styles/mypage/MyPage_UserFeed';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';
import UserFeed_WriteEditor from '../../components/UserFeed/UserFeed_WriteEditor';
import { OutletContextType } from '../../MyPageType';

const MyPage_UserFeed = (): JSX.Element => {
  const mainContentRef = useOutletContext<OutletContextType>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // 페이지 진입 시 스크롤 위치 초기화
  useLayoutEffect(() => {
    if (mainContentRef?.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [mainContentRef]);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleOpenEditor = (): void => setIsEditing(true);
  const handleCloseEditor = (): void => setIsEditing(false);

  const { data, error } = useQuery({
    queryKey: ['myprofile'],
    queryFn: MyPageApi.getmyprofile,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error) {
      dispatch(openLoginModal());
      navigate('/', { replace: true });
    }
  }, [error, dispatch, navigate]);

  return (
    <>
      <Wrap>
        <Container>
          <LeftContainer>
            <LeftTopProfile />
            <LeftMenus />
          </LeftContainer>
          <RightContainer>
            <PageTitleBar>내 프로필</PageTitleBar>
            <PageSubTitleBar>내 소개</PageSubTitleBar>
            <RightContainerEach>
              <RightFeedContainer>
                {isEditing ? (
                  <UserFeed_WriteEditor
                    handleCloseEditor={handleCloseEditor}
                    introduction={data?.introduction ?? ''}
                  />
                ) : (
                  <RightFeedContentsBox>
                    {data?.introduction ? (
                      // ✅ 소개글이 있을 때
                      <>
                        <RightFeedText dangerouslySetInnerHTML={{ __html: data.introduction }} />
                        <WriteButtonsArea>
                          <WriteCancelButton onClick={handleOpenEditor}>수정하기</WriteCancelButton>
                        </WriteButtonsArea>
                      </>
                    ) : (
                      // ✅ 소개글이 없을 때
                      <div style={{ paddingBottom: '50px' }}>
                        <RightFeedText
                          style={{ padding: '50px 0 20px', textAlign: 'center', borderBottom: '0' }}
                        >
                          등록된 소개글이 없습니다.
                        </RightFeedText>
                        <Button
                          onClick={handleOpenEditor}
                          variant="contained"
                          color="secondary"
                          sx={{
                            fontFamily: 'bold, sans-serif',
                            fontSize: '12px',
                            color: 'white',
                            padding: '10px 20px',
                          }}
                        >
                          내 소개글 등록하기
                        </Button>
                      </div>
                    )}
                  </RightFeedContentsBox>
                )}
              </RightFeedContainer>
            </RightContainerEach>
          </RightContainer>
        </Container>
      </Wrap>
    </>
  );
};

export default MyPage_UserFeed;
