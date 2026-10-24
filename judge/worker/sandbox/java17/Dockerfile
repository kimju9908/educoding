# (1) debian:bookworm-slim 기반 이미지 사용
FROM debian:bookworm-slim

# (2) Eclipse Temurin JDK 17.0.14+7 설치
# curl: JDK 다운로드
# time: 실행 시간과 메모리 사용량 측정
# jq: JSON 처리
# procps: 프로세스 관리 (pkill 등)
# dos2unix: OS간 줄바꿈 문자 정규화
# Temurin은 바이너리 배포판으로 제공되어 단순 패키지 설치 방식이 아닌 수동 설치 과정 필요
# 배포 링크는 https://github.com/adoptium/temurin17-binaries?tab=readme-ov-file 참조
# apt-get 방식이 아니므로 다운로드, 디렉토리 생성, 압축 해제, 파일 삭제, 링크 설정을 직접 설정해야함
# 의존성 설치 완료 후 불필요한 파일 삭제 및 UTF-8 로케일 설정
RUN apt-get update && apt-get install -y \
    curl \
    time \
    jq \
    procps \
    dos2unix \
    && curl -L -o temurin.tar.gz https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10%2B7/OpenJDK17U-jdk_x64_linux_hotspot_17.0.10_7.tar.gz \
    && mkdir -p /opt/java \
    && tar -xzf temurin.tar.gz -C /opt/java --strip-components=1 \
    && rm temurin.tar.gz \
    && ln -s /opt/java/bin/java /usr/local/bin/java \
    && ln -s /opt/java/bin/javac /usr/local/bin/javac \
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
