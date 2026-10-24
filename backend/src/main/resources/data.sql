-- 두 정수의 덧셈
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    1,
    '두 정수의 덧셈',
    '두 정수 x, y가 줄바꿈 문자로 구분되어 입력으로 주어집니다. 두 정수의 합을 구하여 출력하는 코드를 작성하세요.',
    '-100,000 <= x, y <= 100,000',
    '산술 연산',
    'PRACTICE',
    64,
    1.0
);

-- 나머지와 몫 구하기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    2,
    '나머지와 몫 구하기',
    '두 정수 x, y가 줄바꿈 문자로 구분되어 입력으로 주어집니다. 첫 번째 정수 x를 두 번째 정수 y로 나눈 몫과 나머지를 공백 문자로 구분하여 출력하는 코드를 작성하세요.',
    '-100,000 <= x, y <= 100,000 (단, y ≠ 0)',
    '산술 연산',
    'PRACTICE',
    64,
    1.0
);

-- 1차 방정식의 해 구하기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    3,
    '1차 방정식의 해 구하기',
    '1차 방정식 ax + b = 0의 해를 구하는 코드를 작성하세요. a와 b는 줄바꿈 문자로 구분되어 입력으로 주어집니다.',
    '-100,000 <= a, b <= 100,000 (단, a ≠ 0이고 결과 값은 항상 정수)',
    '산술 연산',
    'PRACTICE',
    64,
    1.0
);

-- 두 수 비교하기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    4,
    '두 수 비교하기',
    '두 정수 x와 y가 줄바꿈 문자로 구분되어 입력으로 주어집니다. 두 수를 비교하여 첫 번째 수 x가 크면 1, 두 번째 수 y가 크면 -1, 같으면 0을 출력하는 코드를 작성하세요.',
    '-100,000 <= x, y <= 100,000',
    '조건문',
    'PRACTICE',
    64,
    1.0
);

-- 윤년 판별하기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    5,
    '윤년 판별하기',
    '연도(year)가 주어집니다. 윤년이면 1, 아니면 0을 출력하는 코드를 작성하세요.\n\n※ 윤년의 조건:\n• 연도가 4의 배수이면서 100의 배수가 아니거나, 400의 배수인 경우',
    '1 <= year <= 9999',
    '조건문',
    'PRACTICE',
    64,
    1.0
);

-- 학점 계산하기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    6,
    '학점 계산하기',
    '학생의 점수(score)가 주어집니다. 점수에 따라 학점을 계산하여 출력하는 코드를 작성하세요.\n\n※학점 기준:\n• 90점 이상: A\n• 80점 이상: B\n• 70점 이상: C\n• 60점 이상: D\n• 60점 미만: F',
    '0 <= score <= 100',
    '조건문',
    'PRACTICE',
    64,
    1.0
);

-- 구구단
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    7,
    '구구단',
    '정수 N이 주어집니다. N의 구구단(N*1 ~ N*9)을 공백 문자로 구분하여 출력하는 코드를 작성하세요.',
    '1 <= N <= 9',
    '반복문',
    'PRACTICE',
    64,
    1.0
);

-- 1부터 N까지 합 구하기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    8,
    '1부터 N까지 합 구하기',
    '정수 N이 주어집니다. 1부터 N까지의 합을 출력하는 코드를 작성하세요.',
    '1 <= N <= 10,000',
    '반복문',
    'PRACTICE',
    64,
    1.0
);

-- 계단 만들기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    9,
    '계단 만들기',
    '정수 N이 주어집니다. N번째 라인까지 * 문자를 출력하는데, 라인의 수가 증가할 때마다 * 문자의 갯수도 하나씩 증가하도록 코드를 작성하세요.',
    '1 <= N <= 10',
    '반복문',
    'PRACTICE',
    64,
    1.0
);

-- 최대 값 찾기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    10,
    '최댓 값 찾기',
    '첫 번째 라인에 정수 배열의 길이 N이 주어지고, 두 번째 라인에는 N개의 정수가 공백 문자로 구분되어 주어집니다. N개의 정수 중 최댓 값을 찾아 출력하는 코드를 작성하세요.',
    '1 <= N <= 100\n-10,000 <= 모든 정수 값 <= 10,000',
    '배열/리스트',
    'PRACTICE',
    64,
    1.0
);

