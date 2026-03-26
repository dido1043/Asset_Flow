package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByEmployeeId(Long employeeId);
    List<Assignment> findByProductId(Long productId);
    List<Assignment> findByDateReturnedIsNull();
    
    @Query("SELECT a FROM Assignment a JOIN a.product p WHERE p.organization.id = :organizationId")
    List<Assignment> findByOrganizationId(@Param("organizationId") Long organizationId);
}
