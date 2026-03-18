package com.healthrecord.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "share_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(unique = true, nullable = false)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @Column(nullable = false)
    private Boolean isUsed = false;

    @Column(nullable = false)
    private String permissions; // "READ", "DOWNLOAD"

    @ElementCollection
    @CollectionTable(name = "token_documents", joinColumns = @JoinColumn(name = "token_id"))
    @Column(name = "document_id")
    private List<UUID> documentIds;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime accessedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (this.token == null) {
            this.token = UUID.randomUUID().toString();
        }
    }
}
