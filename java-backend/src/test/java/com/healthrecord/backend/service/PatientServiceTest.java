package com.healthrecord.backend.service;

import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.model.Document;
import com.healthrecord.backend.model.ShareToken;
import com.healthrecord.backend.repository.DocumentRepository;
import com.healthrecord.backend.repository.PatientRepository;
import com.healthrecord.backend.repository.ShareTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PatientServiceTest {
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private DocumentRepository documentRepository;
    @Mock
    private ShareTokenRepository shareTokenRepository;
    @InjectMocks
    private PatientService patientService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getDocuments_ReturnsDocuments() {
        Patient patient = new Patient();
        List<Document> docs = List.of(new Document());
        when(documentRepository.findByPatient(patient)).thenReturn(docs);
        List<Document> result = patientService.getDocuments(patient);
        assertEquals(1, result.size());
    }

    @Test
    void regeneratePermanentToken_UpdatesToken() {
        Patient patient = new Patient();
        patient.setPermanentToken("old");
        when(patientRepository.save(any())).thenReturn(patient);
        String newToken = patientService.regeneratePermanentToken(patient);
        assertNotEquals("old", newToken);
    }

    @Test
    void validateAndGetShareToken_InvalidToken() {
        when(shareTokenRepository.findByToken("bad")).thenReturn(Optional.empty());
        Optional<ShareToken> result = patientService.validateAndGetShareToken("bad");
        assertTrue(result.isEmpty());
    }
}
