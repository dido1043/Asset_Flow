package org.af.assetflowapi.service.auth;

import org.af.assetflowapi.data.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    JavaMailSender mailSender;

    @InjectMocks
    EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromAddress", "no-reply@test.local");
        ReflectionTestUtils.setField(emailService, "verificationLinkBase", "https://app.test/verify-email");
        ReflectionTestUtils.setField(emailService, "verificationEmailsEnabled", true);
    }

    @Test
    void sendsMessageContainingLink() {
        User user = user("user@test.local", "Test User");

        emailService.sendVerificationEmail(user, "abc-123");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getFrom()).isEqualTo("no-reply@test.local");
        assertThat(sent.getTo()).containsExactly("user@test.local");
        assertThat(sent.getSubject()).isNotBlank();
        assertThat(sent.getText()).contains("https://app.test/verify-email?token=abc-123");
        assertThat(sent.getText()).contains("Test User");
    }

    @Test
    void skipsSendWhenDisabled() {
        ReflectionTestUtils.setField(emailService, "verificationEmailsEnabled", false);

        emailService.sendVerificationEmail(user("user@test.local", "User"), "abc");

        verifyNoInteractions(mailSender);
    }

    @Test
    void urlEncodesToken() {
        User user = user("user@test.local", "User");

        emailService.sendVerificationEmail(user, "a b/c?d");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        // Space, slash, question mark must all be encoded so the URL parses correctly on the frontend
        assertThat(captor.getValue().getText()).contains("token=a+b%2Fc%3Fd");
    }

    @Test
    void wrapsMailExceptionInVerificationException() {
        doThrow(new MailSendException("smtp down")).when(mailSender).send((SimpleMailMessage) org.mockito.ArgumentMatchers.any());

        assertThatThrownBy(() -> emailService.sendVerificationEmail(user("u@t.l", "U"), "tok"))
                .isInstanceOf(EmailVerificationException.class)
                .satisfies(ex -> assertThat(((EmailVerificationException) ex).getReason())
                        .isEqualTo(EmailVerificationException.Reason.SEND_FAILED));
    }

    private static User user(String email, String name) {
        User u = new User();
        u.setEmail(email);
        u.setFullName(name);
        return u;
    }
}
