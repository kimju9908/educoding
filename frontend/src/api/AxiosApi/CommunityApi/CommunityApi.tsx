import axios, { AxiosPromise } from 'axios';

import type {
  BoardDataType,
  BoardReactionRequest,
  BoardReactionResponse,
  BoardReactionStatusRequest,
  BoardReactionStatusResponse,
  BoardRequest,
  BoardResponse,
  DeletePostRequest,
  DeleteReplyRequest,
  ModifyCodingPostRequest,
  ModifyCoursePostRequset,
  ModifyPostStatusRequest,
  ModifyReplyRequest,
  ModifyStudyPostRequest,
  ModifyTeamPostRequest,
  OtherPostRequest,
  OtherPostResponse,
  OtherProfileRequest,
  OtherProfileResponse,
  PopularPostData,
  PostCheckRequest,
  PostRequest,
  PostResponse,
  ReplyDataType,
  ReplyRequest,
  ReplyResponse,
  SimilarPostRequest,
  SimilarPostResponse,
  TopWriterData,
  WriteCodingPostRequest,
  WriteCoursePostRequest,
  WriteReplyRequest,
  WriteStudyPostRequest,
  WriteTeamPostRequest,
} from './CommunityApiType';
import type { CheckResponse } from '../../../types/CommonTypes';

import AxiosInstance from '../../AxiosInstance';
import config from '../../config';

const SPRING_DOMAIN = `${config.apiUrl}`;

