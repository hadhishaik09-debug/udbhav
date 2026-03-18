package com.healthrecord.backend.controller;

import com.healthrecord.backend.model.Document;
import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.model.ShareToken;
import com.healthrecord.backend.service.PatientService;
import com.healthrecord.backend.util.QRCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;

    @GetMapping("/records")
    public ResponseEntity<List<Document>> getMyRecords(@AuthenticationPrincipal Patient patient) {
        return ResponseEntity.ok(patientService.getDocuments(patient));
    }

    @GetMapping("/qr")
    public ResponseEntity<Map<String, String>> getPermanentQR(@AuthenticationPrincipal Patient patient) throws Exception {
        String qrUrl = "http://localhost:8081/user/records?token=" + patient.getPermanentToken();
        String qrImage = QRCodeGenerator.generateQRCodeImage(qrUrl, 250, 250);
        return ResponseEntity.ok(Map.of(
            "qrUrl", qrUrl,
            "qrImageBase64", qrImage
        ));
    }

    @PostMapping("/qr/regenerate")
    public ResponseEntity<Map<String, String>> regenerateQR(@AuthenticationPrincipal Patient patient) {
        String newToken = patientService.regeneratePermanentToken(patient);
        return ResponseEntity.ok(Map.of("message", "Token regenerated", "newToken", newToken));
    }

    @PostMapping("/share")
    public ResponseEntity<Map<String, Object>> createShareLink(
            @AuthenticationPrincipal Patient patient,
            @RequestBody Map<String, Object> payload) throws Exception {
        
        List<String> docIdsStr = (List<String>) payload.get("documentIds");
        List<UUID> docIds = docIdsStr.stream().map(UUID::fromString).toList();
        int expiryHours = (int) payload.getOrDefault("expiryHours", 1);

        ShareToken st = patientService.createShareLink(patient, docIds, expiryHours);
        String shareUrl = "http://localhost:8081/share/" + st.getToken();
        String qrImage = QRCodeGenerator.generateQRCodeImage(shareUrl, 250, 250);

        return ResponseEntity.ok(Map.of(
            "shareUrl", shareUrl,
            "qrImageBase64", qrImage,
            "expiryTime", st.getExpiryTime()
        ));
    }

    @GetMapping("/share/history")
    public ResponseEntity<List<ShareToken>> getHistory(@AuthenticationPrincipal Patient patient) {
        return ResponseEntity.ok(patientService.getShareHistory(patient));
    }

    @DeleteMapping("/share/{id}")
    public ResponseEntity<Void> revoke(@AuthenticationPrincipal Patient patient, @PathVariable UUID id) {
        patientService.revokeToken(id, patient);
        return ResponseEntity.ok().build();
    }
}
