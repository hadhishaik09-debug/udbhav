package com.healthrecord.backend.controller;

import com.healthrecord.backend.model.Document;
import com.healthrecord.backend.model.ShareToken;
import com.healthrecord.backend.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {
    private final PatientService patientService;

    @GetMapping("/share/{token}")
    public ResponseEntity<Object> getSharedRecords(@PathVariable String token) {
        Optional<ShareToken> stOpt = patientService.validateAndGetShareToken(token);
        
        if (stOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("message", "Access Denied: Link expired or invalid"));
        }

        List<Document> docs = patientService.getSharedDocuments(stOpt.get());
        return ResponseEntity.ok(Map.of(
            "documents", docs,
            "patientName", stOpt.get().getPatient().getName(),
            "expiresAt", stOpt.get().getExpiryTime()
        ));
    }
}
