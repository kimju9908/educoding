package com.kh.totalproject.config;


import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// 기본 CORS 설정 (Security CORS 설정은 따로 필요함)
// Controller 에 "http://localhost:3000" 명시할 필요 없이 바로 / Start 하면 됨
// Flask url / React url path를 잘 구분하는 것이 중요
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings (CorsRegistry registry){
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String FLASK_HOST = dotenv.get("FLASK_HOST", System.getenv("FLASK_HOST"));
        String DOMAIN_URL = dotenv.get("DOMAIN_URL", System.getenv("DOMAIN_URL"));

        registry.addMapping("/**") // 모든 엔드포인트 허용
                .allowedOrigins(
                        "http://localhost:8111",
                        DOMAIN_URL, // React 개발 서버
                        FLASK_HOST // Flask 서버
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
    @Override
    public void addResourceHandlers (ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCachePeriod(3600);

        // index.html을 정적 리소스로 처리
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600);
    }
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{spring:\\w+}")
                .setViewName("forward:/index.html");
        registry.addViewController("/**/{spring:\\w+}")
                .setViewName("forward:/index.html");
    }
}
