package org.af.assetflowapi.service.auth;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.UserDto;
import org.af.assetflowapi.data.dto.auth.LoginUserDto;
import org.af.assetflowapi.data.enums.AuthProvider;
import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    public UserDto register(UserDto userDto) {
        User user = modelMapper.map(userDto, User.class);
        user.setProviderType(AuthProvider.LOCAL);
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        return modelMapper.map(userRepository.save(user), UserDto.class);
    }

    public UserDto login(LoginUserDto loginUserDto) {
        String password = loginUserDto.getPassword();
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginUserDto.getEmail(),
                        loginUserDto.getPassword()
                )
        );
        return modelMapper.map(userRepository.findByEmail(loginUserDto.getEmail()), UserDto.class);
    }

    public User oAuthLogin(OAuth2AuthenticationToken oAuth2AuthenticationToken) {
        if (oAuth2AuthenticationToken == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication instanceof OAuth2AuthenticationToken) {
                oAuth2AuthenticationToken = (OAuth2AuthenticationToken) authentication;
            } else {
                throw new IllegalArgumentException("No OAuth2AuthenticationToken available");
            }
        }

        OAuth2User oAuth2User = oAuth2AuthenticationToken.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("OAuth2 principal missing email");
        }
        String username = oAuth2User.getAttribute("name");
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User u = new User();
                    u.setFullName(username);
                    u.setEmail(email);
                    u.setProviderType(AuthProvider.GOOGLE);
                    u.setRole(RoleEnum.EMPLOYEE);

                    return userRepository.save(u);
                });
        return user;
    }

}
