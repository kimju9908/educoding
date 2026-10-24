import styled from 'styled-components';

interface LineCountProps {
  lineCount: number;
}

interface ThemeProps {
  theme: 'light' | 'dark'; // theme.palette.mode의 값
}

export const Backdrop = styled.div.attrs({
  id: 'backdrop',
})`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

export const MentorModal = styled.div.attrs({
  id: 'mentormodal',
})`
  width: 70vw;
  max-width: 550px; /* 모달 최대 너비 */
  height: auto;
  max-height: 80vh;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--educoding-dark);
  justify-content: flex-start;
  align-items: center;
  z-index: 200;
  box-shadow: 1px 1px 10px 1px rgba(0, 0, 0, 0.05);
  padding-bottom: 30px;
`;

export const MentorModalHeader = styled.div.attrs({
  id: 'mentormodalheader',
})`
  width: 100%;
  height: 40px;
  background-color: var(--educoding-purple);
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px 0 15px;
`;

export const MentorModalHeaderTitle = styled.div.attrs({
  id: 'mentormodalheadertext',
})`
  color: white;
  font-family: bold, sans-serif;
  font-size: 14px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const MentorModalHeaderIconBox = styled.div.attrs({
  id: 'mentormodalheadericonbox',
})`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

export const MentorModalContentsContainer = styled.div.attrs({
  id: 'mentormodalcontentscontainer',
})`
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-bottom: 55px; /* ReviewInputcontainer 높이(60px) + 약간의 여백 */
  max-height: calc(80vh - 35px); /* 헤더(40px) 제외 */
  min-height: 55vh;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 10px;
    height: 100%;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--educoding-hover);
    /* border-radius: 30px; */
  }
  &::-webkit-scrollbar-track {
    background: var(--educoding-dark);
  }
`;

export const MentorModalProfileBox = styled.div.attrs({
  id: 'mentormodalprofilebox',
})`
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--educoding-white);
`;

export const MentorModalProfileTop = styled.div.attrs({
  id: 'mentormodalproiletop',
})`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const MentorModalProfileTopLeft = styled.div.attrs({
  id: 'mentormodalprofiletopleft',
})`
  width: 35px;
  height: 35px;
  border-radius: 50%;
`;

export const MentorModalProfileImg = styled.img.attrs({
  id: 'mentormodalprofileimg',
})`
  width: 100%;
  width: 100%;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-size: contain;
  border: 1px solid var(--educoding-line);
`;

export const MentorModalProfileTopRight = styled.div.attrs({
  id: 'mentormodalprofiletopright',
})`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 100%;
`;

export const MentorModalProfileNickname = styled.div.attrs({
  id: 'mentormodalprofilenickname',
})`
  font-size: 14px;
  font-family: extrabold, sans-serif;
  color: var(--educoding-white);
`;

export const MentorModalProfileExpCnt = styled.div.attrs({
  id: 'mentormodalprofileexpcnt',
})`
  font-size: 11px;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
  opacity: 0.5;
`;

export const MentorModalExtraMenu = styled.div.attrs<ThemeProps>((props) => ({
  id: 'mentormodalextramenu',
}))<ThemeProps>`
  width: 18px;
  height: 18px;
  cursor: pointer;
  border: none;
  outline: none;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  background-image: ${({ theme }) =>
    `url(${theme === 'light' ? '/images/icon/m_menu_open_light.png' : '/images/icon/m_menu_open.png'})`};
`;

export const MentorModalExtraMenuDropdown = styled.div.attrs({
  id: 'mentormodalextramenudropdown',
})`
  width: 120px;
  height: 80px;
  top: 100px;
  right: 20px;
  z-index: 999;
  background-color: var(--educoding-dark);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  border-radius: 10px;
  border: 1px solid var(--educoding-line) !important;
  background-color: var(--educoding-dark);
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.25);
`;

