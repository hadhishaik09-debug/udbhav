package com.healthrecord.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reminders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reminder {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private String time;

    @Column(nullable = false)
    private String dosageType; // half_tablet, full_tablet, syrup

    @Column(nullable = false)
    private String dosageAmount;

    @Column(nullable = false)
    private String status; // pending, taken, snoozed, skipped

    private String alarmSound;
    private String alarmSoundUri;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
