package org.af.assetflowapi.config.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.time.Duration;
import java.util.Base64;

public class HttpCookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    static final String COOKIE_NAME = "OAUTH2_AUTH_REQUEST";
    private static final Duration COOKIE_TTL = Duration.ofMinutes(3);

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        Cookie cookie = findCookie(request);
        if (cookie == null) {
            return null;
        }
        return deserialize(cookie.getValue());
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request,
                                         HttpServletResponse response) {
        if (authorizationRequest == null) {
            removeCookie(request, response);
            return;
        }
        boolean secure = request.isSecure();
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, serialize(authorizationRequest))
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(COOKIE_TTL)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                 HttpServletResponse response) {
        OAuth2AuthorizationRequest authorizationRequest = loadAuthorizationRequest(request);
        removeCookie(request, response);
        return authorizationRequest;
    }

    private Cookie findCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                return cookie;
            }
        }
        return null;
    }

    private void removeCookie(HttpServletRequest request, HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(request.isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private static String serialize(OAuth2AuthorizationRequest authorizationRequest) {
        try (ByteArrayOutputStream bytes = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(bytes)) {
            oos.writeObject(authorizationRequest);
            return Base64.getUrlEncoder().encodeToString(bytes.toByteArray());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to serialize OAuth2AuthorizationRequest", e);
        }
    }

    private static OAuth2AuthorizationRequest deserialize(String value) {
        try (ByteArrayInputStream bytes = new ByteArrayInputStream(Base64.getUrlDecoder().decode(value));
             ObjectInputStream ois = new ObjectInputStream(bytes)) {
            return (OAuth2AuthorizationRequest) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
            return null;
        }
    }
}
