# Sanitizer 추가 및 런타임 에러 파싱 버전 (참고용)
# LSan 쪽 처리 중
# UBSan, ASan은 일부 케이스 파싱 처리됨

#!/bin/bash
# 프로세스 종료 시 관리: 사용자가 새로운 메모리 상주 프로세스 그룹을 생성할 수 있으므로,
# 스크립트 종료 시 현재 셸 스크립트와 관련된 모든 프로세스 그룹에 SIGKILL(-9) 신호를 보내 강제 종료.
# 2>/dev/null: 'no such process'와 같은 불필요한 오류 메시지를 무시하기 위해 stderr 출력을 버림.
trap 'kill -9 -$$ 2>/dev/null' EXIT SIGINT SIGTERM

export ASAN_OPTIONS="halt_on_error=1:verbosity=0:print_summary=1"
export UBSAN_OPTIONS="halt_on_error=1:print_summary=1"
export ASAN_OPTIONS="detect_leaks=0"

# C 프로그램 컴파일: program.c를 clang으로 컴파일하며 오류 메시지를 캡처.
# -fsanitize=undefined: 실행 시 정의되지 않은 동작(예: 0으로 나누기, 메모리 오류)을 감지하고 종료.
# -fsanitize=address: 메모리 관련 오류(예: use-after-free, buffer overflow 등)를 감지하고 종료.
# -fno-sanitize-recover=undefined,address: 감지된 undefined 및 address 오류에서 복구하지 않고 즉시 프로그램 중단
# -O0: 최적화 없이 컴파일(디버깅 용이성 유지, 성능 향상 필요 없음, default 컴파일 옵션).
# timeout 5s: 컴파일이 5초 이상 걸리면 강제 종료.
# 2>&1: stderr를 stdout으로 리다이렉션하여 출력 캡처.
compile_output=$(timeout 5s clang -std=c11 -fsanitize=undefined,address -fno-sanitize-recover=undefined,address -o program program.c -O0 2>&1)
compile_exit_code=$?

if [ $compile_exit_code -ne 0 ]; then
  # 컴파일 오류 메시지 처리:
  # sed: /tmp/ 경로를 제거하여 작업 디렉토리 노출 방지.
  # jq -R: 한 라인 씩 문자열을 JSON-safe 문자열로 변환 (이스케이프 처리 등)
  # jq -s: 여러 라인의 텍스트를 JSON 배열로 묶음
  # jq -R . | jq -s 'join("\\n")': JSON 배열의 각 요소를 "\n"으로 연결한 문자열로 변환하여, 최종적으로 JSON-safe 단일 문자열로 변환 (-Rs 대비 명확한 단계적 처리를 위해 분리)
	compile_error=$(echo "$compile_output" | sed "s|/tmp/||g" | jq -R . | jq -s 'join("\\n")')

  # 컴파일 에러 메시지가 없으면 기본 메시지 설정
  if [ -z "$compile_error" ] || [ "$compile_error" = "\"\"" ]; then
      compile_error="\"Unknown compilation error\""
  fi

  # JSON 포맷 문자열 작성
  json_output="{\"status\": \"compile_error\", \"error\": $compile_error, \"exitCode\": $compile_exit_code}"
  # -c 옵션: JSON을 하나의 라인으로 컴팩트하게 출력
  echo "$json_output" | jq -c .
  exit 1
fi

# JSON 배열화 한후, 배열의 크기만큼 runs(실행 횟수) 설정
runs=$(echo "$1" | jq '. | length')
timeout_value=$(echo "$2" | awk '{printf "%.2f", $1}')  # timeout은 소수점 이하 최대 2자리 까지 허용하므로, 이하 제거

