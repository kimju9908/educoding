# (1) python:3.12.9-slim 이미지를 기반으로 도커 이미지 생성, OS는 Debian 기반의 Linux 이미지
FROM python:3.12.9-slim

# (2) node.js v20.18.3 및 time 설치, UTF-8 로케일 설정
# node.js는 NodeSource에서 Debian 패키지로 제공되므로 설치가 심플
RUN apt-get update && apt-get install -y \
    time \
    jq \
    procps \
    dos2unix \
    && rm -rf /var/lib/apt/lists/* \
    && echo "LC_ALL=C.UTF-8" >> /etc/environment \
    && echo "LANG=C.UTF-8" >> /etc/environment

# (3) 비루트 사용자 설정
# 설명: 컨테이너 내부에서 UID/GID 1000으로 실행하도록 설정합니다. 이는 루트 권한(UID 0)을 제거하여 권한 상승 공격을 방지하고, 시스템 리소스에 대한 접근을 제한합니다.
# 영향:
# - 루트 권한이 필요한 작업(예: /etc 수정, 시스템 콜 실행 권한 변경)은 불가능해집니다.
# - /tmpfs에 쓰기 및 실행은 여전히 가능하지만, 시스템 수준의 변경은 차단됩니다.
# - gcc와 같은 컴파일러 실행 및 바이너리 실행은 비루트 사용자 권한으로도 충분히 가능합니다.
USER 1000:1000