export const MentorModalExtraMenuDropButton = styled.div.attrs({
  id: 'mentormodalextramenudropbutton',
})`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  font-size: 12px;
  font-family: extrabold, sans-serif;
  user-select: none;
  cursor: pointer;
  color: var(--educoding-white);
  &:hover {
    background-color: var(--educoding-hover);
  }

  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;

export const MentorModalProfileBottom = styled.div.attrs({
  id: 'mentormodalprofilebottom',
})`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const MentorModalProfileBottomEach = styled.div.attrs({
  id: 'mentormodalprofilebottomeach',
})`
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: flex-start;
  align-items: center;
`;
export const MentorModalProfileBottomEachLeft = styled.div.attrs({
  id: 'mentormodalprofilebottomeachleft',
})`
  font-size: 12px;
  font-family: extrabold, sans-serif;
  color: var(--educoding-white);
`;
export const MentorModalProfileBottomEachRight = styled.div.attrs({
  id: 'mentormodalprofilebottomeachright',
})`
  font-size: 12px;
  font-family: bold, sans-serif;
  color: var(--educoding-white);
`;

export const MentorModalMiddleHR = styled.hr.attrs({
  id: 'mentormodalmiddlehr',
})`
  border: none;
  border-top: 1px solid var(--educoding-line);
`;

export const MentorModalDetailBox = styled.div.attrs({
  id: 'mentormodaldetailbox',
})`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 50px;
`;

export const MentorModalDetailTitle = styled.div.attrs({
  id: 'mentormodaldetailtitle',
})`
  width: 100%;
  font-size: 16px;
  font-family: bold;
  color: var(--educoding-white);
`;

export const MentorModalDetailContents = styled.div.attrs({
  id: 'mentormodaldetailcontents',
})`
  width: 100%;
  font-size: 12px;
  font-family: bold;
  line-height: 20px;
  color: var(--educoding-white);
  white-space: pre-wrap; /* 텍스트 내 줄 바꿈을 유지하고, 공백도 처리 */
  margin: 0; /* 기본 마진 제거 */
  padding: 0; /* 기본 패딩 제거 */
  div {
    margin: 0; /* 각 줄 간격 제거 */
    padding: 0;
  }
  ul,
  ol {
    margin-left: 15px;
  }
`;

export const MentorModalBottomBox = styled.div.attrs({
  id: 'mentormodalbottombox',
})`
  display: flex;
  width: 100%;
  height: 40px;
  position: absolute;
  left: 0;
  bottom: 0;
  background-color: var(--educoding-black);
  justify-content: space-between;
  align-items: center;
  padding: 15px 3px 15px 15px;
`;

export const MentorModalBottomText = styled.div.attrs({
  id: 'mentormodalbottomtext',
})`
  font-size: 13px;
  font-family: bold;
  color: var(--educoding-white);
`;

