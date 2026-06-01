package com.olympics.winterolympics.entity.exception;

public class InvalidCompetitionException extends RuntimeException {

    public InvalidCompetitionException(String message) {
        super(message);
    }
}