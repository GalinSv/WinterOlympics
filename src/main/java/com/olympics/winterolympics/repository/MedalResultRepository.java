package com.olympics.winterolympics.repository;

import com.olympics.winterolympics.entity.MedalResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedalResultRepository
        extends JpaRepository<MedalResult, Long> {

    List<MedalResult> findByCompetitionId(Long competitionId);

    void deleteByCompetitionId(Long competitionId);
}
