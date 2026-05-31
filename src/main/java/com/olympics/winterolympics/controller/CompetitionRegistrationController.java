package com.olympics.winterolympics.controller;

import com.olympics.winterolympics.dto.ApiResponse;
import com.olympics.winterolympics.dto.AthleteDto;
import com.olympics.winterolympics.dto.CompetitionRegistrationDto;
import com.olympics.winterolympics.dto.RegistrationResponseDto;
import com.olympics.winterolympics.service.AthleteService;
import com.olympics.winterolympics.service.CompetitionRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class CompetitionRegistrationController {

    private final CompetitionRegistrationService registrationService;
    private final AthleteService athleteService;

    @PostMapping
    public ResponseEntity<ApiResponse<String>> registerAthlete(
            @Valid @RequestBody CompetitionRegistrationDto dto,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            AthleteDto self = athleteService.getAthleteByUsername(authentication.getName());
            if (!self.getId().equals(dto.getAthleteId())) {
                throw new AccessDeniedException(
                        "You can only register yourself for a competition.");
            }
        }

        registrationService.registerAthlete(dto);

        return ResponseEntity.ok(new ApiResponse<>(
                true, null, "Registration created successfully"));
    }

    @PostMapping("/fill/{competitionId}")
    public ResponseEntity<ApiResponse<String>> fillRandom(
            @PathVariable Long competitionId,
            @RequestParam(defaultValue = "16") int count,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            throw new AccessDeniedException("Only administrators can auto-fill participants.");
        }

        int added = registrationService.fillRandomEligible(competitionId, count);
        return ResponseEntity.ok(new ApiResponse<>(
                true, null, added + " random athletes added."));
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
            @PathVariable Long registrationId,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            RegistrationResponseDto registration =
                    registrationService.getRegistration(registrationId);
            AthleteDto self = athleteService.getAthleteByUsername(authentication.getName());
            if (!self.getId().equals(registration.getAthleteId())) {
                throw new AccessDeniedException(
                        "You can only cancel your own registration.");
            }
        }

        registrationService.cancelRegistration(registrationId);

        return ResponseEntity.ok(new ApiResponse<>(
                true, null, "Registration cancelled"));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }
}
