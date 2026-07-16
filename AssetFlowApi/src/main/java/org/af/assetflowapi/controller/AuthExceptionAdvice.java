package org.af.assetflowapi.controller;

import org.af.assetflowapi.data.dto.response.MessageResponse;
import org.af.assetflowapi.service.auth.EmailVerificationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = AuthenticationController.class)
public class AuthExceptionAdvice {

    @ExceptionHandler(EmailVerificationException.class)
    public ResponseEntity<MessageResponse> handleVerification(EmailVerificationException ex) {
        HttpStatus status = switch (ex.getReason()) {
            case TOKEN_NOT_FOUND, TOKEN_EXPIRED -> HttpStatus.GONE;
            case ALREADY_VERIFIED -> HttpStatus.CONFLICT;
            case USER_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case NOT_VERIFIED -> HttpStatus.FORBIDDEN;
            case SEND_FAILED -> HttpStatus.BAD_GATEWAY;
        };
        return ResponseEntity.status(status).body(MessageResponse.of(ex.getMessage()));
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<MessageResponse> handleDisabled(DisabledException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(MessageResponse.of(
                "Email not verified. Please check your inbox for the verification link."
        ));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<MessageResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(MessageResponse.of("Invalid email or password"));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<MessageResponse> handleAuthentication(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(MessageResponse.of("Authentication failed"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(MessageResponse.of(ex.getMessage()));
    }
}
