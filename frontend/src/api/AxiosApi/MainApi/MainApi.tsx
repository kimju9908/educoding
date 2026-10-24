import axios, { AxiosPromise } from 'axios';

import { BoardDataType, BoardResponse, MainBoardRequest } from './MainApiType';
import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`;

const MainApi = {
  getMainBoard: async (params: MainBoardRequest): AxiosPromise<BoardResponse<BoardDataType>> => {
    const response = await axios.get<BoardResponse<BoardDataType>>(
      SPRING_DOMAIN + '/community/list/post',
      { params },
    );
    return response; // 응답 데이터 반환
  },
};

export default MainApi;
