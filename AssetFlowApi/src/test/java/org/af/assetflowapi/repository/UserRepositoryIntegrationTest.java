package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

