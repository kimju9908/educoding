// useSse.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Event, EventSourcePolyfill, MessageEvent } from 'event-source-polyfill';

import CodingTestApi from '../../../../api/AxiosApi/CodingTestApi/CodingTestApi';
import {
  ErrorDataType,
  ExecuteJobResponse,
} from '../../../../api/AxiosApi/CodingTestApi/CodingTestApiType';
import config from '../../../../api/config';
import { useAppSelector } from '../../../../redux/hooks/reduxHooks';
import { UseSSEProps, SSETestCaseResult } from '../CodingTestType';

const SPRING_DOMAIN = `${config.apiUrl}`;
const OPEN_TIMEOUT = 10000; // onopen 타임아웃 (10초)
const MESSAGE_TIMEOUT = 20000; // onmessage 타임아웃 (20초)

const useSse = ({
  jobId,
  onOpen,
  onMessage,
  onError,
  onComplete,
}: UseSSEProps): [React.RefObject<boolean>, () => void] => {
  // useEffect 내부에서 RECONNECT를 발생 시키기 위한 state
  const [shouldConnect, setShouldConnect] = useState<boolean>(false);

  // SSE 연결 객체 초기화
  const eventSource = useRef<EventSourcePolyfill | null>(null);

  const isConnectedRef = useRef<boolean>(false);

  // 전체 메시지 수(테스트 케이스 수) 유지
  const totalTestCasesRef = useRef<number | null>(null);

  // 마지막 수신 받은 메시지의 ID를 유지
  // 네트워크 장애로 메시지가 누락된 경우 서버로 전송하여 누락된 데이터 fetch 용도
  const lastEventIdRef = useRef<number | null>(null);

  // 토큰 state 추적
  // 실제로 바뀌지 않았으면 업데이트 되지 않음
  const accessToken = useAppSelector((state) => state.auth.accesstoken);

  // 타임아웃 ID 추적
  const openTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // 타임아웃 처리 함수
  const handleTimeout = useCallback((): void => {
    if (eventSource.current) {
      eventSource.current.close();
      isConnectedRef.current = false;
    }

    onError('서버와 연결이 불안정합니다. 네트워크 연결 상태를 확인해주세요.');
  }, [onError]);

  // onopen 타임아웃 설정
  const startOpenTimeout = useCallback((): void => {
    openTimeoutIdRef.current = setTimeout(() => {
      handleTimeout();
    }, OPEN_TIMEOUT);
  }, [handleTimeout]);

  // onmessage 타임아웃 설정
  const startMessageTimeout = useCallback((): void => {
    messageTimeoutIdRef.current = setTimeout(() => {
      handleTimeout();
    }, MESSAGE_TIMEOUT);
  }, [handleTimeout]);

  // 새로고침 여부 추적
  const isReloading = useRef<boolean>(false);

  useEffect(() => {
    const handleBeforeUnload = (): void => {
      isReloading.current = true;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return (): void => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const isErrorDataType = (data: ExecuteJobResponse | ErrorDataType): data is ErrorDataType => {
    return typeof data === 'object' && data !== null && !('totalTestCases' in data);
  };

  const isSSETestCaseResult = (data: unknown): data is SSETestCaseResult => {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return (
      typeof obj.passed === 'boolean' &&
      (typeof obj.testCaseIndex === 'number' || obj.elapsedTimeMs === null) &&
      (typeof obj.elapsedTimeMs === 'number' || obj.elapsedTimeMs === null) &&
      (typeof obj.memoryUsageMb === 'number' || obj.memoryUsageMb === null) &&
      (typeof obj.failureCause === 'string' || obj.failureCause === null) &&
      (typeof obj.failureDetail === 'string' || obj.failureDetail === null)
    );
  };

  // SSE 연결 관리
  useEffect(() => {
    // ref 초기화
    if (eventSource.current) {
      eventSource.current.close();
      isConnectedRef.current = false;
    }

    lastEventIdRef.current = null;
    totalTestCasesRef.current = null;

    if (openTimeoutIdRef.current) {
      clearTimeout(openTimeoutIdRef.current);
    }
    if (messageTimeoutIdRef.current) {
      clearTimeout(messageTimeoutIdRef.current);
    }

    // job이 할당되지 않은 상태에서 실행 방지
    if (!jobId) return;

    const connectToSse = (): void => {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      // if (lastEventIdRef.current) {
      //   headers["Last-Event-ID"] = lastEventIdRef.current;
      // }

      const eventSourceUrl = new URL(`${SPRING_DOMAIN}/api/judge-job/${jobId}/subscription`);

      // 기본으로 제공되는 EventSource 클래스는 custom http header 설정을 지원하지 않음 (항상은 아님)
      // 이를 지원하는 라이브러리(EventSourcePolyfill)를 사용하여 custom http header를 SSE 연결 요청 헤더에 포함
      eventSource.current = new EventSourcePolyfill(eventSourceUrl.toString(), {
        headers,
        withCredentials: true, // 쿠키를 자동으로 포함하도록 설정, refresh token 전송
      });
      isConnectedRef.current = true;

      // onopen 타임아웃 시작
      startOpenTimeout();

      eventSource.current.onopen = async (): Promise<void> => {
        if (openTimeoutIdRef.current) {
          clearTimeout(openTimeoutIdRef.current);
        }

        const responseData = await CodingTestApi.executeCode(jobId);

        // 조건문 내부 값이 undefined면 falsy 값
        if (isErrorDataType(responseData)) {
          const errorMessage = responseData['error'];

          if (eventSource.current) {
            eventSource.current.close();
            isConnectedRef.current = false;
          }

          if (errorMessage) onError(errorMessage);
          return;
        }
        totalTestCasesRef.current = responseData['totalTestCases'];
        onOpen(totalTestCasesRef.current);

        // onmessage 타임아웃 시작
        startMessageTimeout();
        return;
      };

      eventSource.current.onmessage = async (event: MessageEvent): Promise<void> => {
        // SSE 연결 open 전용 메시지는 무시
        if (event.data === 'Connection Established') {
          return;
        }

        if (messageTimeoutIdRef.current) {
          clearTimeout(messageTimeoutIdRef.current);
        }

        if (event.data.startsWith('error ')) {
          if (eventSource.current) {
            eventSource.current.close();
            isConnectedRef.current = false;
          }

          onError(event.data.slice(6));
          return;
        }

        // Event ID 업데이트
        lastEventIdRef.current = parseInt(event.lastEventId);

        // 받은 메시지를 파싱하여 외부 콜백으로 전달 후 컴포넌트 업데이트
        const parsedData: unknown = JSON.parse(event.data);
        if (!isSSETestCaseResult(parsedData)) {
          console.error('Invalid SSE message format:', parsedData);
          onError(
            '채점 과정에서 예기치 못한 문제가 발생하였습니다😭. 문제가 반복될 경우 관리자에게 문의해주세요.',
          );
          setShouldConnect((prev) => !prev);
          return;
        }

        onMessage(parsedData);

        // 모두 수신한 경우 완료 처리
        if (lastEventIdRef.current === totalTestCasesRef.current || !parsedData['passed']) {
          if (messageTimeoutIdRef.current) {
            clearTimeout(messageTimeoutIdRef.current);
          }

          if (eventSource.current) {
            eventSource.current.close();
            isConnectedRef.current = false;
          }

          onComplete();
          return;
        }

        startMessageTimeout();
      };

      eventSource.current.onerror = (err: Event): void => {
        if (openTimeoutIdRef.current) {
          clearTimeout(openTimeoutIdRef.current);
        }

        if (messageTimeoutIdRef.current) {
          clearTimeout(messageTimeoutIdRef.current);
        }

        // EventSource 연결을 수동으로
        // 종료하여 브라우저의 자동 재연결 메커니즘이 시도되지 않도록 처리
        if (eventSource.current) {
          eventSource.current.close();
          isConnectedRef.current = false;
        }

        // 새로고침된 경우 onError 실행 방지
        if (isReloading.current) {
          isReloading.current = false;
          return;
        }

        console.error(err);
        onError(
          '서버와 연결이 끊겼습니다. 다시 시도해주세요. 문제가 반복될 경우 관리자에게 문의바랍니다.',
        );
        return;
      };
    };

    connectToSse();

    // 컴포넌트 언마운트, useEffect의 재실행 시 아래 return 수행
    return (): void => {
      if (openTimeoutIdRef.current) {
        clearTimeout(openTimeoutIdRef.current);
      }

      if (messageTimeoutIdRef.current) {
        clearTimeout(messageTimeoutIdRef.current);
      }

      if (eventSource.current) {
        eventSource.current.close();
        isConnectedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldConnect]);

  return [isConnectedRef, (): void => setShouldConnect((prev) => !prev)];
};

export default useSse;
