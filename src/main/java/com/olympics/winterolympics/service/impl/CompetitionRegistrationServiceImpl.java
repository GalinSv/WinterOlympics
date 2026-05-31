package com.olympics.winterolympics.service.impl;

import com.olympics.winterolympics.dto.CompetitionRegistrationDto;
import com.olympics.winterolympics.dto.RegistrationResponseDto;
import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.entity.Competition;
import com.olympics.winterolympics.entity.CompetitionRegistration;
import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.enums.RegistrationStatus;
import com.olympics.winterolympics.exception.CompetitionLockedException;
import com.olympics.winterolympics.exception.DuplicateRegistrationException;
import com.olympics.winterolympics.exception.InvalidCompetitionException;
import com.olympics.winterolympics.exception.ResourceNotFoundException;
import com.olympics.winterolympics.repository.AthleteRepository;
import com.olympics.winterolympics.repository.CompetitionRegistrationRepository;
import com.olympics.winterolympics.repository.CompetitionRepository;
import com.olympics.winterolympics.service.CompetitionRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompetitionRegistrationServiceImpl implements CompetitionRegistrationService {

    private final AthleteRepository athleteRepository;
    private final CompetitionRepository competitionRepository;
    private final CompetitionRegistrationRepository registrationRepository;

    @Override
    public void registerAthlete(CompetitionRegistrationDto dto) {

        Athlete athlete = athleteRepository.findById(dto.getAthleteId())
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));

        Competition competition = competitionRepository.findById(dto.getCompetitionId())
                .orElseThrow(() -> new ResourceNotFoundException("Competition not found"));

        if (competition.getStatus() == CompetitionStatus.FINISHED) {
            throw new CompetitionLockedException(
                    "Competition is finalized; registrations are closed.");
        }

        if (registrationRepository.existsByAthleteIdAndCompetitionId(
                athlete.getId(), competition.getId())) {
            throw new DuplicateRegistrationException(
                    "Athlete is already registered for this competition.");
        }

        if (athlete.getGender() != competition.getGender()) {
            throw new InvalidCompetitionException(
                    "Athlete gender does not match competition gender.");
        }

        int athleteAge = Period.between(athlete.getBirthDate(), LocalDate.now()).getYears();
        if (athleteAge < competition.getMinimumAge()) {
            throw new InvalidCompetitionException(
                    "Athlete does not meet minimum age requirement ("
                            + competition.getMinimumAge() + ").");
        }

        CompetitionRegistration registration = new CompetitionRegistration();
        registration.setAthlete(athlete);
        registration.setCompetition(competition);
        registration.setRegistrationDate(LocalDateTime.now());
        registration.setStatus(RegistrationStatus.REGISTERED);
        registrationRepository.save(registration);
    }

    @Override
    public List<RegistrationResponseDto> getRegistrationsByCompetition(Long competitionId) {
        return registrationRepository.findByCompetitionId(competitionId).stream()
                .map(this::toDto).toList();
    }

    @Override
    public List<RegistrationResponseDto> getRegistrationsByAthlete(Long athleteId) {
        return registrationRepository.findAll().stream()
                .filter(r -> r.getAthlete() != null && athleteId.equals(r.getAthlete().getId()))
                .map(this::toDto).toList();
    }

    @Override
    public RegistrationResponseDto getRegistration(Long registrationId) {
        CompetitionRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        return toDto(registration);
    }

    @Override
    public void cancelRegistration(Long registrationId) {
        CompetitionRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        if (registration.getCompetition() != null
                && registration.getCompetition().getStatus() == CompetitionStatus.FINISHED) {
            throw new CompetitionLockedException(
                    "Competition is finalized; registrations cannot be cancelled.");
        }
        registrationRepository.delete(registration);
    }

    private RegistrationResponseDto toDto(CompetitionRegistration r) {
        Athlete a = r.getAthlete();
        Competition c = r.getCompetition();
        return new RegistrationResponseDto(
                r.getId(),
                a != null ? a.getId() : null,
                a != null ? a.getName() : null,
                a != null && a.getCountry() != null ? a.getCountry().name() : null,
                c != null ? c.getId() : null,
                c != null ? c.getName() : null,
                r.getStatus() != null ? r.getStatus().name() : null
        );
    }
}
