package org.af.assetflowapi.service.auth;

import org.af.assetflowapi.data.dto.response.LoginResponse;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OAuthCodeService {
    private static final Duration CODE_TTL = Duration.ofMinutes(2);
    private final Map<String, StoredCode> codes = new ConcurrentHashMap<>();

    public String createCode(LoginResponse response) {
        if (response == null) {
            throw new IllegalArgumentException("Login response cannot be null");
        }
        purgeExpired();
        String code = UUID.randomUUID().toString();
        codes.put(code, new StoredCode(response, Instant.now().plus(CODE_TTL)));
        return code;
    }

    public LoginResponse consumeCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            return null;
        }
        StoredCode storedCode = codes.remove(code);
        if (storedCode == null || storedCode.expiresAt().isBefore(Instant.now())) {
            return null;
        }
        return storedCode.response();
    }

    private void purgeExpired() {
        Instant now = Instant.now();
        codes.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    }

    private record StoredCode(LoginResponse response, Instant expiresAt) {}
}
