package com.healthrecord.backend.controller;

import com.healthrecord.backend.model.Document;
import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentRepository documentRepository;

    @Value("${document.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@AuthenticationPrincipal Patient patient,
                                            @RequestParam("file") MultipartFile file,
                                            @RequestParam("type") String type) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path dirPath = Paths.get(uploadDir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }
        Path filePath = dirPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        Document doc = Document.builder()
                .patient(patient)
                .fileUrl(filePath.toString())
                .type(type)
                .build();
        documentRepository.save(doc);
        return ResponseEntity.ok(doc);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Document>> getMyDocuments(@AuthenticationPrincipal Patient patient) {
        List<Document> docs = documentRepository.findByPatient(patient);
        return ResponseEntity.ok(docs);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadDocument(@PathVariable UUID id,
                                              @AuthenticationPrincipal Patient patient) throws IOException {
        Document doc = documentRepository.findById(id)
                .filter(d -> d.getPatient().getId().equals(patient.getId()))
                .orElse(null);
        if (doc == null) {
            return ResponseEntity.status(404).body("Document not found");
        }
        File file = new File(doc.getFileUrl());
        if (!file.exists()) {
            return ResponseEntity.status(404).body("File not found");
        }
        FileInputStream fis = new FileInputStream(file);
        byte[] content = fis.readAllBytes();
        fis.close();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getName())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }
}
