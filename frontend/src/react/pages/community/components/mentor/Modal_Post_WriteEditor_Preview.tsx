import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';

import { closeModal } from '../../../../../redux/mentorSlice/MentorModalSlice';
import {
  Backdrop,
  MentorModal,
  MentorModalBottomBox,
  MentorModalBottomText,
  MentorModalContentsContainer,
  MentorModalDetailBox,
  MentorModalDetailContents,
  MentorModalDetailTitle,
  MentorModalHeader,
  MentorModalHeaderTitle,
  MentorModalMiddleHR,
  MentorModalProfileBottom,
  MentorModalProfileBottomEach,
  MentorModalProfileBottomEachLeft,
  MentorModalProfileBottomEachRight,
  MentorModalProfileBox,
  MentorModalProfileExpCnt,
  MentorModalProfileImg,
  MentorModalProfileNickname,
  MentorModalProfileTop,
  MentorModalProfileTopLeft,
  MentorModalProfileTopRight,
} from '../../../../styles/community/Community_Mentor_Modal';
import { PreviewModalProps } from '../../Communitu_Mentor_Interface';

const PreviewModal: React.FC<PreviewModalProps> = ({ previewData }) => {
  const dispatch = useDispatch();

  // 멘토 Detail창 닫기
  const handleCloseModal = (): void => {
    dispatch(closeModal()); // Redux 상태 업데이트
  };

  return (
    <Backdrop>
      <MentorModal>
        {/* 모달 상단: 제목 및 버튼 */}
        <MentorModalHeader>
          <MentorModalHeaderTitle>멘토링 미리보기</MentorModalHeaderTitle>
          <CloseIcon style={{ cursor: 'pointer' }} onClick={handleCloseModal} />
        </MentorModalHeader>

        {/* 데이터가 있을 때만 콘텐츠 렌더링 */}
        {previewData ? (
          <MentorModalContentsContainer>
            <MentorModalProfileBox>
              <MentorModalProfileTop>
                <MentorModalProfileTopLeft>
                  <MentorModalProfileImg
                    src={previewData.profileUrl || '/images/general/default_profile.png'}
                  />
                </MentorModalProfileTopLeft>
                <MentorModalProfileTopRight>
                  <MentorModalProfileNickname>
                    {previewData.userNickname}
                  </MentorModalProfileNickname>
                  <MentorModalProfileExpCnt>
                    {previewData.menteeCount || 0}명의 멘토로 활동중
                  </MentorModalProfileExpCnt>
                </MentorModalProfileTopRight>
              </MentorModalProfileTop>
              <MentorModalProfileBottom>
                <MentorModalProfileBottomEach>
                  <MentorModalProfileBottomEachLeft>직무</MentorModalProfileBottomEachLeft>
                  <MentorModalProfileBottomEachRight>
                    {previewData.position}
                  </MentorModalProfileBottomEachRight>
                </MentorModalProfileBottomEach>
                <MentorModalProfileBottomEach>
                  <MentorModalProfileBottomEachLeft>경력</MentorModalProfileBottomEachLeft>
                  <MentorModalProfileBottomEachRight>
                    {previewData.career}
                  </MentorModalProfileBottomEachRight>
                </MentorModalProfileBottomEach>
                <MentorModalProfileBottomEach>
                  <MentorModalProfileBottomEachLeft>현직</MentorModalProfileBottomEachLeft>
                  <MentorModalProfileBottomEachRight>
                    {previewData.currentJob}
                  </MentorModalProfileBottomEachRight>
                </MentorModalProfileBottomEach>
              </MentorModalProfileBottom>
            </MentorModalProfileBox>
            <MentorModalMiddleHR />
            <MentorModalDetailBox>
              <MentorModalDetailTitle>{previewData.title}</MentorModalDetailTitle>
              <MentorModalDetailContents
                dangerouslySetInnerHTML={{ __html: previewData.content }}
              />
            </MentorModalDetailBox>
            <MentorModalBottomBox>
              <MentorModalBottomText>
                1회 멘토링 : {previewData.hour}시간 / {previewData.price}원
              </MentorModalBottomText>
            </MentorModalBottomBox>
          </MentorModalContentsContainer>
        ) : (
          <div
            style={{
              width: '100%',
              color: 'var(--educoding-white)',
              fontFamily: 'bold',
              padding: '30px',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            데이터가 없습니다.
          </div>
        )}
      </MentorModal>
    </Backdrop>
  );
};

export default PreviewModal;
