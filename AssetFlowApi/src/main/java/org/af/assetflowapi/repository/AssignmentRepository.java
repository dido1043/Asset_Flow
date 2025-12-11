package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByEmployeeId(UUID employeeId);
    List<Assignment> findByProductId(Long productId);
    List<Assignment> findByStatus(String status);
    List<Assignment> findByDateReturnedIsNull(); // currently assigned (not returned)
}
