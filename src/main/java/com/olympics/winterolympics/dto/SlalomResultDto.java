package com.olympics.winterolympics.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SlalomResultDto {

    private Long id;

    @NotNull
    private Long registrationId;

    private String athleteName;

    private String country;

    private Double firstRunTime;

    private Double secondRunTime;

    private Double totalTime;

    private Integer finalRank;

    private Boolean qualifiedForSecondRun;

    private Integer secondRunStartOrder;

    private Boolean finished;
}
