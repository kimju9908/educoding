package com.kh.totalproject.util;
import com.kh.totalproject.exception.UnauthenticatedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@Slf4j
public class SecurityUtil {
    /**
     * 현재 인증된 사용자의 ID를 반환합니다.
     * 구체적으로는 SecurityContext에서 JWT 토큰이 인증 필터를 통과한 후 저장된 인증 정보를 가져오고
     * 사용자 ID를 추출합니다. 사용자 정보를 찾을 수 없는 경우 커스텀 예외를 던집니다.
     *
     * @return 인증된 사용자의 ID
     * @throws UnauthenticatedException 인증 정보가 없거나 CustomUserDetails 형식이 아닐 때
     */
    public static Long getCurrentUserIdOrThrow() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.info("[SecurityUtil.getCurrentUserIdOrThrow] 사용자가 인증되지 않았습니다.");
            throw new UnauthenticatedException();
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof CustomUserDetails)) {
            log.info("[SecurityUtil.getCurrentUserIdOrThrow] 인증된 사용자 정보를 찾을 수 없습니다.");
            throw new UnauthenticatedException();
        }

        CustomUserDetails userDetails = (CustomUserDetails) principal;
        Long userId = userDetails.getUserKey();
        if (userId == null) {
            log.info("[SecurityUtil.getCurrentUserIdOrThrow] 사용자 ID를 찾을 수 없습니다.");
            throw new UnauthenticatedException();
        }

        return userId;
    }

    /**
     * 현재 인증된 사용자의 ID를 반환합니다.
     * 구체적으로는 SecurityContext에서 JWT 토큰이 인증 필터를 통과한 후 저장된 인증 정보를 가져오고
     * 사용자 ID를 추출합니다. 사용자 정보를 찾을 수 없는 경우 null을 반환합니다.
     *
     * @return 인증된 사용자의 ID 또는 null
     */
    public static Long getCurrentUserKeyIfPresent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof CustomUserDetails)) {
            return null;
        }

        CustomUserDetails userDetails = (CustomUserDetails) principal;
        Long userKey = userDetails.getUserKey();
        if (userKey == null) {
            return null;
        }

        return userKey;
    }

    // Admin 체크와 동시에 userId 를 반환하는 메서드
    public static Long isAdminOrThrow() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.info("[SecurityUtil.isAdminUserOrThrow] 사용자가 인증되지 않았습니다.");
            throw new UnauthenticatedException();
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof CustomUserDetails)) {
            log.info("[SecurityUtil.isAdminUserOrThrow] 인증된 사용자 정보를 찾을 수 없습니다.");
            throw new UnauthenticatedException();
        }

        CustomUserDetails userDetails = (CustomUserDetails) principal;
        Long userId = userDetails.getUserKey();
        if (userId == null) {
            log.info("[SecurityUtil.isAdminUserOrThrow] 사용자 ID를 찾을 수 없습니다.");
            throw new UnauthenticatedException();
        }

        boolean isAdmin = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ADMIN"));

        if (!isAdmin) {
            log.info("[SecurityUtil.isAdminUserOrThrow] 관리자 권한이 없습니다.");
            throw new AccessDeniedException("접근할 권한이 없습니다.");
        }

        return userId;
    }
}