import { ExamData } from './ExamApiType';
import AxiosInstance from '../../AxiosInstance';
import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`;

const ExamApi: Record<string, () => Promise<ExamData[]>> = {
  getMockData01: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/mock_01');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getMockData02: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/mock_02');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getMockData03: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/mock_03');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getMockData04: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/mock_04');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getMockData05: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/mock_05');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getPreviousData220424: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/previous_220424');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getPreviousData220305: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/previous_220305');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getPreviousData210814: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/previous_210814');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getPreviousData210515: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/previous_210515');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getPreviousData210307: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/previous_210307');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getPreviousData200926: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/previous_200926');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getPreviousData200822: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/previous_200822');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
  getPreviousData200606: async (): Promise<ExamData[]> => {
    try {
      const response = await AxiosInstance.get<ExamData[]>(SPRING_DOMAIN + '/exam/previous_200606');
      return response.data; // response.data에서 ExamData[]를 반환
    } catch (error) {
      console.error('mock01 가져오기 오류', error);
      throw error;
    }
  },
};
export default ExamApi;
