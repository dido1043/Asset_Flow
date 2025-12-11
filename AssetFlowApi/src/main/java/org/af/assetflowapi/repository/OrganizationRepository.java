package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    List<Organization> findByOrganizationNameContainingIgnoreCase(String name);
    List<Organization> findByLeaderId(Long leaderId);
}
