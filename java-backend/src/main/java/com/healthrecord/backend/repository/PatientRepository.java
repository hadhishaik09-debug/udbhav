package com.healthrecord.backend.repository;

import com.healthrecord.backend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByPermanentToken(String token);
}