for i in $(seq 0 $(($runs - 1))); do
	# 임시 파일 초기화: 이전 실행의 로그 파일 삭제 후 새로 생성.
  rm -f program_stderr.log time.log program_stdout.log
  touch program_stderr.log time.log program_stdout.log

	# JSON에서 i번째 입력값 리스트를 한 줄씩 \n으로 연결
  # jq -r: 출력 시 따옴표(") 없이 'raw' 문자열로 출력 (ex: echo '{"name": "Alice"}' | jq -r '.name' => Alice)
  input=$(echo "$1" | jq -r ".[$i][0] | join(\"\\n\")")

  # 실행 전 시간 기록 (나노초 단위)
  start_time=$(date +%s%N)

  # 프로그램 실행 및 메모리 측정:
  # - timeout: $timeout_value 초 이상 실행 시 강제 종료.
  # - /usr/bin/time -f "%M": 최대 메모리 사용량(kB 단위) 측정.
  # - 1> program_stderr.log: 프로그램의 stderr를 파일로 리다이렉션.
  # - 2> program_stdout.log: 프로그램의 stdout를 파일로 리다이렉션.
  # - 3> time.log: time 유틸리티의 출력(stderr)을 파일로 추가, time은 기본적으로 stderr 사용
  timeout "$timeout_value"s /usr/bin/time -f "%M" sh -c "./program 2> program_stderr.log 1> program_stdout.log" <<< "$input" 2>> time.log
	runtime_exit_code=$?

  # 실행 후 시간 기록 (나노초 단위)
  end_time=$(date +%s%N)

  # 실행 시간 계산 (나노초 → 밀리초, 1ms 단위로 반올림)
  # 0.5ms 미만의 시간을 정확하게 반올림 하도록 처리
  elapsed_time_ms=$(( (end_time - start_time + 500000) / 1000000 ))  # ns → ms

  # 실행 시간 유효성 검사 (0 이하 실행 시간 여부 검사)
  if [ $elapsed_time_ms -le 0 ]; then
    # JSON 포맷 문자열 작성
    json_output="{\"status\": \"system_error\", \"testCaseIndex\": $((i+1)), \"error\": \"Time measurement failed\", \"exitCode\": 1}"
    # -c 옵션: JSON을 하나의 라인으로 컴팩트하게 출력
    echo "$json_output" | jq -c .
    exit 1
  fi

  # 최대 메모리 사용량 (`/usr/bin/time -f "%M"`) 추출 (숫자만 포함된 줄 찾기)
  mem_usage_kb=$(cat time.log | grep -E "^[0-9]+$")

  # 메모리 측정 값이 빈 문자열 인지 검사
  if [ -z "$mem_usage_kb" ]; then
    # JSON 포맷 문자열 작성
    json_output="{\"status\": \"system_error\", \"testCaseIndex\": $((i+1)), \"error\": \"Memory measurement failed\", \"exitCode\": 1}"
    # -c 옵션: JSON을 하나의 라인으로 컴팩트하게 출력
    echo "$json_output" | jq -c .
    exit 1
  fi

	# 런타임 에러 발생 여부 점검 및 처리
	if [ $runtime_exit_code -ne 0 ]; then
	  # 1. ASan 에러 파싱: heap-use-after-free 등의 에러 패턴 매칭
    asan_error=$(cat program_stderr.log | grep -oP '==\d+==ERROR: AddressSanitizer: \K(heap-use-after-free|heap-buffer-overflow|stack-buffer-overflow|global-buffer-overflow|stack-use-after-return|use-after-poison|stack-use-after-scope|initialization-order-fiasco|memory-leak|dynamic-stack-buffer-overflow)' | head -n 1)

    if [ -n "$asan_error" ]; then
      runtime_error="$asan_error detected"
    else
      # 2. UndefinedBehaviorSanitizer 형식 오류 처리
      ubsan_error=$(cat program_stderr.log | grep -oP 'program\.c:\d+:\d+: runtime error: \K.*' | head -n 1)
      line_info=$(cat program_stderr.log | grep -oP 'program\.c:\K\d+:\d+' | head -n 1)
      if [ -n "$ubsan_error" ] && [ -n "$line_info" ]; then
        runtime_error="program.c:$line_info: $ubsan_error"
      else
        # 3. stack-overflow, double free 처리
        runtime_error=$(cat program_stderr.log | grep -oP '(stack-overflow|double-free)' | head -n 1)

        if [ -n "$runtime_error" ]; then
          runtime_error="$runtime_error detected"

        # 4. 이외의 경우
        else
          # 원본 stderr을 그대로 사용
          # jq -Rs: 여러 라인의 문자열을 개행 문자를 포함한 단일 문자열로 변환하고 JSON-safe 문자열로 변환 (이스케이프 처리 등)
          runtime_error=$(cat program_stderr.log | jq -Rs .)
          # stderr이 빈 경우 기본값 설정
          if [ -z "$runtime_error" ] || [ "$runtime_error" = "\"\"" ]; then
            runtime_error="Unknown runtime error"
          fi
        fi
      fi
    fi

    # JSON 포맷 문자열 작성
    # jq -R: 한 라인의 문자열을 JSON-safe 문자열로 변환 (이스케이프 처리 등)
		json_output="{\"status\": \"runtime_error\", \"testCaseIndex\": $((i+1)), \"error\": $(echo "$runtime_error" | jq -R .), \"exitCode\": $runtime_exit_code}"
		# -c 옵션: JSON을 하나의 라인으로 컴팩트하게 출력
		echo "$json_output" | jq -c .
		exit 1
	fi

	# `program.c`의 표준 출력(stdout) 및 표준 오류(stderr) 추출
	# jq -Rs: 여러 라인의 문자열을 개행 문자를 포함한 단일 문자열로 변환하고 JSON-safe 문자열로 변환 (이스케이프 처리 등)
  program_stdout=$(cat program_stdout.log | jq -Rs .)  # stdout을 JSON-safe string으로 변환

  # stderr 출력의 경우, 코드 채점 환경에서 굳이 확인할 필요는 없으나,
  # 실행 환경에서 언어 내부 메시지에 대한 모니터링 및 디버깅을 위해 필요 시 사용 가능
  # program_stderr=$(cat program_stderr.log | jq -Rs .)  # stderr을 JSON-safe string으로 변환
  #	json_output="{\"testCaseIndex\": $((i+1)), \"elapsedTimeMs\": $elapsed_time_ms, \"maxMemoryUsedKb\": $mem_usage_kb, \"stdout\": $program_stdout, \"stderr\": $program_stderr}"

  # JSON 포맷 문자열 작성
	json_output="{\"testCaseIndex\": $((i+1)), \"elapsedTimeMs\": $elapsed_time_ms, \"maxMemoryUsedKb\": $mem_usage_kb, \"stdout\": $program_stdout}"
	# -c 옵션: JSON을 하나의 라인으로 컴팩트하게 출력
	echo "$json_output" | jq -c .

	# 현재 실행 중인 프로세스 및 이하 자식 프로세스 강제 종료 (다음 테스트 케이스 실행 전 정리)
	# 2>/dev/null 설정하여 no such process 등 메시지 무시
	pkill -9 -P $$ 2>/dev/null
done
