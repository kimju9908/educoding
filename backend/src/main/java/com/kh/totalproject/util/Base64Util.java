package com.kh.totalproject.util;

import java.util.Base64;

public class Base64Util {
    public static boolean isBase64Encoded(String input) {
        if (input == null || input.isEmpty()) {
            return false;
        }
        try {
            Base64.getDecoder().decode(input);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
