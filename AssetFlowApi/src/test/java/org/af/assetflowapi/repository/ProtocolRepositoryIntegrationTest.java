package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.enums.ProtocolType;
import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Protocol;
import org.af.assetflowapi.data.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ProtocolRepositoryIntegrationTest extends RepositoryIntegrationTestBase {

    @Autowired
    ProtocolRepository protocolRepository;

    @Autowired
    OrganizationRepository organizationRepository;

    @Autowired
    UserRepository userRepository;

    @Test
    void repositoryFindsProtocolsByEmployeeOrganizationAndUri() {
        Organization org = new Organization();
        org.setOrganizationName("Proto Org");
        org = organizationRepository.save(org);

        User employee = new User();
        employee.setFullName("Employee P");
        employee.setEmail("employee.p@example.com");
        employee.setRole(RoleEnum.EMPLOYEE);
        employee.setOrganization(org);
        employee = userRepository.save(employee);

        Protocol protocol = new Protocol();
        protocol.setProtocolUri("/protocols/abc.pdf");
        protocol.setContent("content");
        protocol.setType(ProtocolType.ASSET_ASSIGNMENT);
        protocol.setEmployee(employee);
        protocol.setOrganization(org);
        protocol = protocolRepository.save(protocol);

        List<Protocol> byEmployee = protocolRepository.findByEmployeeId(employee.getId());
        List<Protocol> byOrg = protocolRepository.findByOrganizationId(org.getId());
        Protocol byUri = protocolRepository.findByProtocolUri("/protocols/abc.pdf");

        assertFalse(byEmployee.isEmpty());
        assertEquals(protocol.getId(), byEmployee.getFirst().getId());
        assertFalse(byOrg.isEmpty());
        assertEquals(protocol.getId(), byOrg.getFirst().getId());
        assertNotNull(byUri);
        assertEquals(protocol.getId(), byUri.getId());
    }
}

