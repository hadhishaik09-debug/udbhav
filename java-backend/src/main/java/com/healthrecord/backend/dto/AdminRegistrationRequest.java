package com.healthrecord.backend.dto;

public record AdminRegistrationRequest(
        String email,
        String password,
        String name,
        String role
) {
}
