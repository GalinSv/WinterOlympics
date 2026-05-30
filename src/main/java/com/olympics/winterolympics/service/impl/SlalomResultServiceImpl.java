package com.olympics.winterolympics.service.impl;

import com.olympics.winterolympics.dto.SlalomResultDto;
import com.olympics.winterolympics.entity.CompetitionRegistration;
import com.olympics.winterolympics.entity.SlalomCompetition;
import com.olympics.winterolympics.entity.SlalomResult;
import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.exception.CompetitionLockedException;
import com.olympics.winterolympics.exception.ResourceNotFoundException;
import com.olympics.winterolympics.repository.CompetitionRegistrationRepository;
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

        SlalomResult result = new SlalomResult();

        result.setRegistration(registration);
        result.setFirstRunTime(firstRunTime);
        result.setFinished(finished);

        slalomResultRepository.save(result);

        return mapToDto(result);
    }

    @Override
    public List<SlalomResultDto> calculateQualifiedAthletes(
            Long competitionId) {

        List<SlalomResult> qualifiedResults =
                slalomResultRepository.findAll()
                        .stream()
                        .filter(result ->
                                result.getRegistration()
                                        .getCompetition()
                                        .getId()
                                        .equals(competitionId))
                        .filter(SlalomResult::getFinished)
                        .sorted(Comparator.comparing(
                                SlalomResult::getFirstRunTime))
                        .toList();

        SlalomCompetition competition =
                (SlalomCompetition)
                        qualifiedResults.get(0)
                                .getRegistration()
                                .getCompetition();

        int qualifiedCount =
                competition.getSecondRunQualifiedCount();

        List<SlalomResult> finalQualified =
                qualifiedResults.stream()
                        .limit(qualifiedCount)
                        .toList();

        finalQualified.forEach(result ->
                result.setQualifiedForSecondRun(true));

        slalomResultRepository.saveAll(finalQualified);

        return finalQualified.stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public SlalomResultDto saveSecondRunTime(
            Long registrationId,
            Double secondRunTime,
            Boolean finished) {

        SlalomResult result =
                slalomResultRepository.findAll()
                        .stream()
                        .filter(r ->
                                r.getRegistration()
                                        .getId()
                                        .equals(registrationId))
                        .findFirst()
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Result not found"));

        if (result.getRegistration().getCompetition().getStatus() == CompetitionStatus.FINISHED) {
            throw new CompetitionLockedException("Competition is finalized; results cannot be modified.");
        }

        result.setSecondRunTime(secondRunTime);
        result.setFinished(finished);

        if (finished &&
                result.getFirstRunTime() != null &&
                secondRunTime != null) {

            result.setTotalTime(
                    result.getFirstRunTime()
                            + secondRunTime);
        } else {
            result.setTotalTime(null);
        }

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
                    randomTime(48, 86));
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
                        randomTime(48, 86));
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
}
