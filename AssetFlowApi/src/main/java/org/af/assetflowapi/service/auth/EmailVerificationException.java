package org.af.assetflowapi.service.auth;

public class EmailVerificationException extends RuntimeException {

    public enum Reason {
        TOKEN_NOT_FOUND,
        TOKEN_EXPIRED,
        ALREADY_VERIFIED,
        NOT_VERIFIED,
        USER_NOT_FOUND,
        SEND_FAILED
    }

    private final Reason reason;

    public EmailVerificationException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    public EmailVerificationException(Reason reason, String message, Throwable cause) {
        super(message, cause);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }
}
