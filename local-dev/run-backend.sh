#!/bin/bash
# 메일을 Gmail 대신 로컬 Mailpit(localhost:8025에서 확인)으로 보냄
export SPRING_APPLICATION_JSON='{"spring":{"mail":{"host":"127.0.0.1","port":1025,"properties":{"mail.smtp.auth":"false","mail.smtp.starttls.enable":"false","mail.smtp.starttls.required":"false"}}}}'
cd "$(dirname "$0")/../backend" && exec ./gradlew bootRun 
