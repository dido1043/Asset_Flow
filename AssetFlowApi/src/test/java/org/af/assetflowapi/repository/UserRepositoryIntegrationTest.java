package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserRepositoryIntegrationTest extends RepositoryIntegrationTestBase {

    @Autowired
    UserRepository userRepository;

    @Autowired
    OrganizationRepository organizationRepository;

    @Test
    void findByEmail_returnsUser() {
        User user = new User();
        user.setFullName("User One");
        user.setEmail("user.one@example.com");
        user.setRole(RoleEnum.EMPLOYEE);
        userRepository.save(user);

        User found = userRepository.findByEmail("user.one@example.com").orElse(null);

        assertNotNull(found);
        assertEquals("User One", found.getFullName());
    }

    @Test
    void findByVerificationToken_returnsUser_andPersistsVerificationFields() {
        String token = UUID.randomUUID().toString();
        User user = new User();
        user.setFullName("Verify Me");
        user.setEmail("verify@example.com");
        user.setRole(RoleEnum.EMPLOYEE);
        user.setEnabled(false);
        user.setVerificationToken(token);
        user.setTokenExpiry(Instant.now().plus(1, ChronoUnit.HOURS));
        userRepository.saveAndFlush(user);

        User found = userRepository.findByVerificationToken(token).orElse(null);

        assertNotNull(found);
        assertEquals("verify@example.com", found.getEmail());
        assertFalse(found.isEnabled());
        assertNotNull(found.getTokenExpiry());
    }

    @Test
    void findByOrganizationId_returnsUsers() {
        Organization org = new Organization();
        org.setOrganizationName("Users Org");
        org = organizationRepository.save(org);

        User user = new User();
        user.setFullName("User Two");
        user.setEmail("user.two@example.com");
        user.setRole(RoleEnum.EMPLOYEE);
        user.setOrganization(org);
        userRepository.save(user);

        List<User> users = userRepository.findByOrganizationId(org.getId()).orElse(List.of());

        assertTrue(users.stream().anyMatch(u -> "user.two@example.com".equals(u.getEmail())));
    }
}

