package com.kh.totalproject.constant.codechallenge.enums;

public enum FailureCause {
    COMPILE_ERROR, COMPILE_TIMEOUT, COMPILE_OUT_OF_MEMORY,
    RUNTIME_ERROR, RUNTIME_TIMEOUT, RUNTIME_OUT_OF_MEMORY,

    WRONG_ANSWER,

    SANDBOX_TIMEOUT,
    SANDBOX_OUT_OF_MEMORY
}