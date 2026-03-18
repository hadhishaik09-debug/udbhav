package com.healthrecord.backend.repository;

import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.model.ShareToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShareTokenRepository extends JpaRepository<ShareToken, UUID> {
    Optional<ShareToken> findByToken(String token);
    List<ShareToken> findByPatient(Patient patient);
}
