package com.olympics.winterolympics.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompetitionRegistrationDto {

    @NotNull(message = "Athlete id is required")
    private Long athleteId;

    @NotNull(message = "Competition id is required")
    private Long competitionId;
}