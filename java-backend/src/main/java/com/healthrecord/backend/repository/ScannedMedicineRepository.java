package com.healthrecord.backend.repository;

import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.model.ScannedMedicine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ScannedMedicineRepository extends JpaRepository<ScannedMedicine, UUID> {
    List<ScannedMedicine> findByPatient(Patient patient);
}
