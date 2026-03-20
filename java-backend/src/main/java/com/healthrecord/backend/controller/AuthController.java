package com.healthrecord.backend.controller;

import com.healthrecord.backend.dto.AuthRequest;
import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.repository.PatientRepository;
import com.healthrecord.backend.service.JwtService;
import com.healthrecord.backend.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.healthrecord.backend.service.EmailService emailService;
    private final JwtService jwtService;
    private final OtpService otpService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody AuthRequest request) {
        String email = request.email();
        if (isBlank(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        Optional<Patient> existingPatient = patientRepository.findByEmail(email);
        if (existingPatient.isPresent()) {
            return ResponseEntity.status(409).body(Map.of(
                "message", "Email already exists", 
                "intimation", "This email is already registered. Please go to the Login page."
            ));
        }

        try {
            otpService.generateAndSendOtp(email);
            return ResponseEntity.ok(Map.of(
                "message", "OTP sent",
                "intimation", "You are a new user. A 6-digit verification code has been sent to your inbox."
            ));
        } catch (Exception ex) {
            log.error("OTP send error: ", ex);
            return ResponseEntity.status(500).body(Map.of(
                "message", "Failed to send OTP",
                "error", "Could not reach email service. Please check your SMTP settings."
            ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        String email = request.email();
        String password = request.password();
        String name = request.name();
        String otpCode = request.otpCode();

        if (isBlank(email) || isBlank(password) || isBlank(name) || isBlank(otpCode)) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields including OTP are required"));
        }
        
        if (patientRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "Email already registered"));
        }

        if (!otpService.verifyOtp(email, otpCode)) {
            return ResponseEntity.status(401).body(Map.of("message", "Verification failed. Incorrect or expired OTP."));
        }

        Patient patient = Patient.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .build();
        patientRepository.save(patient);
        otpService.clearOtp(email);

        return ResponseEntity.ok(Map.of("message", "Account created successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String email = request.email();
        String password = request.password();
        Optional<Patient> patientOpt = patientRepository.findByEmail(email);
        
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "message", "Account not found",
                "intimation", "No account associated with this email. Redirecting you to Sign-Up."
            ));
        }
        
        if (!passwordEncoder.matches(password, patientOpt.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid password"));
        }
        return generateLoginResponse(patientOpt.get());
    }

    @PostMapping("/login-otp/request")
    public ResponseEntity<?> loginOtpRequest(@RequestBody AuthRequest request) {
        String email = request.email();
        Optional<Patient> patientOpt = patientRepository.findByEmail(email);
        
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "message", "User not found",
                "intimation", "This email is not registered yet. Please create an account first."
            ));
        }

        try {
            otpService.generateAndSendOtp(email);
            return ResponseEntity.ok(Map.of(
                "message", "Login OTP sent",
                "intimation", "Account found. A secure login code has been sent to your email."
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", "Email service error"));
        }
    }

    @PostMapping("/forgot-password/request")
    public ResponseEntity<?> forgotPassRequest(@RequestBody AuthRequest request) {
        String email = request.email();
        Optional<Patient> patientOpt = patientRepository.findByEmail(email);
        
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "message", "Account missing",
                "intimation", "We couldn't find an account for this email. Password reset unavailable."
            ));
        }

        try {
            otpService.generateAndSendOtp(email);
            return ResponseEntity.ok(Map.of(
                "message", "Reset code sent",
                "intimation", "Verification code sent. Use it to set a new password."
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", "Email service unavailable"));
        }
    }

    // --- SHARED LOGIN HELPER ---
    private ResponseEntity<?> generateLoginResponse(Patient patient) {
        String token = jwtService.generateToken(
                patient.getEmail(),
                Map.of(
                        "userType", "PATIENT",
                        "role", "ROLE_PATIENT",
                        "userId", patient.getId() == null ? "" : patient.getId().toString()
                )
        );
        return ResponseEntity.ok(Map.of(
                "token", token,
                "patient", Map.of(
                        "id", patient.getId() == null ? "" : patient.getId().toString(),
                        "name", patient.getName(),
                        "email", patient.getEmail()
                )
        ));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
