import { FaStar } from 'react-icons/fa';

import Mentor_STY from '../../../../styles/community/Community_Mentor';
import { MentorPostListProps } from '../../Communitu_Mentor_Interface';

const Mentor_PostList: React.FC<MentorPostListProps> = ({ onBox, contentData, onStarRating }) => {
  return (
    <>
      {contentData && contentData.length > 0 ? (
        <Mentor_STY.ContentsContainer>
          {contentData.map((data, index) => (
            <Mentor_STY.MentorContentBox
              onClick={() => data.mentorId !== undefined && onBox(data.mentorId)}
              key={index}
            >
              <Mentor_STY.TopInContentBox>
                <Mentor_STY.ProfileUrl
                  src={data.profileUrl || '/images/general/default_profile.png'}
                  onError={(e) => (e.currentTarget.src = '/images/general/default_profile.png')}
                />
                <Mentor_STY.RightBox>
                  <Mentor_STY.Nickname>{data.userNickname}</Mentor_STY.Nickname>
                  <Mentor_STY.ApplyCount>
                    {data.menteeCount}명의 멘토로 활동중
                  </Mentor_STY.ApplyCount>
                </Mentor_STY.RightBox>
              </Mentor_STY.TopInContentBox>
              <Mentor_STY.MiddleInContentBox>
                <Mentor_STY.Title>{data.title}</Mentor_STY.Title>
              </Mentor_STY.MiddleInContentBox>
              <Mentor_STY.BottomInContentBox>
                <Mentor_STY.Position>
                  직무 <span>{data.position}</span>
                </Mentor_STY.Position>
                <Mentor_STY.Career>
                  경력 <span>{data.career}</span>
                </Mentor_STY.Career>
                <Mentor_STY.CurrentJob>
                  현직 <span>{data.currentJob}</span>
                </Mentor_STY.CurrentJob>
                <Mentor_STY.Box>
                  평점
                  <Mentor_STY.StarRating
                    onClick={(e) => {
                      e.stopPropagation();
                      if (data.mentorId !== undefined) {
                        onStarRating(data.mentorId);
                      }
                    }}
                  >
                    <FaStar style={{ paddingBottom: '1px' }} size={10} />
                    {data.rating?.toFixed(1) ?? 'N/A'}
                    <Mentor_STY.ChevronRight />
                  </Mentor_STY.StarRating>
                </Mentor_STY.Box>
              </Mentor_STY.BottomInContentBox>
            </Mentor_STY.MentorContentBox>
          ))}
        </Mentor_STY.ContentsContainer>
      ) : (
        <Mentor_STY.DataNotFound>조건에 맞는 데이터가 없습니다.</Mentor_STY.DataNotFound>
      )}
    </>
  );
};

export default Mentor_PostList;
