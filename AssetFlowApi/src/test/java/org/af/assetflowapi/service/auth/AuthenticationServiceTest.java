package org.af.assetflowapi.service.auth;

import org.af.assetflowapi.data.dto.UserDto;
import org.af.assetflowapi.data.dto.auth.LoginUserDto;
import org.af.assetflowapi.data.enums.AuthProvider;
import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock UserRepository userRepository;
    @Mock AuthenticationManager authenticationManager;
    @Mock PasswordEncoder passwordEncoder;
    @Mock ModelMapper modelMapper;
    @Mock EmailService emailService;

    @InjectMocks
    AuthenticationService service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "tokenTtlHours", 24L);
    }

    @Test
    void register_persistsDisabledUserWithTokenAndSendsEmail() {
        UserDto dto = new UserDto();
        dto.setEmail("new@user.local");
        dto.setPassword("secret");
        dto.setFullName("New User");
        dto.setRole(RoleEnum.EMPLOYEE);

        when(userRepository.findByEmail("new@user.local")).thenReturn(Optional.empty());
        when(modelMapper.map(dto, User.class)).thenAnswer(inv -> {
            User u = new User();
            u.setEmail(dto.getEmail());
            u.setFullName(dto.getFullName());
            u.setRole(dto.getRole());
            return u;
        });
        when(passwordEncoder.encode("secret")).thenReturn("ENC:secret");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(modelMapper.map(any(User.class), org.mockito.ArgumentMatchers.eq(UserDto.class))).thenReturn(new UserDto());

        service.register(dto);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.isEnabled()).isFalse();
        assertThat(saved.getVerificationToken()).isNotBlank();
        assertThat(saved.getTokenExpiry()).isAfter(Instant.now());
        assertThat(saved.getPassword()).isEqualTo("ENC:secret");
        assertThat(saved.getProviderType()).isEqualTo(AuthProvider.LOCAL);
        verify(emailService).sendVerificationEmail(saved, saved.getVerificationToken());
    }

    @Test
    void register_rejectsExistingVerifiedEmail() {
        UserDto dto = new UserDto();
        dto.setEmail("taken@user.local");
        dto.setPassword("secret");

        User existing = new User();
        existing.setEmail("taken@user.local");
        existing.setEnabled(true);
        when(userRepository.findByEmail("taken@user.local")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.register(dto))
                .isInstanceOf(IllegalArgumentException.class);
        verify(userRepository, never()).save(any());
        verify(emailService, never()).sendVerificationEmail(any(), any());
    }

    @Test
    void register_refreshesExistingUnverifiedAccount() {
        UserDto dto = new UserDto();
        dto.setEmail("pending@user.local");
        dto.setPassword("new-secret");
        dto.setFullName("Pending User");
        dto.setRole(RoleEnum.EMPLOYEE);

        User existing = new User();
        existing.setId(42L);
        existing.setEmail("pending@user.local");
        existing.setEnabled(false);
        existing.setVerificationToken("old-token");
        when(userRepository.findByEmail("pending@user.local")).thenReturn(Optional.of(existing));
        when(passwordEncoder.encode("new-secret")).thenReturn("ENC:new-secret");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(modelMapper.map(any(User.class), org.mockito.ArgumentMatchers.eq(UserDto.class))).thenReturn(new UserDto());

        service.register(dto);

        assertThat(existing.getVerificationToken()).isNotEqualTo("old-token");
        assertThat(existing.getPassword()).isEqualTo("ENC:new-secret");
        assertThat(existing.isEnabled()).isFalse();
        verify(emailService).sendVerificationEmail(existing, existing.getVerificationToken());
    }

    @Test
    void verifyEmail_enablesUserAndClearsToken() {
        User user = new User();
        user.setEnabled(false);
        user.setVerificationToken("tok");
        user.setTokenExpiry(Instant.now().plus(1, ChronoUnit.HOURS));
        when(userRepository.findByVerificationToken("tok")).thenReturn(Optional.of(user));

        service.verifyEmail("tok");

        assertThat(user.isEnabled()).isTrue();
        assertThat(user.getVerificationToken()).isNull();
        assertThat(user.getTokenExpiry()).isNull();
        verify(userRepository).save(user);
    }

    @Test
    void verifyEmail_rejectsExpiredToken() {
        User user = new User();
        user.setEnabled(false);
        user.setVerificationToken("tok");
        user.setTokenExpiry(Instant.now().minus(1, ChronoUnit.MINUTES));
        when(userRepository.findByVerificationToken("tok")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.verifyEmail("tok"))
                .isInstanceOf(EmailVerificationException.class)
                .satisfies(ex -> assertThat(((EmailVerificationException) ex).getReason())
                        .isEqualTo(EmailVerificationException.Reason.TOKEN_EXPIRED));
        assertThat(user.isEnabled()).isFalse();
    }

    @Test
    void verifyEmail_reportsUnknownToken() {
        when(userRepository.findByVerificationToken("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.verifyEmail("nope"))
                .isInstanceOf(EmailVerificationException.class)
                .satisfies(ex -> assertThat(((EmailVerificationException) ex).getReason())
                        .isEqualTo(EmailVerificationException.Reason.TOKEN_NOT_FOUND));
    }

    @Test
    void resendVerification_issuesFreshTokenAndSends() {
        User user = new User();
        user.setEmail("pending@user.local");
        user.setEnabled(false);
        user.setVerificationToken("old");
        user.setTokenExpiry(Instant.now().minus(1, ChronoUnit.HOURS));
        when(userRepository.findByEmail("pending@user.local")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        service.resendVerification("pending@user.local");

        assertThat(user.getVerificationToken()).isNotEqualTo("old");
        assertThat(user.getTokenExpiry()).isAfter(Instant.now());
        verify(emailService).sendVerificationEmail(user, user.getVerificationToken());
    }

    @Test
    void resendVerification_rejectsAlreadyVerified() {
        User user = new User();
        user.setEmail("done@user.local");
        user.setEnabled(true);
        when(userRepository.findByEmail("done@user.local")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.resendVerification("done@user.local"))
                .isInstanceOf(EmailVerificationException.class)
                .satisfies(ex -> assertThat(((EmailVerificationException) ex).getReason())
                        .isEqualTo(EmailVerificationException.Reason.ALREADY_VERIFIED));
        verify(emailService, never()).sendVerificationEmail(any(), any());
    }

    @Test
    void login_translatesDisabledExceptionToVerificationError() {
        LoginUserDto dto = new LoginUserDto();
        dto.setEmail("pending@user.local");
        dto.setPassword("pw");
        when(authenticationManager.authenticate(any())).thenThrow(new DisabledException("disabled"));

        assertThatThrownBy(() -> service.login(dto))
                .isInstanceOf(EmailVerificationException.class)
                .satisfies(ex -> assertThat(((EmailVerificationException) ex).getReason())
                        .isEqualTo(EmailVerificationException.Reason.NOT_VERIFIED));
    }

    @Test
    void login_succeeds_returnsMappedDto() {
        LoginUserDto dto = new LoginUserDto();
        dto.setEmail("ok@user.local");
        dto.setPassword("pw");
        User user = new User();
        user.setEmail("ok@user.local");
        UserDto mapped = new UserDto();
        when(authenticationManager.authenticate(any())).thenReturn(mock(Authentication.class));
        when(userRepository.findByEmail("ok@user.local")).thenReturn(Optional.of(user));
        when(modelMapper.map(Optional.of(user), UserDto.class)).thenReturn(mapped);

        UserDto result = service.login(dto);

        assertThat(result).isSameAs(mapped);
    }

    private static <T> T mock(Class<T> type) {
        return org.mockito.Mockito.mock(type);
    }
}
