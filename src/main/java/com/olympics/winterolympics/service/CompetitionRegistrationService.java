package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.CompetitionRegistrationDto;
import com.olympics.winterolympics.dto.RegistrationResponseDto;

import java.util.List;

public interface CompetitionRegistrationService {

    void registerAthlete(CompetitionRegistrationDto dto);

    /** Registers up to {@code count} random eligible athletes (demo helper). */
    int fillRandomEligible(Long competitionId, int count);

    List<RegistrationResponseDto> getRegistrationsByCompetition(Long competitionId);

    List<RegistrationResponseDto> getRegistrationsByAthlete(Long athleteId);

    RegistrationResponseDto getRegistration(Long registrationId);

    void cancelRegistration(Long registrationId);
}
