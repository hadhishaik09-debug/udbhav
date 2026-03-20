package com.healthrecord.backend.dto;

public record AuthRequest(
        String email,
        String password,
        String name,
        String otpCode
) {
}
