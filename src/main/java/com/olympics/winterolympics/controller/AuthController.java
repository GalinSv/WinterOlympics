package com.olympics.winterolympics.controller;

import com.olympics.winterolympics.dto.ApiResponse;
import com.olympics.winterolympics.dto.AuthResponseDto;
import com.olympics.winterolympics.dto.LoginRequestDto;
import com.olympics.winterolympics.dto.RegisterRequestDto;
import com.olympics.winterolympics.dto.RegisterResponseDto;
import com.olympics.winterolympics.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(
            @Valid @RequestBody LoginRequestDto request) {

        AuthResponseDto authResponse =
                authService.login(request);

        ApiResponse<AuthResponseDto> response =
                new ApiResponse<>(
                        true,
                        authResponse,
                        "Login completed successfully"
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponseDto>> register(
            @Valid @RequestBody RegisterRequestDto request) {

        RegisterResponseDto registeredUser =
                authService.register(request);

        ApiResponse<RegisterResponseDto> response =
                new ApiResponse<>(
                        true,
                        registeredUser,
                        "Registration completed successfully"
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }
}
