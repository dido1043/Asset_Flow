package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<List<User>> findByOrganizationId(Long organizationId);
}
