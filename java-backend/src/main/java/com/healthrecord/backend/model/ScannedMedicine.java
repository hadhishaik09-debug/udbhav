package com.healthrecord.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "scanned_medicines")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScannedMedicine {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String medicineName;

    @ElementCollection
    @CollectionTable(name = "medicine_uses", joinColumns = @JoinColumn(name = "medicine_id"))
    private List<String> uses;

    @Column(nullable = false)
    private String dosage;

    @ElementCollection
    @CollectionTable(name = "medicine_side_effects", joinColumns = @JoinColumn(name = "medicine_id"))
    private List<String> sideEffects;

    @ElementCollection
    @CollectionTable(name = "medicine_precautions", joinColumns = @JoinColumn(name = "medicine_id"))
    private List<String> precautions;

    @ElementCollection
    @CollectionTable(name = "medicine_warnings", joinColumns = @JoinColumn(name = "medicine_id"))
    private List<String> warnings;

    @ElementCollection
    @CollectionTable(name = "medicine_drug_interactions", joinColumns = @JoinColumn(name = "medicine_id"))
    private List<String> drugInteractions;

    private String imageUrl;

    @Column(name = "scanned_at")
    private LocalDateTime scannedAt;

    @PrePersist
    protected void onCreate() {
        scannedAt = LocalDateTime.now();
    }
}
