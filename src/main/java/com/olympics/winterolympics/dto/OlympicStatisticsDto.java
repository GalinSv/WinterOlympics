package com.olympics.winterolympics.dto;

import lombok.Data;

import java.util.Map;

@Data
public class OlympicStatisticsDto {

    private Map<String, Long> medalsByCountry;

    private long totalGold;

    private long totalSilver;

    private long totalBronze;

    private Double averageAthleteAge;

    private String youngestMedalist;

    private Integer youngestMedalistAge;

    private String oldestMedalist;

    private Integer oldestMedalistAge;
}
