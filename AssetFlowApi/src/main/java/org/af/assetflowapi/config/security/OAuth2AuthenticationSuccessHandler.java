package org.af.assetflowapi.config.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.af.assetflowapi.data.dto.response.LoginResponse;
import org.af.assetflowapi.data.enums.AuthProvider;
import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.UserRepository;
import org.af.assetflowapi.service.auth.JwtService;
import org.af.assetflowapi.service.auth.OAuthCodeService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final OAuthCodeService oAuthCodeService;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        User user = resolveUser(token);

        String jwtToken = jwtService.generateToken(user);
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(jwtService.getExpirationTime());
        loginResponse.setRole(user.getRole().toString());
        loginResponse.setUserId(user.getId());

        String exchangeCode = oAuthCodeService.createCode(loginResponse);
        String base = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        String redirectUrl = base + "/oauth/callback?code=" + URLEncoder.encode(exchangeCode, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }

    private User resolveUser(OAuth2AuthenticationToken token) {
        OAuth2User oAuth2User = token.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User u = new User();
                    u.setFullName(name);
                    u.setEmail(email);
                    u.setProviderType(AuthProvider.GOOGLE);
                    u.setRole(RoleEnum.EMPLOYEE);
                    return userRepository.save(u);
                });
    }
}
