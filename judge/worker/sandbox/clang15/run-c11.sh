#!/bin/bash
# 스크립트 종료 시 현재 셸 스크립트와 관련된 모든 프로세스 그룹에 SIGKILL(-9) 신호를 보내 강제 종료.
# 2>/dev/null: 'no such process'와 같은 불필요한 오류 메시지를 무시하기 위해 stderr 출력을 버림.
trap 'kill -15 -$$ 2>/dev/null' EXIT SIGINT SIGTERM

# -O0: 컴파일 최적화 옵션으로 -O0은 기본 세팅이며,
#      최적화 이후에는 런타임 에러 상황에 대한 동작 예측이 더 어려워 지기 때문에 기본 세팅 사용
# -lm: 수학 라이브러리(libm)를 링크
# timeout 5s: 컴파일이 5초 이상 걸리면 강제 종료
# 2>&1: stderr를 stdout으로 리다이렉션하여 출력 캡처.
compile_output=$(timeout 5s clang -std=c11 -o main main.c -O0 -lm 2>&1)
compile_exit_code=$?

if [ $compile_exit_code -ne 0 ]; then
  if [ $compile_exit_code -eq 124 ]; then
    compile_error="Time limit exceeded"

  elif [ $compile_exit_code -eq 137 ]; then
    compile_error="Memory limit exceeded"

  else
    # 에러 메시지 대입, 출력이 없을 경우 기본 메시지 삽입
    compile_error=$(echo "$compile_output" || echo "")
    if [ -z "${compile_error//[[:space:]]/}" ]; then
      compile_error="Unknown compilation error"
    fi
  fi

  # JSON 포맷 문자열 포매팅(-n) 후 색상 코드 없이(-M) 일반 텍스트를 한줄로(-c) 출력
  jq -ncM --arg status "compileError" --arg err "$compile_error" --argjson code "$compile_exit_code" \
    '{status: $status, error: $err, exitCode: $code}'

  # 채점 종료, 컴파일 에러로 인한 오답 처리로 진행
  exit 0
fi

# 컴파일 시점 사용한 변수 할당 해제
unset compile_error compile_exit_code compile_output

# 채점 통과 시간 제한(초) 변수 할당
timeout_value=$(awk '{printf "%.2f", $1}' <<< "$2")  # timeout은 소수점 이하 최대 2자리 까지 허용하므로, 이하 제거

# 채점 통과 메모리 제한 변수 할당
memory_limit_mb=$3

