package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.AthleteDto;

import java.util.List;

public interface AthleteService {

    AthleteDto createAthlete(AthleteDto athleteDto);

    List<AthleteDto> getAllAthletes();

    List<AthleteDto> searchAthletesByName(String query);

    AthleteDto getAthleteById(Long id);

    AthleteDto getAthleteByUsername(String username);

    AthleteDto updateAthlete(Long id, AthleteDto athleteDto);

    AthleteDto updateOwnProfile(String username, AthleteDto athleteDto);

    void deleteAthlete(Long id);
}
