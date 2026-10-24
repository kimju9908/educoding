import { AxiosError } from 'axios';

import type { AskChatbotRequest, ChatbotAnswer } from './ChatbotApiType';

import AxiosInstance from '../../AxiosInstance';
import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`;

export const getChatbotApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    if (!error.response) return '서버가 응답하지 않습니다. 네트워크 연결 상태를 확인해주세요.';
    const message = (error.response.data as { message?: string; error?: string } | undefined)
      ?.message ?? (error.response.data as { error?: string } | undefined)?.error;
    if (message) return message;
  }
  return fallback;
};

const ChatbotApi = {
  ask: async (request: AskChatbotRequest): Promise<ChatbotAnswer> => {
    const response = await AxiosInstance.post<ChatbotAnswer>(
      `${SPRING_DOMAIN}/api/chatbot/ask`,
      request,
    );
    return response.data;
  },
};

export default ChatbotApi;
