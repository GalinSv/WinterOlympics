package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.AuthResponseDto;
import com.olympics.winterolympics.dto.LoginRequestDto;
import com.olympics.winterolympics.dto.RegisterRequestDto;
import com.olympics.winterolympics.dto.RegisterResponseDto;

public interface AuthService {

    RegisterResponseDto register(RegisterRequestDto request);

    AuthResponseDto login(LoginRequestDto request);
}
