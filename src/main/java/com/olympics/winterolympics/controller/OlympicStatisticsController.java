package com.olympics.winterolympics.controller;

import com.olympics.winterolympics.dto.ApiResponse;
import com.olympics.winterolympics.dto.OlympicStatisticsDto;
import com.olympics.winterolympics.service.MedalResultService;
import com.olympics.winterolympics.service.OlympicStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class OlympicStatisticsController {

    private final OlympicStatisticsService
            statisticsService;

    private final MedalResultService
            medalResultService;

    @PostMapping("/slalom-medals/{competitionId}")
    public ResponseEntity<ApiResponse<String>>
    assignSlalomMedals(
            @PathVariable Long competitionId) {

        medalResultService
                .assignSlalomMedals(competitionId);

        ApiResponse<String> response =
                new ApiResponse<>(
                        true,
                        null,
                        "Slalom medals assigned successfully"
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/biathlon-medals/{competitionId}")
    public ResponseEntity<ApiResponse<String>>
    assignBiathlonMedals(
            @PathVariable Long competitionId) {

        medalResultService
                .assignBiathlonMedals(competitionId);

        ApiResponse<String> response =
                new ApiResponse<>(
                        true,
                        null,
                        "Biathlon medals assigned successfully"
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<
            OlympicStatisticsDto>>
    getStatistics() {

        OlympicStatisticsDto statistics =
                statisticsService
                        .getStatistics();

        ApiResponse<OlympicStatisticsDto>
                response =
                new ApiResponse<>(
                        true,
                        statistics,
                        "Statistics retrieved successfully"
                );

        return ResponseEntity.ok(response);
    }
}