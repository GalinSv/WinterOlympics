package com.olympics.winterolympics.controller;

import com.olympics.winterolympics.dto.ApiResponse;
import com.olympics.winterolympics.service.DemoCompetitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoCompetitionController {

    private final DemoCompetitionService demoService;

    @PostMapping("/slalom/{id}")
    public ResponseEntity<ApiResponse<String>> slalom(@PathVariable Long id) {
        demoService.runSlalomDemo(id);
        return ResponseEntity.ok(new ApiResponse<>(true, null,
                "Slalom demo completed and competition finalized."));
    }

    @PostMapping("/biathlon/{id}")
    public ResponseEntity<ApiResponse<String>> biathlon(@PathVariable Long id) {
        demoService.runBiathlonDemo(id);
        return ResponseEntity.ok(new ApiResponse<>(true, null,
                "Biathlon demo completed and competition finalized."));
    }
}
