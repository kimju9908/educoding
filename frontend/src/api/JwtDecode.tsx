import { jwtDecode, JwtPayload } from 'jwt-decode';

import Common from '../util/Common';

// 코드 수정 필요
// 1. Access Token 전달
// 2. Access Token 없을 시 Refresh Token 전달 -> Access Token 재발급
// 3. 둘 다 없을 시 -> 로그아웃 -> 로그인 Access, Refresh Token 발급
// 로그인쪽 연관
const JwtDecoding = {
  // 이미 저장된 토큰 기반으로 Decoding 진행
  getDecodedToken: (): JwtPayload | null => {
    try {
      const token: string = Common.getAccessToken();
      if (!token) {
        return null;
      }
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      return null;
    }
  },
  // 현재 받아온 토큰 기반으로 Decoding 진행
  getDecodingToken: (token: string): JwtPayload | null => {
    //
    try {
      if (!token) {
        return null;
      }
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      return null;
    }
  },

  // 현재 가져온 토큰에서 필드를 추출하는 메서드
  getFieldFromToken: <T extends string | number | null>(
    token: string,
    field: string,
  ): T | null | undefined => {
    const decoded = JwtDecoding.getDecodingToken(token);
    if (decoded && field in decoded) {
      return decoded[field as keyof JwtPayload] as T;
    }
    console.warn(`Field '${field}' not found in token payload`);
    return null;
  },
};
export default JwtDecoding;
