package com.healthrecord.backend.dto;

import java.util.List;

public record ShareLinkRequest(
        List<String> documentIds,
        Integer expiryHours
) {
}
