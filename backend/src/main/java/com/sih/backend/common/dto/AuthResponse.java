package com.sih.backend.common.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String email,
        String role
) {}
