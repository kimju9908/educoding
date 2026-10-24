package com.kh.totalproject.dto.response;

public class GoogleUserInfoResponse {
    private String email;
    private String name;

    // 생성자, 게터, 세터 추가
    public GoogleUserInfoResponse(String email, String name) {
        this.email = email;
        this.name = name;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
