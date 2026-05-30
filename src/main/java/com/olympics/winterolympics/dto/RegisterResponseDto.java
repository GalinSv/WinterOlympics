package com.olympics.winterolympics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegisterResponseDto {

    private Long athleteId;

    private Long userId;

    private String username;

    private String email;
}
