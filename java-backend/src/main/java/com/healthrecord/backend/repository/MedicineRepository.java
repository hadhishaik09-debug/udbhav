package com.healthrecord.backend.repository;

import com.healthrecord.backend.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MedicineRepository extends JpaRepository<Medicine, UUID> {
    List<Medicine> findByNameContainingIgnoreCaseOrGenericContainingIgnoreCase(String name, String generic);
    List<Medicine> findByCategory(String category);
}
