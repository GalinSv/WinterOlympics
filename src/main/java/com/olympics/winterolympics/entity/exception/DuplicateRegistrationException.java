package com.olympics.winterolympics.entity.exception;

public class DuplicateRegistrationException extends RuntimeException {

    public DuplicateRegistrationException(String message) {
        super(message);
    }
}