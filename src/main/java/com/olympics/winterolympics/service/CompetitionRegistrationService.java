package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.CompetitionRegistrationDto;
import com.olympics.winterolympics.dto.RegistrationResponseDto;

import java.util.List;

public interface CompetitionRegistrationService {

    void registerAthlete(CompetitionRegistrationDto dto);

    List<RegistrationResponseDto> getRegistrationsByCompetition(Long competitionId);

    List<RegistrationResponseDto> getRegistrationsByAthlete(Long athleteId);

    void cancelRegistration(Long registrationId);
}
