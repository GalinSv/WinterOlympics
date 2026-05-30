package com.olympics.winterolympics.repository;

import com.olympics.winterolympics.entity.Competition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {
}