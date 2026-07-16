package org.af.assetflowapi.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.af.assetflowapi.data.dto.UserDto;
import org.af.assetflowapi.data.dto.auth.LoginUserDto;
import org.af.assetflowapi.data.enums.AuthProvider;
import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final EmailService emailService;

    @Value("${app.verification.token-ttl-hours:24}")
    private long tokenTtlHours;

    @Transactional
    public UserDto register(UserDto userDto) {
        if (userDto.getEmail() == null || userDto.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        User existing = userRepository.findByEmail(userDto.getEmail()).orElse(null);
        User user;
        if (existing != null) {
            if (existing.isEnabled()) {
                throw new IllegalArgumentException("An account with that email already exists");
            }
            // Re-registration while unverified — refresh credentials and issue a new token
            user = existing;
            user.setFullName(userDto.getFullName());
            user.setRole(userDto.getRole());
            user.setAge(userDto.getAge());
        } else {
            user = modelMapper.map(userDto, User.class);
            user.setProviderType(AuthProvider.LOCAL);
        }

        if (userDto.getPassword() == null || userDto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setEnabled(false);
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setTokenExpiry(Instant.now().plus(tokenTtlHours, ChronoUnit.HOURS));

        User saved = userRepository.save(user);
        emailService.sendVerificationEmail(saved, saved.getVerificationToken());
        return modelMapper.map(saved, UserDto.class);
    }

    @Transactional
    public void verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new EmailVerificationException(
                    EmailVerificationException.Reason.TOKEN_NOT_FOUND,
                    "Verification token is required"
            );
        }
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new EmailVerificationException(
                        EmailVerificationException.Reason.TOKEN_NOT_FOUND,
                        "Verification link is invalid or has already been used"
                ));

        if (user.isEnabled()) {
            user.setVerificationToken(null);
            user.setTokenExpiry(null);
            userRepository.save(user);
            throw new EmailVerificationException(
                    EmailVerificationException.Reason.ALREADY_VERIFIED,
                    "This account is already verified"
            );
        }

        if (user.getTokenExpiry() == null || user.getTokenExpiry().isBefore(Instant.now())) {
            throw new EmailVerificationException(
                    EmailVerificationException.Reason.TOKEN_EXPIRED,
                    "Verification link has expired. Request a new one."
            );
        }

        user.setEnabled(true);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerification(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EmailVerificationException(
                        EmailVerificationException.Reason.USER_NOT_FOUND,
                        "No account found for that email"
                ));
        if (user.isEnabled()) {
            throw new EmailVerificationException(
                    EmailVerificationException.Reason.ALREADY_VERIFIED,
                    "This account is already verified"
            );
        }
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setTokenExpiry(Instant.now().plus(tokenTtlHours, ChronoUnit.HOURS));
        User saved = userRepository.save(user);
        emailService.sendVerificationEmail(saved, saved.getVerificationToken());
    }

    public UserDto login(LoginUserDto loginUserDto) {
        String password = loginUserDto.getPassword();
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginUserDto.getEmail(),
                            loginUserDto.getPassword()
                    )
            );
        } catch (DisabledException ex) {
            throw new EmailVerificationException(
                    EmailVerificationException.Reason.NOT_VERIFIED,
                    "Email not verified. Please check your inbox for the verification link."
            );
        }
        return modelMapper.map(userRepository.findByEmail(loginUserDto.getEmail()), UserDto.class);
    }
    public UserDto getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + userId + " not found"));

        UserDto userDto = mapper(user);
        userDto.setOrganizationId(user.getOrganization() != null? user.getOrganization().getId() : null);
        return userDto;
    }
    public List<UserDto> getUsersByOrganization(Long organizationId) {
        List<User> users = userRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("No users found for organization with id " + organizationId));
        return users.stream()
                .map(user -> mapper(user))
                .toList();
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
                .map(existing -> {
                    if (existing.getProviderType() == AuthProvider.GOOGLE && !existing.isEnabled()) {
                        existing.setEnabled(true);
                        existing.setVerificationToken(null);
                        existing.setTokenExpiry(null);
                        return userRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    User u = new User();
                    u.setFullName(username);
                    u.setEmail(email);
                    u.setProviderType(AuthProvider.GOOGLE);
                    u.setRole(RoleEnum.EMPLOYEE);
                    u.setEnabled(true);
                    return userRepository.save(u);
                });
        return user;
    }
    public UserDto editProfile(Long userId, UserDto userDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + userId + " not found"));

        user.setFullName(userDto.getFullName());
        user.setEmail(userDto.getEmail());

        user.setAge(userDto.getAge());
        if (userDto.getPassword() != null && !userDto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        return modelMapper.map(userRepository.save(user), UserDto.class);
    }

    public List<UserDto> getUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> mapper(user))
                .toList();
    }

    public UserDto deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + userId + " not found"));
        userRepository.delete(user);
        return modelMapper.map(user, UserDto.class);
    }

    private UserDto mapper(User user) {
        UserDto userDto = modelMapper.map(user, UserDto.class);
        if (user.getOrganization() != null)
            userDto.setOrganizationId(user.getOrganization().getId());
        if(user.getAssignments() != null)
            userDto.setAssignmentIds(user.getAssignments().stream()
                    .filter(a -> a.getId() != null)
                    .map(a -> a.getId())
                    .toList());
        return userDto;
    }
}
