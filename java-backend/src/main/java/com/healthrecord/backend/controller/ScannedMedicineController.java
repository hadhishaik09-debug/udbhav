package com.healthrecord.backend.controller;

import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.model.ScannedMedicine;
import com.healthrecord.backend.repository.ScannedMedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medicine/scans")
@RequiredArgsConstructor
public class ScannedMedicineController {
    private final ScannedMedicineRepository scannedMedicineRepository;

    @GetMapping
    public ResponseEntity<List<ScannedMedicine>> getMyScans(@AuthenticationPrincipal Patient patient) {
        return ResponseEntity.ok(scannedMedicineRepository.findByPatient(patient));
    }

    @PostMapping
    public ResponseEntity<ScannedMedicine> saveScan(@AuthenticationPrincipal Patient patient, @RequestBody ScannedMedicine scan) {
        scan.setPatient(patient);
        return ResponseEntity.status(201).body(scannedMedicineRepository.save(scan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScan(@AuthenticationPrincipal Patient patient, @PathVariable UUID id) {
        ScannedMedicine scan = scannedMedicineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Scan not found"));
        if (!scan.getPatient().getId().equals(patient.getId())) {
            throw new SecurityException("Unauthorized access to scan record");
        }
        scannedMedicineRepository.delete(scan);
        return ResponseEntity.noContent().build();
    }
}
