package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.SlalomResultDto;

import java.util.List;

public interface SlalomResultService {

    SlalomResultDto saveFirstRunTime(
            Long registrationId,
            Double firstRunTime,
            Boolean finished);

    List<SlalomResultDto> calculateQualifiedAthletes(
            Long competitionId);

    SlalomResultDto saveSecondRunTime(
            Long registrationId,
            Double secondRunTime,
            Boolean finished);

    List<SlalomResultDto> calculateFinalRanking(
            Long competitionId);

    List<SlalomResultDto> generateDemoResults(
            Long competitionId);

    List<SlalomResultDto> getCompetitionResults(
            Long competitionId);
}
