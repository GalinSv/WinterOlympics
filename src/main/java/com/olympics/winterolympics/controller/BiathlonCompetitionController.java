package com.olympics.winterolympics.controller;

import com.olympics.winterolympics.dto.ApiResponse;
import com.olympics.winterolympics.dto.BiathlonCompetitionDto;
import com.olympics.winterolympics.service.CompetitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/biathlon-competitions")
@RequiredArgsConstructor
public class BiathlonCompetitionController {

    private final CompetitionService competitionService;

    @PostMapping
    public ResponseEntity<ApiResponse<BiathlonCompetitionDto>> create(
            @RequestBody @Valid BiathlonCompetitionDto dto) {
        return new ResponseEntity<>(new ApiResponse<>(true,
                competitionService.createBiathlonCompetition(dto),
                "Biathlon competition created successfully"),
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BiathlonCompetitionDto>>> all() {
        return ResponseEntity.ok(new ApiResponse<>(true,
                competitionService.getAllBiathlonCompetitions(),
                "Biathlon competitions retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BiathlonCompetitionDto>> byId(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                competitionService.getBiathlonCompetitionById(id),
                "Biathlon competition retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BiathlonCompetitionDto>> update(
            @PathVariable Long id, @RequestBody @Valid BiathlonCompetitionDto dto) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                competitionService.updateBiathlonCompetition(id, dto),
                "Biathlon competition updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        competitionService.deleteBiathlonCompetition(id);
        return ResponseEntity.ok(new ApiResponse<>(true, null,
                "Biathlon competition deleted successfully"));
    }

    @PostMapping("/{id}/finalize")
    public ResponseEntity<ApiResponse<String>> finalizeCompetition(@PathVariable Long id) {
        competitionService.finalizeBiathlonCompetition(id);
        return ResponseEntity.ok(new ApiResponse<>(true, null,
                "Biathlon competition finalized successfully"));
    }
}
