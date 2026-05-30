package com.olympics.winterolympics.service.impl;

import com.olympics.winterolympics.dto.BiathlonResultDto;
import com.olympics.winterolympics.entity.BiathlonCompetition;
import com.olympics.winterolympics.entity.BiathlonResult;
import com.olympics.winterolympics.entity.CompetitionRegistration;
import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.exception.CompetitionLockedException;
import com.olympics.winterolympics.exception.ResourceNotFoundException;
import com.olympics.winterolympics.repository.BiathlonResultRepository;
import com.olympics.winterolympics.repository.CompetitionRegistrationRepository;
import com.olympics.winterolympics.service.BiathlonResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class BiathlonResultServiceImpl
        implements BiathlonResultService {

    private final BiathlonResultRepository
            biathlonResultRepository;

    private final CompetitionRegistrationRepository
            registrationRepository;

    @Override
    public BiathlonResultDto saveResult(
            Long registrationId,
            Double skiingTime,
            Integer missedShots,
            Boolean finished) {

        CompetitionRegistration registration =
                registrationRepository.findById(registrationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Registration not found"));

        if (registration.getCompetition().getStatus() == CompetitionStatus.FINISHED) {
            throw new CompetitionLockedException("Competition is finalized; results cannot be modified.");
        }

        BiathlonCompetition competition =
                (BiathlonCompetition)
                        registration.getCompetition();

        BiathlonResult result =
                new BiathlonResult();

        result.setRegistration(registration);
        result.setSkiingTime(skiingTime);
        result.setMissedShots(missedShots);
        result.setFinished(finished);

        double penaltySeconds =
                missedShots
                        * competition.getPenaltySeconds();

        result.setPenaltySeconds(
                penaltySeconds);

        result.setTotalTime(
                Boolean.TRUE.equals(finished)
                        ? skiingTime + penaltySeconds
                        : null);

        biathlonResultRepository.save(result);

        return mapToDto(result);
    }

    @Override
    public List<BiathlonResultDto> calculateRanking(
            Long competitionId) {

        List<BiathlonResult> rankedResults =
                biathlonResultRepository.findAll()
                        .stream()
                        .filter(result ->
                                result.getRegistration()
                                        .getCompetition()
                                        .getId()
                                        .equals(competitionId))
                        .filter(result ->
                                Boolean.TRUE.equals(
                                        result.getFinished()))
                        .sorted(Comparator.comparing(
                                BiathlonResult::getTotalTime))
                        .toList();

        for (int i = 0; i < rankedResults.size(); i++) {

            rankedResults.get(i)
                    .setFinalRank(i + 1);
        }

        biathlonResultRepository.saveAll(rankedResults);

        return rankedResults.stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<BiathlonResultDto> generateDemoResults(
            Long competitionId) {

        List<CompetitionRegistration> registrations =
                registrationRepository
                        .findByCompetitionId(competitionId);

        if (registrations.isEmpty()) {
            return List.of();
        }

        BiathlonCompetition competition =
                (BiathlonCompetition)
                        registrations.get(0).getCompetition();

        int maxMissedShots =
                competition.getShootingRounds() * 5;

        List<BiathlonResult> results =
                registrations.stream()
                        .map(registration -> {

                            BiathlonResult result =
                                    biathlonResultRepository
                                            .findByRegistrationId(
                                                    registration.getId())
                                            .orElseGet(
                                                    BiathlonResult::new);

                            boolean finished =
                                    randomChance(95);

                            int missedShots =
                                    ThreadLocalRandom.current()
                                            .nextInt(maxMissedShots + 1);

                            double skiingTime =
                                    randomTime(
                                            competition.getLapCount() * 210,
                                            competition.getLapCount() * 330);

                            double penaltySeconds =
                                    missedShots
                                            * competition
                                            .getPenaltySeconds();

                            result.setRegistration(registration);
                            result.setSkiingTime(skiingTime);
                            result.setMissedShots(missedShots);
                            result.setPenaltySeconds(
                                    penaltySeconds);
                            result.setFinished(finished);
                            result.setFinalRank(null);
                            result.setTotalTime(
                                    finished
                                            ? roundToMilliseconds(
                                            skiingTime + penaltySeconds)
                                            : null);

                            return result;
                        })
                        .toList();

        List<BiathlonResult> rankedResults =
                results.stream()
                        .filter(result ->
                                Boolean.TRUE.equals(
                                        result.getFinished()))
                        .filter(result ->
                                result.getTotalTime() != null)
                        .sorted(Comparator.comparing(
                                BiathlonResult::getTotalTime))
                        .toList();

        for (int i = 0; i < rankedResults.size(); i++) {
            rankedResults.get(i)
                    .setFinalRank(i + 1);
        }

        biathlonResultRepository.saveAll(results);

        return results.stream()
                .sorted(Comparator.comparing(
                        result -> result.getFinalRank() == null
                                ? Integer.MAX_VALUE
                                : result.getFinalRank()))
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<BiathlonResultDto> getCompetitionResults(
            Long competitionId) {

        return biathlonResultRepository.findAll()
                .stream()
                .filter(result ->
                        result.getRegistration()
                                .getCompetition()
                                .getId()
                                .equals(competitionId))
                .map(this::mapToDto)
                .toList();
    }

    private BiathlonResultDto mapToDto(
            BiathlonResult result) {

        BiathlonResultDto dto =
                new BiathlonResultDto();

        dto.setId(result.getId());

        dto.setRegistrationId(
                result.getRegistration().getId());

        dto.setAthleteName(
                result.getRegistration()
                        .getAthlete()
                        .getName());

        dto.setCountry(
                String.valueOf(result.getRegistration()
                        .getAthlete()
                        .getCountry()));

        dto.setSkiingTime(
                result.getSkiingTime());

        dto.setMissedShots(
                result.getMissedShots());

        dto.setPenaltySeconds(
                result.getPenaltySeconds());

        dto.setTotalTime(
                result.getTotalTime());

        dto.setFinalRank(
                result.getFinalRank());

        dto.setFinished(
                result.getFinished());

        return dto;
    }

    private boolean randomChance(int percent) {

        return ThreadLocalRandom.current()
                .nextInt(100) < percent;
    }

    private double randomTime(
            double minimum,
            double maximum) {

        double value =
                ThreadLocalRandom.current()
                        .nextDouble(minimum, maximum);

        return roundToMilliseconds(value);
    }

    private double roundToMilliseconds(double value) {

        return Math.round(value * 1000.0) / 1000.0;
    }
}
