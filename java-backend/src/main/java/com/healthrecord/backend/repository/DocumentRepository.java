package com.healthrecord.backend.repository;

import com.healthrecord.backend.model.Document;
import com.healthrecord.backend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByPatient(Patient patient);
    List<Document> findByIdIn(List<UUID> ids);
}
