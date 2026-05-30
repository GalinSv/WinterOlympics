package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.OlympicStatisticsDto;

public interface OlympicStatisticsService {

    void assignSlalomMedals(Long competitionId);

    void assignBiathlonMedals(Long competitionId);

    OlympicStatisticsDto getStatistics();
}