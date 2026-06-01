package com.olympics.winterolympics.service.impl;

import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.entity.Competition;
import com.olympics.winterolympics.entity.BiathlonCompetition;
import com.olympics.winterolympics.entity.CompetitionRegistration;
import com.olympics.winterolympics.entity.SlalomCompetition;
import com.olympics.winterolympics.enums.RegistrationStatus;
import com.olympics.winterolympics.entity.exception.ResourceNotFoundException;
import com.olympics.winterolympics.repository.AthleteRepository;
import com.olympics.winterolympics.repository.CompetitionRegistrationRepository;
import com.olympics.winterolympics.repository.CompetitionRepository;
import com.olympics.winterolympics.service.BiathlonResultService;
import com.olympics.winterolympics.service.CompetitionService;
import com.olympics.winterolympics.service.DemoCompetitionService;
import com.olympics.winterolympics.service.SlalomResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemoCompetitionServiceImpl implements DemoCompetitionService {

    private final CompetitionRepository competitionRepository;
    private final AthleteRepository athleteRepository;
    private final CompetitionRegistrationRepository registrationRepository;
    private final SlalomResultService slalomResultService;
    private final BiathlonResultService biathlonResultService;
    private final CompetitionService competitionService;

    @Override
    @Transactional
    public void runSlalomDemo(Long competitionId) {
        SlalomCompetition c = (SlalomCompetition) loadAndCheck(competitionId);
        int target = Math.max(c.getSecondRunQualifiedCount() + 5, 12);
        registerEligible(c, target);
        slalomResultService.generateDemoResults(competitionId);
        competitionService.finalizeSlalomCompetition(competitionId);
    }

    @Override
    @Transactional
    public void runBiathlonDemo(Long competitionId) {
        BiathlonCompetition c = (BiathlonCompetition) loadAndCheck(competitionId);
        registerEligible(c, 12);
        biathlonResultService.generateDemoResults(competitionId);
        competitionService.finalizeBiathlonCompetition(competitionId);
    }

    private Competition loadAndCheck(Long id) {
        return competitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Competition not found"));
    }

    private void registerEligible(Competition c, int target) {
        List<Athlete> eligible = new ArrayList<>(
                athleteRepository.findByGender(c.getGender()).stream()
                        .filter(a -> a.getBirthDate() != null
                                && Period.between(a.getBirthDate(), LocalDate.now())
                                        .getYears() >= c.getMinimumAge())
                        .filter(a -> !registrationRepository
                                .existsByAthleteIdAndCompetitionId(a.getId(), c.getId()))
                        .toList());
        Collections.shuffle(eligible);
        eligible.stream().limit(target).forEach(a -> {
            CompetitionRegistration r = new CompetitionRegistration();
            r.setAthlete(a);
            r.setCompetition(c);
            r.setRegistrationDate(LocalDateTime.now());
            r.setStatus(RegistrationStatus.REGISTERED);
            registrationRepository.save(r);
        });
    }
}
