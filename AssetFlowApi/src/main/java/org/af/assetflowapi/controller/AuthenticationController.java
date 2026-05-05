package org.af.assetflowapi.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.af.assetflowapi.data.dto.UserDto;
import org.af.assetflowapi.data.dto.auth.LoginUserDto;
import org.af.assetflowapi.data.dto.auth.OAuthCodeExchangeRequest;
import org.af.assetflowapi.data.dto.response.LoginResponse;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.service.AuthorizationService;
import org.af.assetflowapi.service.auth.AuthenticationService;
import org.af.assetflowapi.service.auth.JwtService;
import org.af.assetflowapi.service.auth.OAuthCodeService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final OAuthCodeService oAuthCodeService;
    private final ModelMapper modelMapper;
    private final AuthorizationService authorizationService;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(authenticationService.getUsers());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/user/{userId}")
    public ResponseEntity<UserDto> getUser(@AuthenticationPrincipal User caller, @PathVariable Long userId) {
        authorizationService.requireSelfOrSameOrgLeaderOrAdmin(caller, userId);
        return ResponseEntity.ok(authenticationService.getUser(userId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @GetMapping("/users/org/{orgId}")
    public ResponseEntity<List<UserDto>> getUsersByOrganization(@AuthenticationPrincipal User caller,
                                                                @PathVariable Long orgId) {
        authorizationService.requireOrgLeaderOrAdmin(caller, orgId);
        return ResponseEntity.ok(authenticationService.getUsersByOrganization(orgId));
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody UserDto user) {
        return ResponseEntity.status(201).body(authenticationService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginUserDto loginUserDto,
                                               HttpServletResponse response) {
        User authenticatedUser = modelMapper.map(authenticationService.login(loginUserDto), User.class);

        String jwtToken = jwtService.generateToken(authenticatedUser);
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(jwtService.getExpirationTime());
        loginResponse.setRole(authenticatedUser.getRole().toString());
        loginResponse.setUserId(authenticatedUser.getId());

        addAuthCookie(response, jwtToken);
        return ResponseEntity.ok(loginResponse);
    }

    @GetMapping("/oauth2/login")
    public ResponseEntity<?> oAuthLogin(HttpServletResponse httpServletResponse) throws IOException {
        httpServletResponse.sendRedirect("/oauth2/authorization/google");
        return ResponseEntity.ok("Redirecting...");
    }

    @GetMapping("/loginSuccess")
    public ResponseEntity<?> handleGoogleSuccess(Authentication authentication) throws IOException {
        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OAuth2 authentication required");
        }
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        User user = authenticationService.oAuthLogin(token);

        String jwtToken = jwtService.generateToken(user);
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(jwtService.getExpirationTime());
        loginResponse.setRole(user.getRole().toString());
        loginResponse.setUserId(user.getId());

        String exchangeCode = oAuthCodeService.createCode(loginResponse);
        String baseUrl = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        String redirectUrl = String.format(
                "%s/oauth/callback?code=%s",
                baseUrl,
                URLEncoder.encode(exchangeCode, StandardCharsets.UTF_8)
        );

        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
    }

    @PostMapping("/oauth/exchange")
    public ResponseEntity<LoginResponse> exchangeOAuthCode(@RequestBody OAuthCodeExchangeRequest request,
                                                           HttpServletResponse httpResponse) {
        LoginResponse response = oAuthCodeService.consumeCode(request.code());
        if (response == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        addAuthCookie(httpResponse, response.getToken());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/user/edit/{userId}")
    public ResponseEntity<UserDto> editUser(@AuthenticationPrincipal User caller,
                                            @PathVariable Long userId,
                                            @RequestBody UserDto userDto) {
        authorizationService.requireSelfOrAdmin(caller, userId);
        return ResponseEntity.ok(authenticationService.editProfile(userId, userDto));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie expired = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, expired.toString());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/user/delete/{userId}")
    public ResponseEntity<UserDto> deleteUser(@PathVariable Long userId) {
        return ResponseEntity.ok(authenticationService.deleteUser(userId));
    }

    private void addAuthCookie(HttpServletResponse response, String jwtToken) {
        ResponseCookie cookie = ResponseCookie.from("jwt", jwtToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofMillis(jwtService.getExpirationTime()))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
