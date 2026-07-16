package org.af.assetflowapi.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.af.assetflowapi.data.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@assetflow.local}")
    private String fromAddress;

    @Value("${app.verification.link-base:http://localhost:3000/verify-email}")
    private String verificationLinkBase;

    @Value("${app.verification.enabled:true}")
    private boolean verificationEmailsEnabled;

    public void sendVerificationEmail(User user, String token) {
        if (!verificationEmailsEnabled) {
            log.info("Verification email disabled; would have sent link for {}", user.getEmail());
            return;
        }
        String link = buildVerificationLink(token);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("Verify your AssetFlow account");
        message.setText(
                "Hi " + safeName(user) + ",\n\n"
                        + "Thanks for signing up for AssetFlow. Please confirm your email address by opening the link below:\n\n"
                        + link + "\n\n"
                        + "This link will expire in 24 hours. If you did not create an account, you can ignore this message.\n\n"
                        + "— The AssetFlow team"
        );

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.error("Failed to send verification email to {}", user.getEmail(), ex);
            throw new EmailVerificationException(
                    EmailVerificationException.Reason.SEND_FAILED,
                    "Unable to send verification email. Please try again shortly.",
                    ex
            );
        }
    }

    String buildVerificationLink(String token) {
        String base = verificationLinkBase;
        String encoded = URLEncoder.encode(token, StandardCharsets.UTF_8);
        String separator = base.contains("?") ? "&" : "?";
        String candidate = base + separator + "token=" + encoded;
        try {
            return new URI(candidate).toString();
        } catch (URISyntaxException ex) {
            log.warn("Configured verification link base is not a valid URI: {}", base);
            return candidate;
        }
    }

    private String safeName(User user) {
        return user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : "there";
    }
}
