package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.AthleteDto;

import java.util.List;

public interface AthleteService {

    AthleteDto createAthlete(AthleteDto athleteDto);

    List<AthleteDto> getAllAthletes();

    List<AthleteDto> searchAthletesByName(String query);

    AthleteDto getAthleteById(Long id);

    AthleteDto getAthleteByUsername(String username);

    /** Returns the athlete profile for the Keycloak user, creating a skeleton one on first login. */
    AthleteDto getOrCreateCurrentAthlete(String username, String name, String email);

    AthleteDto updateAthlete(Long id, AthleteDto athleteDto);

    AthleteDto updateOwnProfile(String username, AthleteDto athleteDto);

    void deleteAthlete(Long id);
}
