package com.olympics.winterolympics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponseDto {

    private Long registrationId;

    private Long athleteId;

    private String athleteName;

    private String country;

    private Long competitionId;

    private String competitionName;

    private String status;
}
