package com.kh.totalproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

// 쌓여있는 OTP 를 5분마다 삭제 시키는 로직을 실행하기 위한 Config
@Configuration
@EnableScheduling
public class ScheduleConfig {
}
