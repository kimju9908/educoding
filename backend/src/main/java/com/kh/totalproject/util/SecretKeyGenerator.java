package com.kh.totalproject.util;

import java.security.SecureRandom;
import java.util.Base64;

public class SecretKeyGenerator {
    
    // 256 bit 랜덤 Secret key 생성
    public static String generateSecretKey() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] keyBytes = new byte[32];
        secureRandom.nextBytes(keyBytes);
        return Base64.getEncoder().encodeToString(keyBytes);
    }

//    public static void main(String[] args){
//        String secretKey = generateSecretKey();
//        System.out.println("Generate SECRET_KEY: " + secretKey );
//    } 
}
