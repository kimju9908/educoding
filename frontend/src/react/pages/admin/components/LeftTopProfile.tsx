import { JSX, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import AdminApi from '../../../../api/AxiosApi/AdminApi/AdminApi';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../../redux/slice/LoginModalSlice';
import {
  ProfileImage,
  UserNickName,
  LeftContainerEach,
  UserSignupDate,
  UserProfileTextBox,
} from '../../../styles/admin/Admin_Main';

const LeftTopProfile = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profile, nickname } = useAppSelector((state) => state.auth);
  // const [userSignupDate, setUserSignupDate] = useState<string>('');

  // useEffect(() => {
  //   // Red
  //   const mypage = async (): Promise<void> => {
  //     try {
  //       const response = await AxiosApi.getmyprofile();
  //       setUserSignupDate(response.registeredAt);
  //     } catch (error) {
  //       navigate('/login', { replace: true });
  //     }
  //   };
  //   mypage();
  // }, [profile, nickname, navigate]);

  const { data, error } = useQuery({
    queryKey: ['adminprofile'],
    queryFn: AdminApi.adminProfile,
  });

  useEffect(() => {
    if (error) {
      dispatch(openLoginModal());
      navigate('/', { replace: true });
    }
  }, [error, dispatch, navigate]);

  return (
    <>
      <LeftContainerEach>
        <ProfileImage isProfile={profile}></ProfileImage>
        <UserProfileTextBox>
          <UserNickName>{nickname}</UserNickName>
          <UserSignupDate>
            가입일 :{' '}
            {data?.data.registeredAt
              ? new Date(data.data.registeredAt).toISOString().slice(0, 10).replace(/-/g, '.')
              : '정보 없음'}
            {'. '}
          </UserSignupDate>
        </UserProfileTextBox>
      </LeftContainerEach>
    </>
  );
};

export default LeftTopProfile;
