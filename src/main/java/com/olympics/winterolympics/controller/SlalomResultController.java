package com.olympics.winterolympics.controller;

import com.olympics.winterolympics.dto.ApiResponse;
import com.olympics.winterolympics.dto.SlalomResultDto;
import com.olympics.winterolympics.service.SlalomResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slalom-results")
@RequiredArgsConstructor
public class SlalomResultController {

    private final SlalomResultService
            slalomResultService;

    @PostMapping("/first-run")
    public ResponseEntity<ApiResponse<
            SlalomResultDto>>
    saveFirstRunTime(

            @RequestParam Long registrationId,
            @RequestParam Double firstRunTime,
            @RequestParam Boolean finished) {

        SlalomResultDto result =
                slalomResultService
                        .saveFirstRunTime(
                                registrationId,
                                firstRunTime,
                                finished
                        );

        ApiResponse<SlalomResultDto>
                response =
                new ApiResponse<>(
                        true,
                        result,
                        "First run time saved successfully"
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/qualifications/{competitionId}")
    public ResponseEntity<ApiResponse<
            List<SlalomResultDto>>>
    calculateQualifiedAthletes(
            @PathVariable Long competitionId) {

        List<SlalomResultDto> results =
                slalomResultService
                        .calculateQualifiedAthletes(
                                competitionId);

        ApiResponse<List<SlalomResultDto>>
                response =
                new ApiResponse<>(
                        true,
                        results,
                        "Qualified athletes calculated successfully"
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/second-run")
    public ResponseEntity<ApiResponse<
            SlalomResultDto>>
    saveSecondRunTime(

            @RequestParam Long registrationId,
            @RequestParam Double secondRunTime,
            @RequestParam Boolean finished) {

        SlalomResultDto result =
                slalomResultService
                        .saveSecondRunTime(
                                registrationId,
                                secondRunTime,
                                finished
                        );

        ApiResponse<SlalomResultDto>
                response =
                new ApiResponse<>(
                        true,
                        result,
                        "Second run time saved successfully"
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/ranking/{competitionId}")
    public ResponseEntity<ApiResponse<
            List<SlalomResultDto>>>
    calculateFinalRanking(
            @PathVariable Long competitionId) {

        List<SlalomResultDto> ranking =
                slalomResultService
                        .calculateFinalRanking(
                                competitionId);

        ApiResponse<List<SlalomResultDto>>
                response =
                new ApiResponse<>(
                        true,
                        ranking,
                        "Final ranking calculated successfully"
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/demo/{competitionId}")
    public ResponseEntity<ApiResponse<
            List<SlalomResultDto>>>
    generateDemoResults(
            @PathVariable Long competitionId) {

        List<SlalomResultDto> results =
                slalomResultService
                        .generateDemoResults(
                                competitionId);

        ApiResponse<List<SlalomResultDto>>
                response =
                new ApiResponse<>(
                        true,
                        results,
                        "Demo slalom results generated successfully"
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{competitionId}")
    public ResponseEntity<ApiResponse<
            List<SlalomResultDto>>>
    getCompetitionResults(
            @PathVariable Long competitionId) {

        List<SlalomResultDto> results =
                slalomResultService
                        .getCompetitionResults(
                                competitionId);

        ApiResponse<List<SlalomResultDto>>
                response =
                new ApiResponse<>(
                        true,
                        results,
                        "Competition results retrieved successfully"
                );

        return ResponseEntity.ok(response);
    }
}
