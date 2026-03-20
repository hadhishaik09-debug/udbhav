package com.healthrecord.backend.controller;

import com.healthrecord.backend.model.Medicine;
import com.healthrecord.backend.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {
    private final MedicineRepository medicineRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> searchMedicines(@RequestParam(required = false) String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(medicineRepository.findAll());
        }
        return ResponseEntity.ok(medicineRepository.findByNameContainingIgnoreCaseOrGenericContainingIgnoreCase(query, query));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Medicine>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(medicineRepository.findByCategory(category));
    }
}
