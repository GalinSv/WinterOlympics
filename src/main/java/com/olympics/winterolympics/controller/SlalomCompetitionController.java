package com.olympics.winterolympics.controller;

import com.olympics.winterolympics.dto.ApiResponse;
import com.olympics.winterolympics.dto.SlalomCompetitionDto;
import com.olympics.winterolympics.service.CompetitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slalom-competitions")
@RequiredArgsConstructor
public class SlalomCompetitionController {

    private final CompetitionService competitionService;

    @PostMapping
    public ResponseEntity<ApiResponse<SlalomCompetitionDto>> create(
            @RequestBody @Valid SlalomCompetitionDto dto) {
        return new ResponseEntity<>(new ApiResponse<>(true,
                competitionService.createSlalomCompetition(dto),
                "Slalom competition created successfully"),
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SlalomCompetitionDto>>> all() {
        return ResponseEntity.ok(new ApiResponse<>(true,
                competitionService.getAllSlalomCompetitions(),
                "Slalom competitions retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SlalomCompetitionDto>> byId(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                competitionService.getSlalomCompetitionById(id),
                "Slalom competition retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SlalomCompetitionDto>> update(
            @PathVariable Long id, @RequestBody @Valid SlalomCompetitionDto dto) {
        return ResponseEntity.ok(new ApiResponse<>(true,
                competitionService.updateSlalomCompetition(id, dto),
                "Slalom competition updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        competitionService.deleteSlalomCompetition(id);
        return ResponseEntity.ok(new ApiResponse<>(true, null,
                "Slalom competition deleted successfully"));
    }

    @PostMapping("/{id}/finalize")
    public ResponseEntity<ApiResponse<String>> finalizeCompetition(@PathVariable Long id) {
        competitionService.finalizeSlalomCompetition(id);
        return ResponseEntity.ok(new ApiResponse<>(true, null,
                "Slalom competition finalized successfully"));
    }
}
