package com.olympics.winterolympics.dto;

import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompetitionDto {

    private Long id;

    @NotBlank
    private String name;

    @NotNull
    private LocalDate date;

    @NotNull
    private Gender gender;

    @NotNull
    private Integer minimumAge;

    private CompetitionStatus status;
}
