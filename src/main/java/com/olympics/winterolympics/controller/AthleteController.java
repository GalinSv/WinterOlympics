package com.olympics.winterolympics.controller;

import com.olympics.winterolympics.dto.AthleteDto;
import com.olympics.winterolympics.exception.InvalidCompetitionException;
import com.olympics.winterolympics.service.AthleteService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/athletes")
@RequiredArgsConstructor
public class AthleteController {

    private final AthleteService athleteService;

    @PostMapping
    public AthleteDto createAthlete(@Valid @RequestBody AthleteDto athleteDto) {
        return athleteService.createAthlete(athleteDto);
    }

    @GetMapping
    public List<AthleteDto> getAllAthletes(
            @RequestParam(value = "search", required = false) String search) {

        if (search != null && !search.isBlank()) {
            return athleteService.searchAthletesByName(search);
        }
        return athleteService.getAllAthletes();
    }

    @GetMapping("/search")
    public List<AthleteDto> searchAthletes(
            @RequestParam(value = "name", required = false) String name) {
        return athleteService.searchAthletesByName(name);
    }

    @GetMapping("/me")
    public AthleteDto getCurrentAthlete(@AuthenticationPrincipal Jwt jwt) {
        return athleteService.getOrCreateCurrentAthlete(
                jwt.getClaimAsString("preferred_username"),
                fullName(jwt),
                jwt.getClaimAsString("email"));
    }

    @PutMapping("/me")
    public AthleteDto updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AthleteDto athleteDto) {
        return athleteService.updateOwnProfile(
                jwt.getClaimAsString("preferred_username"), athleteDto);
    }

    private String fullName(Jwt jwt) {
        String given = jwt.getClaimAsString("given_name");
        String family = jwt.getClaimAsString("family_name");
        if (given != null || family != null) {
            return ((given == null ? "" : given) + " "
                    + (family == null ? "" : family)).trim();
        }
        String name = jwt.getClaimAsString("name");
        return name != null ? name : jwt.getClaimAsString("preferred_username");
    }

    @GetMapping("/{id}")
    public AthleteDto getAthleteById(@PathVariable Long id) {
        return athleteService.getAthleteById(id);
    }

    @PutMapping("/{id}")
    public AthleteDto updateAthlete(@PathVariable Long id,
                                    @Valid @RequestBody AthleteDto athleteDto,
                                    Authentication authentication) {

        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);

        if (!isAdmin) {
            AthleteDto self = athleteService.getAthleteByUsername(
                    authentication.getName());
            if (!self.getId().equals(id)) {
                throw new AccessDeniedException("You can only edit your own profile");
            }
        }

        return athleteService.updateAthlete(id, athleteDto);
    }

    @DeleteMapping("/{id}")
    public void deleteAthlete(@PathVariable Long id,
                             Authentication authentication) {

        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);

        if (!isAdmin) {
            AthleteDto self = athleteService.getAthleteByUsername(
                    authentication.getName());
            if (!self.getId().equals(id)) {
                throw new AccessDeniedException("You can only delete your own profile");
            }
        }

        athleteService.deleteAthlete(id);
    }
}
