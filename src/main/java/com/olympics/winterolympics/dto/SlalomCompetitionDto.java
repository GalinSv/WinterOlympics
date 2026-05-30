package com.olympics.winterolympics.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SlalomCompetitionDto extends CompetitionDto {

    @NotNull
    private Integer secondRunQualifiedCount;
}