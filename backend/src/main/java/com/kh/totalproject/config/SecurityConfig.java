package com.kh.totalproject.config;

import com.kh.totalproject.util.JwtAccessDeniedHandler;
import com.kh.totalproject.util.JwtAuthenticationEntryPoint;
import com.kh.totalproject.util.JwtFilter;
import com.kh.totalproject.util.JwtUtil;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2LoginAuthenticationProvider;
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {
    private final JwtUtil jwtUtil;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // SecurityFilter IP 화이트 리스트 처리를 위한 AuthorizationManager
        AuthorizationManager<RequestAuthorizationContext> ipAuthorizationManager = (authentication, context) -> {
            HttpServletRequest request = context.getRequest();
            Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
            IpAddressMatcher ipAddressMatcher = new IpAddressMatcher(dotenv.get("CELERY_WORKER_IP", System.getenv("CELERY_WORKER_IP"))); // Webhook 채점 워커 호스트의 IP는 화이트 리스트 처리
            boolean isIpAllowed = ipAddressMatcher.matches(request);
            return new AuthorizationDecision(isIpAllowed);
        };

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 설정
                .csrf(AbstractHttpConfigurer::disable) // CSRF 비활성화
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 무상태 세션 정책
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/webhook/callback-event/**").access(ipAuthorizationManager) // IP 화이트 리스트에 해당 되는 경우 검사 X
                        // GitHub가 브라우저 리다이렉트로 직접 호출하는 콜백 -- Authorization 헤더가 없어
                        // 서명된 state로만 신원을 검증한다(GithubStateToken). /api/github/** 나머지는 기존 JWT 인증 필요.
                        .requestMatchers("/api/github/oauth/callback", "/api/github/install/callback").permitAll()
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui/index.html",
                                "/about",
                                "/study/**",
                                "/api/chatbot/**",
                                "/codingtest/**",
                                "/community/**",
                                "/roadmap/**",
                                "/login",
                                "/findid",
                                "/findpw",
                                "/signup",
                                "/auth/**",
                                "/auth/google",
                                "/auth/join/**",
                                "/auth/google",
                                "/auth/autologin",
                                "/community/list/post",
                                "/community/list/others/post",
                                "/community/list/others/profile/{userId}",
                                "/community/list/post/{id}",
                                "/community/list/list/post/view",
                                "/community/list/comment",
                                "/community/topWriter",
                                "/community/weeklyPopularPost",
                                "/community/similarPost/{boardId}",
                                "/community/reaction/status",
                                "/api/code-challenge",
                                "/mentor/contentData/**",
                                "/mentor/grantForMenteeReview",
                                "/mentorReview/reviewData/{mentorId}",
                                "/",
                                "/index.html",
                                "/actuator/health"
                        ).permitAll()
                        .anyRequest().authenticated() // 나머지 요청은 인증 필요
                )
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler)) // 예외 처리

                .addFilterBefore(new JwtFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class) // JWT 필터
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authorization -> authorization
                                .baseUri("/oauth2/authorization")) // OAuth2 인증 경로 설정
                        .tokenEndpoint(token -> token
                                .accessTokenResponseClient(accessTokenResponseClient())) // 토큰 엔드포인트 설정
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oAuth2UserService())) // 사용자 정보 엔드포인트 설정
                );

        return http.build();
    }
    @Bean
    @Order(1)
    public SecurityFilterChain staticResourceChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/images/**", "/assets/**", "/css/**", "/js/**", "/fonts/**", "/static/**", "/favicon.ico", "/robots.txt")
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .requestCache(AbstractHttpConfigurer::disable)
                .securityContext(AbstractHttpConfigurer::disable)
                .sessionManagement(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }

    // OAuth2AccessTokenResponseClient Bean 추가
    @Bean
    public OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> accessTokenResponseClient() {
        return new DefaultAuthorizationCodeTokenResponseClient();
    }

    // OAuth2UserService Bean 설정
    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService() {
        return new DefaultOAuth2UserService(); // 기본 OAuth2UserService 사용
    }

    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String FLASK_HOST = dotenv.get("FLASK_HOST", System.getenv("FLASK_HOST"));
        String RAG_HOST = dotenv.get("RAG_HOST", System.getenv("RAG_HOST"));
        String DOMAIN_URL = dotenv.get("DOMAIN_URL", System.getenv("DOMAIN_URL"));


        configuration.addAllowedOrigin(DOMAIN_URL);
        configuration.addAllowedOrigin(FLASK_HOST);
        configuration.addAllowedOrigin(RAG_HOST);
        configuration.addAllowedOrigin("http://localhost:8111");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        configuration.addExposedHeader("Authorization");
        configuration.addExposedHeader("Set-Cookie");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // 비밀번호 인코더
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public HttpFirewall allowSemicolonHttpFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowSemicolon(true); // 세미콜론 허용
        return firewall;
    }

    // AuthenticationManager Bean 등록
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);

        // Ensure OAuth2LoginAuthenticationProvider is added
        authenticationManagerBuilder.authenticationProvider(new OAuth2LoginAuthenticationProvider(
                new DefaultAuthorizationCodeTokenResponseClient(), new DefaultOAuth2UserService()));

        return authenticationManagerBuilder.build();
    }
}
