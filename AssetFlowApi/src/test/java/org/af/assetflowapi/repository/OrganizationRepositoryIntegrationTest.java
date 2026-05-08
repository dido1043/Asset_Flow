package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class OrganizationRepositoryIntegrationTest extends RepositoryIntegrationTestBase {

    @Autowired
    OrganizationRepository organizationRepository;

    @Autowired
    UserRepository userRepository;

    @Test
    void findByOrganizationNameContainingIgnoreCase_returnsMatches() {
        Organization org = new Organization();
        org.setOrganizationName("Acme Corp");
        organizationRepository.save(org);

        List<Organization> results = organizationRepository.findByOrganizationNameContainingIgnoreCase("acme");

        assertFalse(results.isEmpty());
        assertEquals("Acme Corp", results.getFirst().getOrganizationName());
    }

    @Test
    void findByLeaderId_returnsOrganization() {
        User leader = new User();
        leader.setFullName("Leader One");
        leader.setEmail("leader@example.com");
        leader.setRole(RoleEnum.LEADER);
        leader = userRepository.save(leader);

        Organization org = new Organization();
        org.setOrganizationName("Leader Org");
        org.setLeader(leader);
        organizationRepository.save(org);

        Organization found = organizationRepository.findByLeaderId(leader.getId());

        assertNotNull(found);
        assertEquals("Leader Org", found.getOrganizationName());
    }
}

