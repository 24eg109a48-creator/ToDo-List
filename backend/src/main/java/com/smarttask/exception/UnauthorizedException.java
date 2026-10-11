package com.smarttask.exception;

/** Thrown when authentication fails (HTTP 401). */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
