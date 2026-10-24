import { useEffect } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@mui/material';

import MentorApi from '../../../../../api/AxiosApi/mentorApi/MentorApi';
import AcceptMT from '../../../../styles/community/Accept_Mentor';
import { BottomNoticeContainer, BottomNoticeText } from '../../../../styles/login/login';

// 버튼 스타일 정의
const loginButtonStyles: React.CSSProperties = {
  fontFamily: 'bold, sans-serif',
  fontSize: '14px',
  width: '200px',
  height: '53.13px',
};

// 컴포넌트 정의
const AcceptMentor: React.FC = () => {
  const navigate = useNavigate();
  const { mentorId, menteeKey } = useParams(); // 제네릭 생략

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        if (mentorId && menteeKey) {
          await MentorApi.grantForMenteeReview(mentorId, menteeKey);
        } else {
          console.error('mentorId or menteeKey is undefined');
        }
      } catch (error) {
        console.error('Error granting review permission:', error);
      }
    };
    fetchData();
  }, [mentorId, menteeKey]);

  return (
    <>
      <AcceptMT.Wrap>
        <AcceptMT.BodyContainer>
          <AcceptMT.MainBannerContainer>
            <AcceptMT.MainBox>
              <AcceptMT.MainTitle>Welcome to educoding!</AcceptMT.MainTitle>
              <AcceptMT.MainText>
                멘티의 신청을 수락하셨습니다.
                <br />
                멘티에게 리뷰 작성 권한을 부여되었습니다!
                <br />
                많은 도움을 주시고 좋은 평점을 받으세요!
                <br />
                서로에게 도움되는 커뮤니티!
                <br />
                만들어서 좋은 관계를 이어나갔으면 좋겠습니다.
              </AcceptMT.MainText>
              <Button
                variant="contained"
                color="secondary"
                sx={loginButtonStyles}
                onClick={() => navigate('/')}
              >
                메인 페이지
              </Button>
            </AcceptMT.MainBox>
          </AcceptMT.MainBannerContainer>
          <BottomNoticeContainer>
            <BottomNoticeText onClick={() => navigate('/legal/Terms')}>
              서비스 이용약관
            </BottomNoticeText>
            <BottomNoticeText onClick={() => navigate('/legal/Privacy')}>
              개인정보 처리방침
            </BottomNoticeText>
          </BottomNoticeContainer>
        </AcceptMT.BodyContainer>
      </AcceptMT.Wrap>
    </>
  );
};

export default AcceptMentor;
