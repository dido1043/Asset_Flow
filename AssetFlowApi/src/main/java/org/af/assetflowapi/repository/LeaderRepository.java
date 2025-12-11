package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.model.Leader;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaderRepository extends JpaRepository<Leader, Long> {
    List<Leader> findByFullNameContainingIgnoreCase(String name);
    List<Leader> findByAgeBetween(Integer minAge, Integer maxAge);
}
