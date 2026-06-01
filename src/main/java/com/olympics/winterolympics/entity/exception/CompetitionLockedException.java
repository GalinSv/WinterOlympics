package com.olympics.winterolympics.entity.exception;

public class CompetitionLockedException extends RuntimeException {

    public CompetitionLockedException(String message) {
        super(message);
    }
}
