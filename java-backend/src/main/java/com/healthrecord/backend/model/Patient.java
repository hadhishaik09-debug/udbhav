package com.healthrecord.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String permanentToken;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Document> documents;

    @PrePersist
    public void generateToken() {
        if (this.permanentToken == null) {
            this.permanentToken = UUID.randomUUID().toString();
        }
    }
}
