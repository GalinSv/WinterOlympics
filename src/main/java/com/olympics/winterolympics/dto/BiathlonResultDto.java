package com.olympics.winterolympics.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BiathlonResultDto {

    private Long id;

    @NotNull
    private Long registrationId;

    private String athleteName;

    private String country;

    private Double skiingTime;

    private Integer missedShots;

    private Double penaltySeconds;

    private Double totalTime;

    private Integer finalRank;

    private Boolean finished;
}
