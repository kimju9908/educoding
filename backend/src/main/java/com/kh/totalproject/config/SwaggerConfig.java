package com.kh.totalproject.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Slf4j
@Configuration
public class SwaggerConfig implements WebMvcConfigurer {

    // 환경 변수 로드
    Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

    // SWAGGER_ENABLED 환경 변수를 Boolean 값으로 변환
    private final boolean swaggerEnabled = Boolean.parseBoolean(
            dotenv.get("SWAGGER_ENABLED", System.getenv("SWAGGER_ENABLED") != null ? System.getenv("SWAGGER_ENABLED") : "true")
    );
    // localhost:8111/swagger-ui/index.html# (스웨거 경로)
    @Bean
    public OpenAPI customOpenAPI(){

        if (!swaggerEnabled) {
            log.info("🚀 Swagger is disabled in this environment.");
            return null; // Swagger를 비활성화
        }
        log.info("✅ Swagger is enabled in this environment.");
        // SecurityScheme 정의
        // Swagger UI에서 JWT를 인증 헤더에 포함할 수 있도록 설정
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP) // HTTP 타입
                .scheme("bearer") // 인증 방식 : bearer
                .bearerFormat("JWT") // 토큰 형식 : JWT
                .name("Authorization") // HTTP 헤더 이름
                .in(SecurityScheme.In.HEADER); // 헤더에서 토큰 추출
        
        // Security Requirement 정의
        // Swagger UI의 모든 요청에 대해 JWT 인증이 필요하도록 설정
        // SecurityConfig 에서 Swagger UI 접속과 /auth 경로의 controller 만 인증 해제 상태
        // 나머지 controller 확인 위해서는 token 입력해야 접근 가능
        // Authorize 에서 Bearer 입력할 필요 없이 토큰값만 입력하면됨
        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("JWT"); 

        return new OpenAPI()
                .info(new Info()
                        .title("Total Project API")
                        .version("v0")
                        .description("API Swagger"))
                .addSecurityItem(securityRequirement) // JWT 인증 추가
                .schemaRequirement("JWT", securityScheme); // ScurityScheme 등록
    }
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        if (!swaggerEnabled) {
            return; // Swagger UI 리소스 비활성화
        }

        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/")
                .setCachePeriod(3600); // 캐시 유지 시간 (초 단위)
    }
}
