package com.olympics.winterolympics.controller;

import com.olympics.winterolympics.dto.ApiResponse;
import com.olympics.winterolympics.dto.BiathlonResultDto;
import com.olympics.winterolympics.service.BiathlonResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/biathlon-results")
@RequiredArgsConstructor
public class BiathlonResultController {

    private final BiathlonResultService
            biathlonResultService;

    @PostMapping
    public ResponseEntity<ApiResponse<
            BiathlonResultDto>>
    saveResult(

            @RequestParam Long registrationId,
            @RequestParam Double skiingTime,
            @RequestParam Integer missedShots,
            @RequestParam Boolean finished) {

        BiathlonResultDto result =
                biathlonResultService
                        .saveResult(
                                registrationId,
                                skiingTime,
                                missedShots,
                                finished
                        );

        ApiResponse<BiathlonResultDto>
                response =
                new ApiResponse<>(
                        true,
                        result,
                        "Biathlon result saved successfully"
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/ranking/{competitionId}")
    public ResponseEntity<ApiResponse<
            List<BiathlonResultDto>>>
    calculateRanking(
            @PathVariable Long competitionId) {

        List<BiathlonResultDto> ranking =
                biathlonResultService
                        .calculateRanking(
                                competitionId);

        ApiResponse<List<BiathlonResultDto>>
                response =
                new ApiResponse<>(
                        true,
                        ranking,
                        "Biathlon ranking calculated successfully"
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/demo/{competitionId}")
    public ResponseEntity<ApiResponse<
            List<BiathlonResultDto>>>
    generateDemoResults(
            @PathVariable Long competitionId) {

        List<BiathlonResultDto> results =
                biathlonResultService
                        .generateDemoResults(
                                competitionId);

        ApiResponse<List<BiathlonResultDto>>
                response =
                new ApiResponse<>(
                        true,
                        results,
                        "Demo biathlon results generated successfully"
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{competitionId}")
    public ResponseEntity<ApiResponse<
            List<BiathlonResultDto>>>
    getCompetitionResults(
            @PathVariable Long competitionId) {

        List<BiathlonResultDto> results =
                biathlonResultService
                        .getCompetitionResults(
                                competitionId);

        ApiResponse<List<BiathlonResultDto>>
                response =
                new ApiResponse<>(
                        true,
                        results,
                        "Biathlon results retrieved successfully"
                );

        return ResponseEntity.ok(response);
    }
}