// 모달창 관련----------------------------------------------------------------------------------------------
// Mentor_Modal_Style
const MTModal_STY = {
  // 모달 공유 Style------------------------------------------------------------------------------------------
  MentorModalWrap: styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw; /* 뷰포트 너비 100% */
    height: 100vh; /* 뷰포트 높이 100% */
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  `,

  MentorModalContentsContainer: styled.div`
    width: 100%;
    max-width: 500px; /* 최대 너비 유지 */
    height: auto;
    max-height: 90vh;
    background: #212121;
    position: relative;
    z-index: 1000;
    /* overflow-y: auto; 내용이 길면 세로 스크롤 허용 */
    border-radius: 10px;
    display: flex; /* Flexbox 적용 */
    flex-direction: column; /* 세로 배치 */

    /* 미디어 쿼리로 화면 크기별 조정 */
    @media (max-width: 768px) {
      /* 태블릿 이하 */
      width: 85%;
      max-height: 80vh;
    }

    @media (max-width: 480px) {
      /* 모바일 */
      width: 90%;
      max-height: 70vh;
    }
  `,

  // 모달 Top 관련---------------------------------------------------------------------------------
  MentorModalContentsWrap: styled.div`
    width: 100%;
    position: relative;
  `,

  ModalTopBox: styled.div`
    width: 100%;
    height: 40px;
    position: relative;
    display: flex;
    background-color: var(--educoding-purple);
    justify-content: space-between;
    align-items: center;
    padding: 0 10px 0 15px;
  `,

  ModalIntroduce: styled.div`
    color: white;
    font-family: bold, sans-serif;
    font-size: 14px;
  `,

  ShareButton: styled.button`
    width: 23%;
    background-color: transparent;
    color: var(--educoding-white);
    display: flex;
    justify-content: end;
    align-items: center;
    border: none;
    text-decoration: underline; // 글자 아래에 선을 긋기
    cursor: pointer;

    &:hover {
      color: #f00; /* Hover 시 빨간색으로 변함 */
    }
  `,

  ShareImage: styled.img`
    width: 20px; // 이미지 크기 설정
    height: 20px; // 이미지 크기 설정
  `,

  ModalCloseButton: styled.button`
    width: 7%;
    background-color: transparent;
    border: none;
    color: var(--educoding-white);
    cursor: pointer;

    &:hover {
      color: #f00; /* Hover 시 빨간색으로 변함 */
    }
  `,

  // 모달 Info 관련------------------------------------------------------------------------------------
  MentorModalInfoBox: styled.div`
    border-radius: 10px;
    padding-left: 20px;
    padding-right: 20px;
    color: var(--educoding-white);
  `,

  ModalInfoTop: styled.div`
    display: flex;
    align-items: center;
    margin-top: 5px;
    gap: 10px;
  `,

  ModalInfoTopInLeft: styled.div`
    width: 30px;
    height: 30px;
  `,

  ModalProfileUrl: styled.img`
    width: 30px;
    height: 30px;
    object-fit: cover; // 이미지 비율 유지하며 채우기
    border-radius: 50%; /* 동그랗게 만들기 */
  `,

  ModalInfoTopInRight: styled.div`
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `,

  ModalNickname: styled.div`
    font-size: 15px;
    font-weight: bold;
  `,

  DetailMenuBar: styled.div`
    position: absolute;
    top: 3%;
    right: 3%;
    width: 18px;
    height: 18px;
    cursor: pointer;
    border: none;
    outline: none;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-image: url(/images/icon/m_menu_open.png);
  `,

  ModalExpCount: styled.div`
    font-size: 13px;
    color: #a0a0a0;
  `,

  ModalInfoBottom: styled.div`
    position: relative;
    margin-top: 5px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  `,

  ModalPosition: styled.div`
    font-size: 13px;
    font-weight: bold;
    color: #c0c0c0;
  `,

  ModalCareer: styled.div`
    font-size: 13px;
    font-weight: bold;
    color: #c0c0c0;
  `,

  ModalCurrentJob: styled.div`
    font-size: 13px;
    font-weight: bold;
    color: #c0c0c0;
  `,

  Line: styled.hr`
    border: 0;
    border-top: 0.5px solid #444444; /* border-top을 사용하여 선 두께를 조절 */
    margin-top: 10px;
    margin-left: 20px;
    margin-right: 20px;
  `,

  MentorModalContentBox: styled.div`
    width: 100%;
    height: 50vh;
    padding-left: 20px;
    padding-right: 20px;
  `,

  ScrollRange: styled.div`
    width: 100%;
    max-height: calc(90vh - 45px);
    position: relative;
    height: auto;
    overflow-y: scroll;

    &::-webkit-scrollbar {
      width: 10px;
      height: 100%;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--educoding-hover);
      /* border-radius: 30px; */
    }
    &::-webkit-scrollbar-track {
      background: var(--educoding-dark);
    }
  `,

  ModalTitle: styled.div`
    width: 100%;
    font-size: 20px;
    font-family: bold;
    margin-top: 10px;
    margin-bottom: 20px;
    color: var(--educoding-white);
  `,

  ModalContent: styled.div`
    width: 100%;
    padding-bottom: 10px;
    font-size: 15px;
    font-family: bold;
    color: var(--educoding-white);
    flex-grow: 1;
    position: relative;
  `,

  MentorModalBottom: styled.div`
    width: 100%;
    height: 45px;
    bottom: 0;
    background-color: #444444;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  `,

  ModalApplyPrice: styled.div`
    font-size: 13px;
    font-weight: bold;
    color: var(--educoding-white);
    padding-left: 20px;
  `,

  ModalApplyButton: styled.button`
    width: 80px;
    height: 40px;
    font-size: 12px;
    background-color: var(--educoding-black);
    cursor: pointer;
    color: var(--educoding-white);
    &:hover {
      background-color: var(--educoding-purple);
    }
  `,

  LoadingOverlay: styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9000;
  `,

  ApplyMenteeInfoContainer: styled.div`
    width: 100%;
    position: relative;
    height: 93%;
    & > div {
      flex: 1; /* 편집기 영역이 컨테이너를 꽉 채우도록 */
    }
  `,

  ApplyMenteeInfoBottomBox: styled.div`
    display: flex;
    width: 100%;
    height: 40px;
    position: absolute;
    left: 0;
    bottom: 0;
    background-color: var(--educoding-black);
    justify-content: flex-end;
    align-items: center;
    padding: 15px 3px 15px 15px;
  `,

  ApplySubmitButton: styled.button`
    position: fixed;
    width: 80px;
    height: 40px;
    font-size: 12px;

    justify-content: end;
    background-color: var(--educoding-black);
    cursor: pointer;
    color: var(--educoding-white);
    &:hover {
      background-color: var(--educoding-purple);
    }
  `,

  MentorToolBarBox: styled.div`
    width: 100%;
    height: 50px; /* 기본 높이 */
    background: none;
    display: flex;
    align-items: center;
    justify-content: space-around;
    transition: all 0.3s ease; /* 부드러운 전환 효과 */
    border: none;

    .toolbar {
      padding: 5px; /* 패딩 축소 */
      width: 100%;
      border: none;
    }

    .button-group {
      display: flex;
      align-items: center;
      gap: 5px; /* 버튼 간 간격 */
    }

    button {
      width: 30px; /* 버튼 크기 고정 */
      height: 30px; /* 버튼 크기 고정 */
      background-size: 60%; /* 아이콘 크기 */
      background-position: center;
      background-repeat: no-repeat;
      border: none;
      cursor: pointer;
      flex-shrink: 0; /* 버튼 크기 고정 */
    }

    .dropdown-menu {
      position: absolute;
      display: none; /* 기본적으로 숨김 */
      flex-direction: column;
      gap: 2px;
      background: #fff;
      border: 1px solid var(--educoding-line);
      padding: 5px;
      z-index: 10;
      &.show {
        display: flex; /* show 클래스 추가 시 표시 */
      }
    }

    @media (max-width: 768px) {
      height: auto; /* 2줄 배치 시 높이 자동 조정 */
      min-height: 40px; /* 최소 높이 (2줄 고려) */
      margin-bottom: 25px;

      .button-group {
        flex-direction: row;
        flex-wrap: wrap; /* 2줄로 나뉨 */
        justify-content: flex-start; /* 왼쪽 정렬 */
        gap: 8px; /* 간격 유지 */
      }

      button {
        width: 28px; /* 버튼 크기 약간 축소 */
        height: 28px;
        background-size: 60%; /* 아이콘 크기 유지 */
        margin-bottom: 5px; /* 줄 간격 */
        flex: 0 0 auto; /* 크기 고정 */
      }

      .dropdown-menu {
        top: 40px; /* 툴바 아래로 위치 조정 */
        left: 10px;
        width: 120px; /* 드롭다운 크기 조정 */
      }
    }

    @media (max-width: 400px) {
      .button-group {
        flex-direction: row;
        flex-wrap: wrap; /* 2줄로 나뉨 */
        justify-content: flex-start; /* 왼쪽 정렬 */
        gap: 2px; /* 간격 유지 */
      }
    }
  `,

  DetailMenuBarModal: styled.div`
    position: absolute;
    width: 120px;
    height: 60px;
    top: 12%;
    right: 5%;
    z-index: 999;
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    border-radius: 10px;
    border: 1px solid var(--educoding-line) !important;
    background-color: var(--educoding-dark);
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.25);
  `,

  DetailMenuBarModalButton: styled.div`
    width: 100%;
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    font-size: 15px;
    font-family: extrabold, sans-serif;
    user-select: none;
    cursor: pointer;
    color: var(--educoding-white);
    &:hover {
      background-color: var(--educoding-hover);
    }
    &:first-child {
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }
    &:last-child {
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }
  `,

  // Review 관련----------------------------------------------------------------------
  MentorModalReviewBox: styled.div`
    width: 100%;
    max-height: calc(80vh - 100px); /* 헤더(40px)와 입력창(60px) 높이 고려 */
    position: relative;
    display: flex;
    flex-direction: column;
  `,

  ReviewDataContainer: styled.div`
    width: 100%;
    max-height: calc(80vh - 60px); /* 입력창 높이(10%)와 헤더(40px) 고려 */
    position: relative;
    overflow-y: auto; /* 세로 스크롤 허용 */
    overflow-x: hidden; /* 가로 오버플로우 방지 */
    &::-webkit-scrollbar {
      width: 10px;
      height: 100%;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--educoding-hover);
      /* border-radius: 30px; */
    }
    &::-webkit-scrollbar-track {
      background: var(--educoding-dark);
    }
  `,

  ReviewDataBox: styled.div`
    width: 100%;
    position: relative;
    padding-left: 10px;
    padding-right: 10px;
    margin-top: 20px;
    margin-bottom: 20px;
  `,

  DataBox: styled.div`
    width: 100%;
    position: relative;
    border: 1px solid var(--educoding-hover);
    margin-bottom: 20px;
    padding: 5px;
    overflow-x: hidden; /* 가로 오버플로우 방지 */
    box-sizing: border-box; /* 패딩과 보더 포함 */
  `,

  NoData: styled.div`
    top: 15px;
    left: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: bold;
  `,

  ReviewTopInBox: styled.div`
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: row;
  `,

  MenteeProfileUrl: styled.img`
    width: 30px;
    height: 30px;
    margin-right: 10px;
    object-fit: cover; // 이미지 비율 유지하며 채우기
    border-radius: 50%; /* 동그랗게 만들기 */
  `,

  MenteeNickname: styled.div`
    width: 70%;
    font-family: bold;
    display: flex;
    align-items: center;
  `,

  TopRightInBox: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  `,

  createdAt: styled.div`
    width: 100%;
    font-size: 13px;
    position: relative;
  `,

  ReviewMenuBar: styled.div`
    width: 15px;
    height: 15px;
    cursor: pointer;
    border: none;
    outline: none;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-image: url(/images/icon/m_menu_open.png);
  `,

  MiddleInBox: styled.div`
    width: 100%;
  `,

  ReviewText: styled.div`
    width: 100%;
    margin-bottom: 5px;
    font-family: bold;
    white-space: pre-line; /* 줄바꿈(\n)을 자동으로 인식 */
  `,

  ReviewInputcontainer: styled.div`
    width: 70vw;
    max-width: 550px; /* MentorModal과 동일한 최대 너비 */
    height: 60px;
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--educoding-dark);
    z-index: 10;
    padding: 0 15px;
    box-sizing: border-box;
  `,

  ReviewInput: styled.textarea<LineCountProps>`
    border: none;
    border-top: 1px solid var(--educoding-line);
    width: 90%;
    min-height: 30px;
    line-height: 20px;
    resize: none;
    overflow: hidden;
    padding-left: 5px;
    padding-top: 3px;
    box-sizing: border-box;
    background-color: #fff;
    position: absolute;
    bottom: 0;
    left: 0; /* 명확히 좌측 기준 추가 */
    z-index: 2;
    height: ${(props) => `${Math.min(props.lineCount, 3) * 20}px`}; /* 최대 3줄 */
    max-height: 60px; /* 최대 높이 제한 */
    font-size: 14px; /* 텍스트 크기 */
    font-family: regular;
    &::placeholder {
      color: var(--educoding-white);
      opacity: 0.4; /* 회색 텍스트 */
      font-style: italic;
    }

    /* 포커스 시 테두리 및 윤곽선 유지 */
    &:focus {
      outline: none; /* 브라우저 기본 윤곽선 제거 */
      border: none; /* 테두리 없음 유지 */
      border-top: 1px solid var(--educoding-line); /* 상단 테두리 유지 */
    }
  `,

  RatingContainer: styled.div<LineCountProps>`
    position: absolute;
    top: ${(props) => `${30 - Math.min(props.lineCount, 3) * 20 - 5}px`}; // 입력창 위로 이동
    left: 5px;
    z-index: 3;
    transition: top 0.3s ease;
  `,

  ReviewSubmitButton: styled.div<LineCountProps>`
    width: 10%;
    min-height: 30px;
    height: ${(props) => `${Math.min(props.lineCount, 3) * 20}px`}; /* 입력창과 높이 동기화 */
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    background-color: #444; /* none 대신 기본 색상 설정 */
    color: white;
    font-family: bold;
    font-size: 12px;
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 2;
  `,

  ReviewMenuBarModal: styled.div`
    position: absolute;
    width: 100px;
    height: 60px;
    top: 15%;
    right: 12%;
    z-index: 999;
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    border-radius: 10px;
    border: 1px solid var(--educoding-line) !important;
    background-color: var(--educoding-dark);
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.25);
  `,

  ReviewMenuBarModalButton: styled.div`
    width: 100%;
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    font-size: 15px;
    font-family: extrabold, sans-serif;
    user-select: none;
    cursor: pointer;
    color: var(--educoding-white);
    &:hover {
      background-color: var(--educoding-hover);
    }
    &:first-child {
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }
    &:last-child {
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }
  `,
};

export default MTModal_STY;
