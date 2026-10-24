import axios, { AxiosPromise } from 'axios';

import config from '../config';

const SPRING_DOMAIN = `${config.apiUrl}` as string;

const AxiosApi = {
  axiosGet: async <T, P = unknown>(url: string, data?: P): AxiosPromise<T> => {
    const response = await axios.get<T>(SPRING_DOMAIN + url, { data });
    return response;
  },
};
export default AxiosApi;
