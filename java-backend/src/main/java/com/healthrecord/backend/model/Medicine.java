package com.healthrecord.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "medicines")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String generic;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String pharmacy;

    private String distance;
    private String address;
    
    @Column(nullable = false)
    private Boolean inStock;

    private String category;
    private String unit;
}