const CommunityApi = {
  gettopwriter: async (): AxiosPromise<TopWriterData[]> => {
    const response = await axios.get<TopWriterData[]>(SPRING_DOMAIN + '/community/topWriter');
    return response;
  },
  getpopularpost: async (): AxiosPromise<PopularPostData[]> => {
    const response = await axios.get<PopularPostData[]>(
      SPRING_DOMAIN + '/community/weeklyPopularPost',
    );
    return response;
  },
  getotherpost: async (
    params: OtherPostRequest,
  ): AxiosPromise<OtherPostResponse<BoardDataType>> => {
    const response = await axios.get<OtherPostResponse<BoardDataType>>(
      SPRING_DOMAIN + '/community/list/others/post',
      { params },
    );
    return response;
  },

  getotherprofile: async (
    pathVariable: OtherProfileRequest,
  ): AxiosPromise<OtherProfileResponse> => {
    const { userId } = pathVariable;
    const response = await axios.get<OtherProfileResponse>(
      SPRING_DOMAIN + `/community/list/others/profile/${userId}`,
    );
    return response;
  },

  getBoard: async (params: BoardRequest): AxiosPromise<BoardResponse<BoardDataType>> => {
    const { boardType } = params;
    if (boardType === 'course') {
      params.status = '';
    }
    const response = await axios.get<BoardResponse<BoardDataType>>(
      SPRING_DOMAIN + '/community/list/post',
      { params },
    );
    return response; // 응답 데이터 반환
  },

  getPostCheck: async (params: PostCheckRequest): AxiosPromise<CheckResponse> => {
    const response = await axios.get<CheckResponse>(SPRING_DOMAIN + '/community/list/post/view', {
      params,
    });
    return response;
  },

  modifyPostStatus: async (data: ModifyPostStatusRequest): AxiosPromise<CheckResponse> => {
    const { boardId, status, boardType } = data;
    const response = await AxiosInstance.put<CheckResponse>(
      SPRING_DOMAIN + '/community/modify/post',
      { boardId, status },
      { params: { boardType } },
    );
    return response;
  },

  deletePost: async (pathVariable: DeletePostRequest): AxiosPromise<CheckResponse> => {
    const { id } = pathVariable;
    const response = await AxiosInstance.delete<CheckResponse>(
      SPRING_DOMAIN + `/community/delete/post/${id}`,
    );
    return response;
  },

  getPost: async (pathVariable: PostRequest): AxiosPromise<PostResponse> => {
    const { id } = pathVariable;
    const response = await axios.get<PostResponse>(SPRING_DOMAIN + `/community/list/post/${id}`);
    return response; // 응답 데이터 반환
  },
  boardreactionstatus: async (
    params: BoardReactionStatusRequest,
  ): AxiosPromise<BoardReactionStatusResponse> => {
    const response = await axios.get<BoardReactionStatusResponse>(
      SPRING_DOMAIN + '/community/reaction/status',
      { params },
    );
    return response;
  },

  boardreaction: async (params: BoardReactionRequest): AxiosPromise<BoardReactionResponse> => {
    const response = await AxiosInstance.post<BoardReactionResponse>(
      SPRING_DOMAIN + '/community/reaction/voting',
      null,
      { params },
    );
    return response;
  },

  writeCodingPost: async (data: WriteCodingPostRequest): AxiosPromise<CheckResponse> => {
    const { title, language, content, boardType } = data;
    const response = await AxiosInstance.post<CheckResponse>(
      SPRING_DOMAIN + '/community/new/post', // URL
      { title, language, content }, // POST 요청 본문
      {
        params: { boardType }, // 쿼리 파라미터
      },
    );
    return response;
  },

  modifyCodingPost: async (data: ModifyCodingPostRequest): AxiosPromise<CheckResponse> => {
    const { boardId, title, language, content, boardType } = data;
    const response = await AxiosInstance.put<CheckResponse>(
      SPRING_DOMAIN + '/community/modify/post',
      { boardId, title, language, content },
      {
        params: { boardType },
      },
    );
    return response;
  },

  writeCoursePost: async (data: WriteCoursePostRequest): AxiosPromise<CheckResponse> => {
    const { title, course, content, boardType } = data;
    const response = await AxiosInstance.post<CheckResponse>(
      SPRING_DOMAIN + '/community/new/post', // URL
      { title, course, content }, // POST 요청 본문
      {
        params: { boardType }, // 쿼리 파라미터
      },
    );
    return response;
  },
  modifyCoursePost: async (data: ModifyCoursePostRequset): AxiosPromise<CheckResponse> => {
    const { boardId, title, course, content, boardType } = data;
    const response = await AxiosInstance.put<CheckResponse>(
      SPRING_DOMAIN + '/community/modify/post',
      { boardId, title, course, content },
      {
        params: { boardType },
      },
    );
    return response;
  },

  writeStudyPost: async (data: WriteStudyPostRequest): AxiosPromise<CheckResponse> => {
    const { title, study, content, boardType } = data;
    const response = await AxiosInstance.post<CheckResponse>(
      SPRING_DOMAIN + '/community/new/post', // URL
      { title, study, content }, // POST 요청 본문
      {
        params: { boardType }, // 쿼리 파라미터
      },
    );
    return response;
  },

  modifyStudyPost: async (data: ModifyStudyPostRequest): AxiosPromise<CheckResponse> => {
    const { boardId, title, study, content, boardType } = data;
    const response = await AxiosInstance.put<CheckResponse>(
      SPRING_DOMAIN + '/community/modify/post',
      { boardId, title, study, content },
      {
        params: { boardType },
      },
    );
    return response;
  },

  writeTeamPost: async (data: WriteTeamPostRequest): AxiosPromise<CheckResponse> => {
    const { title, team, content, boardType } = data;
    const response = await AxiosInstance.post<CheckResponse>(
      SPRING_DOMAIN + '/community/new/post', // URL
      { title, team, content }, // POST 요청 본문
      {
        params: { boardType }, // 쿼리 파라미터
      },
    );
    return response;
  },

  modifyTeamPost: async (data: ModifyTeamPostRequest): AxiosPromise<CheckResponse> => {
    const { boardId, title, team, content, boardType } = data;
    const response = await AxiosInstance.put<CheckResponse>(
      SPRING_DOMAIN + '/community/modify/post',
      { boardId, title, team, content },
      {
        params: { boardType },
      },
    );
    return response;
  },

  getReplies: async (params: ReplyRequest): AxiosPromise<ReplyResponse<ReplyDataType>> => {
    const response = await axios.get<ReplyResponse<ReplyDataType>>(
      SPRING_DOMAIN + '/community/list/comment',
      { params },
    );
    return response; // 응답 데이터 반환
  },

  writeReply: async (request: WriteReplyRequest): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.post<CheckResponse>(
      SPRING_DOMAIN + '/community/add/comment',
      request, // POST 요청 본문
    );
    return response;
  },

  modifyReply: async (request: ModifyReplyRequest): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.put<CheckResponse>(
      SPRING_DOMAIN + '/community/modify/comment',
      request,
    );
    return response;
  },

  deleteReply: async (pathVariable: DeleteReplyRequest): AxiosPromise<CheckResponse> => {
    const response = await AxiosInstance.delete<CheckResponse>(
      SPRING_DOMAIN + `/community/delete/comment/${pathVariable}`,
    );
    return response;
  },

  similarPost: async (pathVariable: SimilarPostRequest): AxiosPromise<SimilarPostResponse[]> => {
    const response = await axios.get<SimilarPostResponse[]>(
      SPRING_DOMAIN + `/community/similarPost/${pathVariable}`,
    );

    return response;
  },
};

export default CommunityApi;
