package com.olympics.winterolympics.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BiathlonCompetitionDto extends CompetitionDto {

    @NotNull
    private Integer lapCount;

    @NotNull
    private Integer shootingRounds;

    @NotNull
    private Integer penaltySeconds;
}