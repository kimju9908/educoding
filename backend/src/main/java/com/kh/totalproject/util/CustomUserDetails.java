package com.kh.totalproject.util;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Getter
@Setter
public class CustomUserDetails implements UserDetails {

    private final Long userKey;
    private final String userId;
    private final String email;
    private final String nickname;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(String userId, String email, String nickname, Long userKey, String password, Collection<? extends GrantedAuthority> authorities){
        this.userId = userId;
        this.email = email;
        this.nickname = nickname;
        this.userKey = userKey;
        this.password = password;
        this.authorities = authorities;
    }


    @Override
    public String getUsername(){
        return userId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        return authorities;
    }
    @Override
    public String getPassword(){
        return password;
    }
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}