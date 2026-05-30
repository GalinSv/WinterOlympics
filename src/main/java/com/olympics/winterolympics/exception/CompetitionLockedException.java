package com.olympics.winterolympics.exception;

public class CompetitionLockedException extends RuntimeException {

    public CompetitionLockedException(String message) {
        super(message);
    }
}
