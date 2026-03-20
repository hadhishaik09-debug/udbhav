package com.healthrecord.backend.controller;

import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.model.Reminder;
import com.healthrecord.backend.repository.ReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patient/reminders")
@RequiredArgsConstructor
public class ReminderController {
    private final ReminderRepository reminderRepository;

    @GetMapping
    public ResponseEntity<List<Reminder>> getMyReminders(@AuthenticationPrincipal Patient patient) {
        return ResponseEntity.ok(reminderRepository.findByPatient(patient));
    }

    @PostMapping
    public ResponseEntity<Reminder> createReminder(@AuthenticationPrincipal Patient patient, @RequestBody Reminder reminder) {
        reminder.setPatient(patient);
        if (reminder.getStatus() == null) {
            reminder.setStatus("pending");
        }
        return ResponseEntity.ok(reminderRepository.save(reminder));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Reminder> updateStatus(
            @AuthenticationPrincipal Patient patient,
            @PathVariable UUID id,
            @RequestParam String status) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reminder not found"));
        if (!reminder.getPatient().getId().equals(patient.getId())) {
            throw new SecurityException("Unauthorized access to reminder");
        }
        reminder.setStatus(status);
        return ResponseEntity.ok(reminderRepository.save(reminder));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@AuthenticationPrincipal Patient patient, @PathVariable UUID id) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reminder not found"));
        if (!reminder.getPatient().getId().equals(patient.getId())) {
            throw new SecurityException("Unauthorized access to reminder");
        }
        reminderRepository.delete(reminder);
        return ResponseEntity.noContent().build();
    }
}
