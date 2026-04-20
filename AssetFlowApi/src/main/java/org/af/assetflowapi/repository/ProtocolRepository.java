package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.model.Protocol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProtocolRepository extends JpaRepository<Protocol, Long> {
    List<Protocol> findByEmployeeId(Long employeeId);
    List<Protocol> findByOrganizationId(Long organizationId);
    Protocol findByProtocolUri(String protocolUri);
}
