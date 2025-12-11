package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    List<Employee> findByOrganizationId(Long organizationId);
    List<Employee> findByFullNameContainingIgnoreCase(String fullName);
    List<Employee> findByAgeBetween(Integer minAge, Integer maxAge);
}