-- 배열 뒤집기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    11,
    '배열 뒤집기',
    '첫 번째 라인에 정수 배열의 길이 N이 주어지고, 두 번째 라인에는 배열의 각 요소가 공백 문자로 구분되어 주어집니다. 배열의 모든 요소를 공백문자로 구분하여 거꾸로 출력하는 코드를 작성하세요.',
    '1 <= N <= 100\n-10,000 <= 배열의 모든 요소 <= 10,000',
    '배열/리스트',
    'PRACTICE',
    64,
    1.0
);

-- 2차원 배열 요소의 합 구하기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    12,
    '2차원 배열 요소의 합 구하기',
    '2차원 배열의 행과 열의 크기 N과 M이 줄바꿈 문자로 구분되어 주어집니다. 이후 N개의 라인에 걸쳐 M개의 정수가 공백 문자로 구분되어 주어집니다. 2차원 배열의 모든 요소의 합을 출력하는 코드를 작성하세요.',
    '1 <= N, M <= 100\n-10,000 <= 배열의 모든 요소 <= 10,000',
    '배열/리스트',
    'PRACTICE',
    64,
    1.0
);

-- 문자열 길이 출력하기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    13,
    '문자열 길이 출력하기',
    '문자열이 주어집니다. 문자열의 길이를 출력하는 코드를 작성하세요.\n\n예시로 주어진 입력에서 맨 앞과 뒤의 \"문자는 실제 입력 값으로 취급하지 않습니다.',
    '1 <= 문자열 길이 <= 100',
    '문자열',
    'PRACTICE',
    64,
    1.0
);

-- 문자가 등장하는 횟수 세기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    14,
    '문자가 등장하는 횟수 세기',
    '영어 대소문자와 공백으로 이루어진 문자열이 주어집니다. 이후 다음 라인에는 문자가 주어집니다. 주어진 문자열에 해당 문자가 등장하는 횟수를 출력하는 코드를 작성하세요.\n\n예시로 주어진 입력에서 맨 앞과 뒤의 \"문자는 실제 입력 값으로 취급하지 않습니다.',
    '1 <= 문자열 길이 <= 100',
    '문자열',
    'PRACTICE',
    64,
    1.0
);

-- 대소문자 변환하기
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    15,
    '대소문자 변환하기',
    '문자열이 주어집니다. 문자열의 대문자는 소문자로, 소문자는 대문자로 변환하여 출력하는 코드를 작성하세요.\n\n예시로 주어진 입력에서 맨 앞과 뒤의 \"문자는 실제 입력 값으로 취급하지 않습니다.',
    '1 <= 문자열 길이 <= 100',
    '문자열',
    'PRACTICE',
    64,
    1.0
);

-- 암스트롱 수
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    16,
    '암스트롱 수',
    '주어진 양의 정수 x의 암스트롱 수 여부를 출력하는 코드를 작성하세요.\n\n※ 암스트롱 수(Armstrong number)는 각 자리 숫자를 모두 n제곱(여기서 n은 자릿수)한 합이 원래 수와 같은 수를 말합니다.\n• 9는 암스트롱 수입니다. (9 = 9^1)\n• 10은 암스트롱 수가 아닙니다. (10 != 1^2 + 0^2)\n• 153은 암스트롱 수입니다. (153 = 1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153)',
    '1 <= x <= 1,000,000',
    null,
    'BASIC',
    64,
    1.0
);

-- 다트 게임
INSERT IGNORE INTO code_challenge (
    challenge_id, title, description, cond, category, difficulty, memory_limit_mb, time_limit_ms
) VALUES (
    17,
    '다트 게임',
    '다트 게임에서 주어진 좌표(x, y)를 기준으로 다트가 어디에 맞았는지 확인하고, 점수를 계산하세요. 원의 중심은 (0, 0)이며, 주어진 좌표(x, y)를 기준으로 유클리드 거리 sqrt(x^2 + y^2)를 계산하여 점수를 판별합니다.\n\n※ 점수는 다음과 같은 규칙에 따라 부여됩니다.\n• 다트가 표적 바깥에 떨어지면: 0점\n• 다트가 외곽 원(반지름 10) 안에 떨어지면: 1점\n• 다트가 중간 원(반지름 5) 안에 떨어지면: 5점\n• 다트가 중심 원(반지름 1) 안에 떨어지면: 10점',
    '−10 <= x, y <= 10, (단, x와 y는 소수점 2번째 자리까지만 주어짐)',
    null,
    'INTERMEDIATE',
    64,
    1.0
);