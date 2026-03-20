package com.healthrecord.backend.controller;

import com.healthrecord.backend.dto.AdminRegistrationRequest;
import com.healthrecord.backend.dto.AuthRequest;
import com.healthrecord.backend.model.Admin;
import com.healthrecord.backend.model.Document;
import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.repository.AdminRepository;
import com.healthrecord.backend.repository.DocumentRepository;
import com.healthrecord.backend.repository.PatientRepository;
import com.healthrecord.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminRepository adminRepository;
    private final PatientRepository patientRepository;
    private final DocumentRepository documentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@RequestBody AdminRegistrationRequest request) {
        String email = request.email();
        String password = request.password();
        String name = request.name();
        String role = normalizeRole(request.role());
        if (isBlank(email) || isBlank(password) || isBlank(name)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name, email, and password are required"));
        }
        if (role == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role must be ADMIN or STAFF"));
        }
        if (adminRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        Admin admin = Admin.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .role(role)
                .build();
        adminRepository.save(admin);
        return ResponseEntity.ok(Map.of("message", "Admin registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String email = request.email();
        String password = request.password();
        if (isBlank(email) || isBlank(password)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isEmpty() || !passwordEncoder.matches(password, adminOpt.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
        Admin admin = adminOpt.get();
        String token = jwtService.generateToken(
                admin.getEmail(),
                Map.of(
                        "userType", "ADMIN",
                        "role", "ROLE_" + admin.getRole(),
                        "userId", admin.getId() == null ? "" : admin.getId().toString()
                )
        );
        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "token", token,
                "admin", Map.of(
                        "id", admin.getId() == null ? "" : admin.getId().toString(),
                        "name", admin.getName(),
                        "email", admin.getEmail(),
                        "role", admin.getRole()
                )
        ));
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    @GetMapping("/documents")
    public ResponseEntity<List<Document>> getAllDocuments() {
        return ResponseEntity.ok(documentRepository.findAll());
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getSummary() {
        return ResponseEntity.ok(Map.of(
                "admins", adminRepository.count(),
                "patients", patientRepository.count(),
                "documents", documentRepository.count()
        ));
    }

    private String normalizeRole(String role) {
        String resolvedRole = isBlank(role) ? "ADMIN" : role.trim().toUpperCase();
        return switch (resolvedRole) {
            case "ADMIN", "STAFF" -> resolvedRole;
            default -> null;
        };
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
