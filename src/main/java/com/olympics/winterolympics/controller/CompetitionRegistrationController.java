package com.olympics.winterolympics.controller;

import com.olympics.winterolympics.dto.ApiResponse;
import com.olympics.winterolympics.dto.CompetitionRegistrationDto;
import com.olympics.winterolympics.dto.RegistrationResponseDto;
import com.olympics.winterolympics.service.CompetitionRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class CompetitionRegistrationController {

    private final CompetitionRegistrationService registrationService;

    @PostMapping
    public ResponseEntity<ApiResponse<String>> registerAthlete(
            @RequestBody CompetitionRegistrationDto dto) {

        registrationService.registerAthlete(dto);

        return ResponseEntity.ok(new ApiResponse<>(
                true, null, "Registration created successfully"));
    }

    @GetMapping("/competition/{competitionId}")
    public ResponseEntity<ApiResponse<List<RegistrationResponseDto>>>
    getByCompetition(@PathVariable Long competitionId) {

        List<RegistrationResponseDto> regs =
                registrationService.getRegistrationsByCompetition(competitionId);

        return ResponseEntity.ok(new ApiResponse<>(
                true, regs, "Registrations retrieved successfully"));
    }

    @GetMapping("/athlete/{athleteId}")
    public ResponseEntity<ApiResponse<List<RegistrationResponseDto>>>
    getByAthlete(@PathVariable Long athleteId) {

        List<RegistrationResponseDto> regs =
                registrationService.getRegistrationsByAthlete(athleteId);

        return ResponseEntity.ok(new ApiResponse<>(
                true, regs, "Registrations retrieved successfully"));
    }

    @DeleteMapping("/{registrationId}")
    public ResponseEntity<ApiResponse<String>> cancel(
            @PathVariable Long registrationId) {

        registrationService.cancelRegistration(registrationId);

        return ResponseEntity.ok(new ApiResponse<>(
                true, null, "Registration cancelled"));
    }
}
