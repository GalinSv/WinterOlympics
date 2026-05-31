package com.olympics.winterolympics.service.impl;

import com.olympics.winterolympics.dto.SlalomResultDto;
import com.olympics.winterolympics.entity.Competition;
import com.olympics.winterolympics.entity.CompetitionRegistration;
import com.olympics.winterolympics.entity.SlalomCompetition;
import com.olympics.winterolympics.entity.SlalomResult;
import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.exception.CompetitionLockedException;
import com.olympics.winterolympics.exception.ResourceNotFoundException;
import com.olympics.winterolympics.repository.CompetitionRegistrationRepository;
import com.olympics.winterolympics.repository.CompetitionRepository;
import com.olympics.winterolympics.repository.SlalomResultRepository;
import com.olympics.winterolympics.service.SlalomResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class SlalomResultServiceImpl
        implements SlalomResultService {

    private final SlalomResultRepository slalomResultRepository;

    private final CompetitionRegistrationRepository
            registrationRepository;

    private final CompetitionRepository competitionRepository;

    @Override
    public SlalomResultDto saveFirstRunTime(
            Long registrationId,
            Double firstRunTime,
            Boolean finished) {

        CompetitionRegistration registration =
                registrationRepository.findById(registrationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Registration not found"));

        if (registration.getCompetition().getStatus() == CompetitionStatus.FINISHED) {
            throw new CompetitionLockedException("Competition is finalized; results cannot be modified.");
        }

        activate(registration.getCompetition());

        SlalomResult result =
                slalomResultRepository
                        .findByRegistrationId(registrationId)
                        .orElseGet(SlalomResult::new);

        result.setRegistration(registration);
        result.setFirstRunTime(roundOrNull(firstRunTime));
        result.setFinished(finished);
        recomputeTotalTime(result);

        slalomResultRepository.save(result);

        return mapToDto(result);
    }

    @Override
    public List<SlalomResultDto> calculateQualifiedAthletes(
            Long competitionId) {

        List<SlalomResult> results =
                slalomResultRepository
                        .findByRegistrationCompetitionId(competitionId);

        if (results.isEmpty()) {
            return List.of();
        }

        SlalomCompetition competition =
                (SlalomCompetition)
                        results.get(0)
                                .getRegistration()
                                .getCompetition();

        // Recalculate from scratch so the operation is repeatable.
        results.forEach(result -> {
            result.setQualifiedForSecondRun(false);
            result.setSecondRunStartOrder(null);
        });

        List<SlalomResult> firstRunFinishers =
                results.stream()
                        .filter(result ->
                                Boolean.TRUE.equals(result.getFinished()))
                        .filter(result ->
                                result.getFirstRunTime() != null)
                        .sorted(Comparator.comparing(
                                SlalomResult::getFirstRunTime))
                        .toList();

        int qualifiedCount =
                competition.getSecondRunQualifiedCount() == null
                        ? firstRunFinishers.size()
                        : Math.max(competition.getSecondRunQualifiedCount(), 0);

        List<SlalomResult> qualified =
                firstRunFinishers.stream()
                        .limit(qualifiedCount)
                        .toList();

        // Second-run start order: the slowest qualifier from run one starts first.
        List<SlalomResult> startOrder =
                qualified.stream()
                        .sorted(Comparator.comparing(
                                SlalomResult::getFirstRunTime).reversed())
                        .toList();

        for (int i = 0; i < startOrder.size(); i++) {
            SlalomResult result = startOrder.get(i);
            result.setQualifiedForSecondRun(true);
            result.setSecondRunStartOrder(i + 1);
        }

        slalomResultRepository.saveAll(results);

        return startOrder.stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public SlalomResultDto saveSecondRunTime(
            Long registrationId,
            Double secondRunTime,
            Boolean finished) {

        SlalomResult result =
                slalomResultRepository
                        .findByRegistrationId(registrationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Result not found"));

        if (result.getRegistration().getCompetition().getStatus() == CompetitionStatus.FINISHED) {
            throw new CompetitionLockedException("Competition is finalized; results cannot be modified.");
        }

        activate(result.getRegistration().getCompetition());

        result.setSecondRunTime(roundOrNull(secondRunTime));
        result.setFinished(finished);
        recomputeTotalTime(result);

        slalomResultRepository.save(result);

        return mapToDto(result);
    }

    @Override
    public List<SlalomResultDto> calculateFinalRanking(
            Long competitionId) {

        List<SlalomResult> rankedResults =
                slalomResultRepository.findAll()
                        .stream()
                        .filter(result ->
                                result.getRegistration()
                                        .getCompetition()
                                        .getId()
                                        .equals(competitionId))
                        .filter(result ->
                                Boolean.TRUE.equals(
                                        result.getFinished()))
                        .filter(result ->
                                result.getTotalTime() != null)
                        .sorted(Comparator.comparing(
                                SlalomResult::getTotalTime))
                        .toList();

        for (int i = 0; i < rankedResults.size(); i++) {

            rankedResults.get(i)
                    .setFinalRank(i + 1);
        }

        slalomResultRepository.saveAll(rankedResults);

        return rankedResults.stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<SlalomResultDto> generateDemoResults(
            Long competitionId) {

        List<CompetitionRegistration> registrations =
                registrationRepository
                        .findByCompetitionId(competitionId);

        if (registrations.isEmpty()) {
            return List.of();
        }

        SlalomCompetition competition =
                (SlalomCompetition)
                        registrations.get(0).getCompetition();

        List<SlalomResult> results =
                new ArrayList<>();

        for (CompetitionRegistration registration : registrations) {

            SlalomResult result =
                    slalomResultRepository
                            .findByRegistrationId(
                                    registration.getId())
                            .orElseGet(SlalomResult::new);

            result.setRegistration(registration);
            result.setFirstRunTime(
                    randomTime(45, 90));
            result.setSecondRunTime(null);
            result.setTotalTime(null);
            result.setFinalRank(null);
            result.setSecondRunStartOrder(null);
            result.setQualifiedForSecondRun(false);
            result.setFinished(
                    randomChance(95));

            results.add(result);
        }

        List<SlalomResult> firstRunFinishers =
                results.stream()
                        .filter(result ->
                                Boolean.TRUE.equals(
                                        result.getFinished()))
                        .sorted(Comparator.comparing(
                                SlalomResult::getFirstRunTime))
                        .toList();

        List<SlalomResult> qualified =
                firstRunFinishers.stream()
                        .limit(competition
                                .getSecondRunQualifiedCount())
                        .toList();

        List<SlalomResult> secondRunStartOrder =
                qualified.stream()
                        .sorted(Comparator.comparing(
                                SlalomResult::getFirstRunTime)
                                .reversed())
                        .toList();

        for (int i = 0; i < secondRunStartOrder.size(); i++) {

            SlalomResult result =
                    secondRunStartOrder.get(i);

            result.setQualifiedForSecondRun(true);
            result.setSecondRunStartOrder(i + 1);

            boolean secondRunFinished =
                    randomChance(95);

            result.setFinished(secondRunFinished);

            if (secondRunFinished) {
                result.setSecondRunTime(
                        randomTime(45, 90));
                result.setTotalTime(
                        roundToMilliseconds(
                                result.getFirstRunTime()
                                        + result.getSecondRunTime()));
            }
        }

        List<SlalomResult> rankedResults =
                qualified.stream()
                        .filter(result ->
                                Boolean.TRUE.equals(
                                        result.getFinished()))
                        .filter(result ->
                                result.getTotalTime() != null)
                        .sorted(Comparator.comparing(
                                SlalomResult::getTotalTime))
                        .toList();

        for (int i = 0; i < rankedResults.size(); i++) {
            rankedResults.get(i)
                    .setFinalRank(i + 1);
        }

        slalomResultRepository.saveAll(results);

        return results.stream()
                .sorted(Comparator.comparing(
                        result -> result.getFinalRank() == null
                                ? Integer.MAX_VALUE
                                : result.getFinalRank()))
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<SlalomResultDto> getCompetitionResults(
            Long competitionId) {

        return slalomResultRepository.findAll()
                .stream()
                .filter(result ->
                        result.getRegistration()
                                .getCompetition()
                                .getId()
                                .equals(competitionId))
                .map(this::mapToDto)
                .toList();
    }

    private SlalomResultDto mapToDto(
            SlalomResult result) {

        SlalomResultDto dto =
                new SlalomResultDto();

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

        dto.setFirstRunTime(
                result.getFirstRunTime());

        dto.setSecondRunTime(
                result.getSecondRunTime());

        dto.setTotalTime(
                result.getTotalTime());

        dto.setFinalRank(
                result.getFinalRank());

        dto.setQualifiedForSecondRun(
                result.getQualifiedForSecondRun());

        dto.setSecondRunStartOrder(
                result.getSecondRunStartOrder());

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

    private Double roundOrNull(Double value) {

        return value == null
                ? null
                : roundToMilliseconds(value);
    }

    private void activate(Competition competition) {
        if (competition.getStatus() == CompetitionStatus.DRAFT) {
            competition.setStatus(CompetitionStatus.ACTIVE);
            competitionRepository.save(competition);
        }
    }

    private void recomputeTotalTime(SlalomResult result) {

        if (Boolean.TRUE.equals(result.getFinished())
                && result.getFirstRunTime() != null
                && result.getSecondRunTime() != null) {

            result.setTotalTime(
                    roundToMilliseconds(
                            result.getFirstRunTime()
                                    + result.getSecondRunTime()));
        } else {
            result.setTotalTime(null);
        }
    }
}
