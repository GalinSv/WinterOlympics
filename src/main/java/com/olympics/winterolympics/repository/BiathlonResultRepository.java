package com.olympics.winterolympics.repository;

import com.olympics.winterolympics.entity.BiathlonResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BiathlonResultRepository
        extends JpaRepository<BiathlonResult, Long> {

    Optional<BiathlonResult> findByRegistrationId(Long registrationId);

    List<BiathlonResult> findByRegistrationCompetitionId(Long competitionId);
}
