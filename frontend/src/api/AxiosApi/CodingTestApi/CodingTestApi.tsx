import { AxiosError } from 'axios';

import type {
  CancelJobResponse,
  ErrorDataType,
  ChallengeSummaryType,
  ExecuteJobResponse,
  GetChallengeDetailRequest,
  GetChallengeDetailResponse,
  GetChallengeListRequest,
  GetChallengeListResponse,
  SubmitCodeRequest,
  SubmitCodeResponse,
} from './CodingTestApiType';

import AxiosInstance from '../../AxiosInstance';
import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`;

const CodingTestApi = {
  getChallengeDetail: async (
    request: GetChallengeDetailRequest,
  ): Promise<GetChallengeDetailResponse | ErrorDataType> => {
    try {
      const { challengeId } = request;
      const url = `${SPRING_DOMAIN}/api/code-challenge/${challengeId}`;
      const response = await AxiosInstance.get<GetChallengeDetailResponse>(url);
      return response.data;
    } catch (error) {
      const data: ErrorDataType = {};

      if (error instanceof AxiosError) {
        if (error.request && !error.response) {
          data['error'] = '서버가 응답하지 않습니다. 네트워크 연결 상태를 확인해주세요.';
        } else if (error.response) {
          Object.assign(data, error.response.data);
          if (!data['error'])
            data['error'] =
              '코딩 테스트 정보를 조회하는 과정에서 예기치 못한 문제가 발생하였습니다😭. 문제가 반복될 경우 관리자에게 문의해주세요.';
        }
      }
      return data;
    }
  },

  getChallengeList: async (
    request: GetChallengeListRequest,
  ): Promise<ChallengeSummaryType[] | ErrorDataType> => {
    try {
      const { difficulty } = request;
      const url = `${SPRING_DOMAIN}/api/code-challenge?difficulty=${difficulty?.toUpperCase()}`;
      const response = await AxiosInstance.get<GetChallengeListResponse>(url);
      return response.data.challengeSummaries;
    } catch (error) {
      const data: ErrorDataType = {};

      if (error instanceof AxiosError) {
        if (error.request && !error.response) {
          data['error'] = '서버가 응답하지 않습니다. 네트워크 연결 상태를 확인해주세요.';
        } else if (error.response) {
          Object.assign(data, error.response.data);
          if (!data['error'])
            data['error'] =
              '코딩 테스트 목록을 조회하는 과정에서 예기치 못한 문제가 발생하였습니다😭. 문제가 반복될 경우 관리자에게 문의해주세요.';
        }
      }
      return data;
    }
  },

  submitCode: async (request: SubmitCodeRequest): Promise<SubmitCodeResponse | ErrorDataType> => {
    try {
      // // sse 연결 과정에서 Access Token이 만료되지 않도록 재발급
      // Common.clearAccessToken();
      const response = await AxiosInstance.post<SubmitCodeResponse>(
        `${SPRING_DOMAIN}/api/judge-job`,
        request,
      );
      return response.data;
    } catch (error) {
      const data: ErrorDataType = {};

      if (error instanceof AxiosError) {
        if (error.request && !error.response) {
          data['error'] = '서버가 응답하지 않습니다. 네트워크 연결 상태를 확인해주세요.';
        } else if (error.response) {
          Object.assign(data, error.response.data);
          if (!data['error'])
            data['error'] =
              '코드 제출 과정에서 예기치 못한 문제가 발생하였습니다😭. 문제가 반복될 경우 관리자에게 문의해주세요.';
        }
      }
      return data;
    }
  },

  executeCode: async (jobId: string): Promise<ExecuteJobResponse | ErrorDataType> => {
    try {
      const response = await AxiosInstance.post<ExecuteJobResponse>(
        `${SPRING_DOMAIN}/api/judge-job/${jobId}/execution`,
      );
      return response.data;
    } catch (error) {
      const data: ErrorDataType = {};

      if (error instanceof AxiosError) {
        if (error.request && !error.response) {
          data['error'] = '서버가 응답하지 않습니다. 네트워크 연결 상태를 확인해주세요.';
        } else if (error.response) {
          Object.assign(data, error.response.data);
          if (!data['error'])
            data['error'] =
              '코드 실행 과정에서 예기치 못한 문제가 발생하였습니다😭. 문제가 반복될 경우 관리자에게 문의해주세요.';
        }
      }
      return data;
    }
  },

  cancelJob: async (jobId: string): Promise<CancelJobResponse | ErrorDataType> => {
    try {
      const response = await AxiosInstance.post<CancelJobResponse>(
        `${SPRING_DOMAIN}/api/judge-job/${jobId}/cancellation`,
      );
      return response.data;
    } catch (error) {
      const data: ErrorDataType = {};

      if (error instanceof AxiosError) {
        if (error.request && !error.response) {
          data['error'] = '서버가 응답하지 않습니다. 네트워크 연결 상태를 확인해주세요.';
        } else if (error.response) {
          Object.assign(data, error.response.data);
          if (!data['error'])
            data['error'] =
              '실행 중지 과정에서 예기치 못한 문제가 발생하였습니다😭. 문제가 반복될 경우 관리자에게 문의해주세요.';
        }
      }
      return data;
    }
  },

  // getChallengeSubmissionHistory: async (questionId) => {
  //   try {
  //     const response = await AxiosInstance.get(
  //       `${SPRING_DOMAIN}/api/code-challenge/submission/${questionId}`,
  //     );
  //     return response.data;
  //   } catch (error) {
  //     const data = {};

  //     if (error.request && !error.response) {
  //       data['error'] = '서버가 응답하지 않습니다. 네트워크 연결 상태를 확인해주세요.';
  //     } else if (error.response) {
  //       Object.assign(data, error.response.data);
  //       if (!data['error'])
  //         data['error'] =
  //           '코딩 테스트 제출 기록을 조회하는 과정에서 예기치 못한 문제가 발생하였습니다😭. 문제가 반복될 경우 관리자에게 문의해주세요.';
  //     }
  //     return data;
  //   }
  // },

  // getChallengeSubmissionHistoryList: async () => {
  //   try {
  //     const response = await AxiosInstance.get(`${SPRING_DOMAIN}/api/code-challenge/submissions`);
  //     return response.data;
  //   } catch (error) {
  //     const data = {};

  //     if (error.request && !error.response) {
  //       data['error'] = '서버가 응답하지 않습니다. 네트워크 연결 상태를 확인해주세요.';
  //     } else if (error.response) {
  //       Object.assign(data, error.response.data);
  //       if (!data['error'])
  //         data['error'] =
  //           '코딩 테스트 제출 기록을 조회하는 과정에서 예기치 못한 문제가 발생하였습니다😭. 문제가 반복될 경우 관리자에게 문의해주세요.';
  //     }
  //     return data;
  //   }
  // },
};

export default CodingTestApi;
