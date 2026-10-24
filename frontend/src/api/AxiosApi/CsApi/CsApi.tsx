import { AxiosPromise } from 'axios';

import type { ReportPost } from './CsApiTypes';
import type { CheckResponse } from '../../../types/CommonTypes';

import AxiosInstance from '../../AxiosInstance';
import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`;

const CsApi = {
  newReportPost: async (request: ReportPost): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.post<CheckResponse>(
      SPRING_DOMAIN + '/customerService/new/post/report',
      request,
    );
    return response;
  },

};

export default CsApi;
