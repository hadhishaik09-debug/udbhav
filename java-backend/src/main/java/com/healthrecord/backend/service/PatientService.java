package com.healthrecord.backend.service;

import com.healthrecord.backend.model.Document;
import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.model.ShareToken;
import com.healthrecord.backend.repository.DocumentRepository;
import com.healthrecord.backend.repository.PatientRepository;
import com.healthrecord.backend.repository.ShareTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository patientRepository;
    private final DocumentRepository documentRepository;
    private final ShareTokenRepository shareTokenRepository;

    public List<Document> getDocuments(Patient patient) {
        return documentRepository.findByPatient(patient);
    }

    public String regeneratePermanentToken(Patient patient) {
        patient.setPermanentToken(UUID.randomUUID().toString());
        patientRepository.save(patient);
        return patient.getPermanentToken();
    }

    public ShareToken createShareLink(Patient patient, List<UUID> documentIds, int expiryHours) {
        ShareToken token = ShareToken.builder()
                .patient(patient)
                .documentIds(documentIds)
                .expiryTime(LocalDateTime.now().plusHours(expiryHours))
                .isUsed(false)
                .permissions("READ")
                .build();
        return shareTokenRepository.save(token);
    }

    public Optional<ShareToken> validateAndGetShareToken(String token) {
        Optional<ShareToken> shareTokenOpt = shareTokenRepository.findByToken(token);
        if (shareTokenOpt.isPresent()) {
            ShareToken st = shareTokenOpt.get();
            if (LocalDateTime.now().isBefore(st.getExpiryTime()) && !st.getIsUsed()) {
                st.setAccessedAt(LocalDateTime.now());
                shareTokenRepository.save(st);
                return Optional.of(st);
            }
        }
        return Optional.empty();
    }

    public List<Document> getSharedDocuments(ShareToken token) {
        return documentRepository.findByIdIn(token.getDocumentIds());
    }

    public List<ShareToken> getShareHistory(Patient patient) {
        return shareTokenRepository.findByPatient(patient);
    }

    public void revokeToken(UUID tokenId, Patient patient) {
        shareTokenRepository.findById(tokenId).ifPresent(st -> {
            if (st.getPatient().getId().equals(patient.getId())) {
                shareTokenRepository.delete(st);
            }
        });
    }
}
