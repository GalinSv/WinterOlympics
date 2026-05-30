package com.olympics.winterolympics.repository;

import com.olympics.winterolympics.entity.CompetitionRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompetitionRegistrationRepository
        extends JpaRepository<CompetitionRegistration, Long> {

    boolean existsByAthleteIdAndCompetitionId(Long athleteId,
                                              Long competitionId);

    List<CompetitionRegistration> findByCompetitionId(Long competitionId);
}
