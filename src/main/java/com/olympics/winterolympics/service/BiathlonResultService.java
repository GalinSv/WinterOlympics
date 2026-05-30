package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.BiathlonResultDto;

import java.util.List;

public interface BiathlonResultService {

    BiathlonResultDto saveResult(
            Long registrationId,
            Double skiingTime,
            Integer missedShots,
            Boolean finished);

    List<BiathlonResultDto> calculateRanking(
            Long competitionId);

    List<BiathlonResultDto> generateDemoResults(
            Long competitionId);

    List<BiathlonResultDto> getCompetitionResults(
            Long competitionId);
}
