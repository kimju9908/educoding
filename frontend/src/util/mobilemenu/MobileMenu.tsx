export const menus = [

  {
    id: 'study',
    label: '언어공부',
    list: [
      {
        contents: { title: 'java', index: 'Java', link: '/study/java' },
      },
      {
        contents: { title: 'python', index: 'Python', link: '/study/python' },
      },
      {
        contents: { title: 'c', index: 'C', link: '/study/c' },
      },
      {
        contents: { title: 'cplus', index: 'C++', link: '/study/cplus' },
      },
      {
        contents: { title: 'javascript', index: 'JavaScript', link: '/study/javaScript' },
      },
    ],
  },

  {
    id: 'codingtest',
    label: '코딩테스트',
    list: [
      {
        contents: { title: 'practice', index: '연습문제', link: '/codingtest/practice' },
      },
      {
        contents: { title: 'basic', index: '1단계', link: '/codingtest/basic' },
      },
      {
        contents: { title: 'intermediate', index: '2단계', link: '/codingtest/intermediate' },
      },
      {
        contents: { title: 'expoert', index: '3단계', link: '/codingtest/expert' },
      },
    ],
  },

  {
    id: 'exam',
    label: '정보처리기사',
    list: [
      {
        contents: { title: 'mock', index: '랜덤문제풀이', link: '/exam/mock/random' },
      },
      {
        contents: { title: 'previous', index: '기출문제', link: '/exam/previous/220424' },
      },
    ],
  },

  {
    id: 'community',
    label: '커뮤니티',
    list: [
      {
        contents: { title: 'coding', index: '코딩 질문', link: '/community/coding' },
      },
      {
        contents: { title: 'course', index: '진로 질문', link: '/community/course' },
      },
      {
        contents: { title: 'study', index: '스터디', link: '/community/study' },
      },
      {
        contents: { title: 'team', index: '팀 프로젝트', link: '/community/team' },
      },
      {
        contents: { title: 'mentor', index: '멘토링', link: '/community/mentor' },
      },
    ],
  },

  {
    id: 'mypage',
    label: '마이페이지',
    list: [
      {
        contents: { title: 'account', index: '계정 관리', link: '/mypage/account' },
      },
      {
        contents: { title: 'userfeed', index: '내 소개', link: '/mypage/userfeed' },
      },
      {
        contents: { title: 'withdrawal', index: '회원 탈퇴', link: '/mypage/withdrawal' },
      },
      {
        contents: { title: 'study', index: '언어 공부', link: '/mypage/study' },
      },
      {
        contents: { title: 'codingtest', index: '코딩테스트', link: '/mypage/codingtest' },
      },
      {
        contents: {
          title: 'community',
          index: '커뮤니티 게시판 작성글',
          link: '/mypage/community',
        },
      },
      {
        contents: { title: 'report', index: '악성 사용자 신고 내역', link: '/mypage/report' },
      },
      {
        contents: { title: 'mentor', index: '내 멘토 보기', link: '/mypage/mentor' },
      },
      {
        contents: { title: 'mentee', index: '내 멘티 보기', link: '/mypage/mentee' },
      },
    ],
  },
];
