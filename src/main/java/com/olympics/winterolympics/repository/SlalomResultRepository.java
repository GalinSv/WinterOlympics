package com.olympics.winterolympics.repository;

import com.olympics.winterolympics.entity.SlalomResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SlalomResultRepository extends JpaRepository<SlalomResult, Long> {

    Optional<SlalomResult> findByRegistrationId(Long registrationId);

    List<SlalomResult> findByRegistrationCompetitionId(Long competitionId);
}