# 테스트 케이스 입력을 JSON 배열화 후, 배열의 크기만큼 실행 횟수 설정
for ((i=0; i<$(jq 'length' <<< "$1"); i++)); do
  # 임시 파일 초기화
  : > program_stderr.log
  : > time.log
  : > program_stdout.log

  # 실행 전 시간 기록 (나노초 단위)
  start_time=$(date +%s%N)

  # 프로그램 실행 및 메모리 측정:
  # timeout: 설정된 시간(초) 이상 실행 시 강제 종료, 소수점 이하 2자리 까지 설정 가능
  # /usr/bin/time -f "%M": 최대 메모리 사용량(kB 단위) 측정.
  # 2> program_stderr.log: 프로그램의 stderr를 파일로 리다이렉션.
  # 1> program_stdout.log: 프로그램의 stdout를 파일로 리다이렉션.
  # 2>> time.log: time 유틸리티의 출력(stderr)을 파일로 추가, time은 기본적으로 stderr 사용
  # jq -r ".[$i][0] | join(\"\\n\")" <<< "$1": 테이스 케이스 입력을 JSON 배열화 후 i번째 입력값 리스트를 한 줄씩 \n으로 연결
  timeout "$timeout_value"s /usr/bin/time -f "%M" sh -c "./main 2> program_stderr.log 1> program_stdout.log" <<< "$(jq -r ".[$i][0] | join(\"\\n\")" <<< "$1")" 2>> time.log
  runtime_exit_code=$?

  # 실행 후 시간 기록 (나노초 단위)
  end_time=$(date +%s%N)

  # 실행 시간 계산 (나노초 → 밀리초, 1ms 단위로 반올림)
  # 0.5ms 미만의 시간을 정확하게 반올림 하도록 처리
  elapsed_time_ms=$(( (end_time - start_time + 500000) / 1000000 ))  # ns → ms

  # 실행 시간 유효성 검사 (0 이하 실행 시간 여부 검사)
  if [ $elapsed_time_ms -le 0 ]; then
    # JSON 포맷 문자열 포매팅(-n) 후 색상 코드 없이(-M) 일반 텍스트를 한줄로(-c) 출력
    jq -ncM '{status: "systemError", error: "Time measurement failed", exitCode: 1}'

    # 시스템 에러로 작업 중단 (채점 불가)
    exit 1
  fi

  # 측정 시간과 비교를 위해 테스트 케이스 통과 기준 시간을 ms로 변환
  timeout_ms=$(awk "BEGIN {printf \"%.0f\", $timeout_value * 1000}")

  # 측정된 시간과 타임아웃 값 중 더 작은 값을 최종 시간으로 사용
  # 프로그램이 타임아웃으로 종료된 경우 실제 실행 시간은 timeout_ms를 초과할 수 없음
  final_elapsed_ms=$(awk "BEGIN {print ($elapsed_time_ms < $timeout_ms) ? $elapsed_time_ms : $timeout_ms}")

  # 런타임 에러 발생 여부 점검 및 처리
  if [ $runtime_exit_code -ne 0 ]; then
    # C 언어 자체는 내장된 예외 처리 메커니즘이 없고 Java, Python과 달리 런타임 오류(Exception Handling)를 내부적으로 핸들링하지 않음.
    # **Undefined Behavior(UB, 정의되지 않은 동작)**는 C 표준에서 "이 상황에서의 동작을 명시적으로 정의하지 않는다"고 규정한 경우이다.
    # 구체적으로는 배열 경계 초과, 정수를 0으로 나누기, Null 포인터 역참조, 부호 있는 정수 오버플로우, 변수 초기화 없이 사용과 같이
    # 프로그램이 쓰레기 값을 가질 수 있게 되고, 그로 인해 예상치 못한 오류가 발생할 수 있는 경우를 말한다.
    # UB에 대한 동작은 컴파일러 최적화 옵션 수준에 따라 다르며, 이러한 UB를 유발하는 코드는 제거(무시)되거나, 쓰레기 값이 들어간 상태로 사용되는 등
    # 약간씩 달라질 수 있고, 이상태로도 프로그램은 동작을 지속할 수 있으며,
    # 그 과정에서 메모리 액세스 위반(segfault)이 발생하는 경우 OS 수준의 시그널(SIGSEGV 등)로 강제 종료 처리될 수 있다.
    # 예를 들면 정수를 0으로 나눔과 동시에 변수에 대입하여 초기화 하는 연산은 현재 구현된 채점 시스템에서는 쓰레기 값을 가진다.
    # (ex. int x = 1 / 0; printf("x: %d%, x); // 출력: "x: -575753920")

    # 컴파일 시점에 AddressSanitizer(ASan), UndefinedBehaviorSanitizer(UBSan) 등을 활성화하면
    # 메모리 수준 조작의 유효성, 정의되지 않은 동작 등을 런타임 오류를 감지하고 관련 메시지를 출력한 후 프로그램을 종료할 수 있지만 Java 등의 언어처럼 친절하진 않음
    # 따라서 이 메시지를 코테 콘솔 메시지로 활용하기 위해서는 Sanitizer 메시지를 유저 친화적으로 파싱하는 작업이 별도로 필요함
    # 참고로 프로그래머스에서는 Sanitizer를 사용하지 않는 것으로 확인

    if [ $runtime_exit_code -eq 124 ]; then
      runtime_error="Time limit exceeded"

    elif [ $runtime_exit_code -eq 137 ]; then
      runtime_error="Memory limit exceeded"

    else
      # 에러 메시지 변수에 대입, 출력이 없을 경우 기본 메시지 삽입
      runtime_error=$(cat program_stderr.log 2>/dev/null || echo "")
      if [ -z "${runtime_error//[[:space:]]/}" ]; then
        runtime_error="Unknown runtime error"
      fi
    fi

    # JSON 포맷 문자열 포매팅(-n) 후 색상 코드 없이(-M) 일반 텍스트를 한줄로(-c) 출력
    jq -ncM --arg status "runtimeError" --argjson testCase $((i+1)) --arg err "$runtime_error" --argjson code "$runtime_exit_code" \
      '{status: $status, testCaseIndex: $testCase, error: $err, exitCode: $code}'

    # 채점 종료, 런타임 에러로 인한 오답 처리로 진행
    exit 0
  fi

  # 최대 메모리 사용량 (`/usr/bin/time -f "%M"`) 추출 (숫자만 포함된 줄 찾기)
  rss_kb=$(grep -E "^[0-9]+$" time.log)

  # 메모리 측정 값이 unset 이거나 strip/trim 결과의 길이가 0이면 기본 메시지 설정
  if [ -z "${rss_kb//[[:space:]]/}" ]; then
    # JSON 포맷 문자열 포매팅(-n) 후 색상 코드 없이(-M) 일반 텍스트를 한줄로(-c) 출력
    jq -ncM '{status: "systemError", error: "Memory measurement failed", exitCode: 1}'

    # 시스템 에러로 작업 중단 처리 (채점 불가)
    exit 1
  fi

  # KB를 MB로 변환 (소수점 두 자리까지 표시)
  # 1024로 나누어 MB 단위로 변환하고 소수점 두 자리까지 반올림
  rss_mb=$(awk "BEGIN {printf \"%.2f\", $rss_kb / 1024}")

  # 측정된 메모리와 제한값 중 더 작은 값을 최종 메모리로 사용
  # 프로그램이 메모리 제한으로 종료된 경우 실제 사용 메모리는 제한값을 초과할 수 없음
  final_memory_mb=$(awk "BEGIN {print ($rss_mb < $memory_limit_mb) ? $rss_mb : $memory_limit_mb}")

  # 기대 출력값 추출 (명령 치환$() 과정에서 맨 뒤 개행 문자 집합은 제거됨)
  expected_output=$(jq -r ".[$i][1]" <<< "$1")

  # 유저 출력값 추출 (명령 치환$() 과정에서 맨 뒤 개행 문자 집합은 제거됨)
  user_output=$(cat program_stdout.log)

  # 정답 여부 확인
  if [ "$user_output" = "$expected_output" ]; then
    passed=true
  else
    passed=false
  fi

  # JSON 포맷 문자열 포매팅(-n) 후 색상 코드 없이(-M) 일반 텍스트를 한줄로(-c) 출력
  jq -ncM --argjson testCase $((i+1)) --argjson elapsedTime $final_elapsed_ms --argjson memoryUsage $final_memory_mb \
    --arg stdout "$user_output" --arg expected "$expected_output" --argjson passed "$passed" \
    '{testCaseIndex: $testCase, elapsedTimeMs: $elapsedTime, memoryUsageMb: $memoryUsage, stdout: $stdout, expected: $expected, passed: $passed}'

  # 채점 종료, 오답 처리로 진행
  if [ "$passed" = false ]; then
    exit 0
  fi

   # 사용한 변수 할당 해제
  unset passed user_output expected_output final_memory_mb rss_mb rss_kb runtime_error final_elapsed_ms timeout_ms elapsed_time_ms end_time runtime_exit_code

	# 현재 실행 중인 프로세스 및 이하 자식 프로세스 종료 (다음 테스트 케이스 실행 전 정리)
	# 2>/dev/null 설정하여 no such process 등 메시지 무시
  pkill -15 -P $$ 2>/dev/null
done

exit 0

# to-do (optional)
# 입력 유효성 검증: $1과 $2의 형식을 사전에 검증하면 더 견고한 스크립트가 될 수 있습니다.
# Sanitizer 활용: 런타임 오류 메시지를 사용자 친화적으로 제공하려면 AddressSanitizer 등을 고려할 수 있습니다(현재는 사용하지 않음).
# stderr 출력의 경우, returncode가 0인 경우에(정상 실행) warning 수준의 메시지에 대한 모니터링 및 디버깅을 위해 필요 시 추가할 것