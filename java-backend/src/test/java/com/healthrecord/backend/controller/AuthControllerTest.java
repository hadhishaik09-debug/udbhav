package com.healthrecord.backend.controller;

import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.repository.AdminRepository;
import com.healthrecord.backend.repository.PatientRepository;
import com.healthrecord.backend.service.JwtService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Optional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(AuthController.class)
class AuthControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PatientRepository patientRepository;
    @MockBean
    private PasswordEncoder passwordEncoder;
    @MockBean
    private AdminRepository adminRepository;
    @MockBean
    private com.healthrecord.backend.service.EmailService emailService;
    @MockBean
    private JwtService jwtService;

    @Test
    void register_Success() throws Exception {
        Mockito.when(patientRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        Mockito.when(passwordEncoder.encode("password")).thenReturn("encoded");
        mockMvc.perform(post("/api/auth/register")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"test@example.com\",\"password\":\"password\",\"name\":\"Test User\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Registration successful"));
    }

    @Test
    void register_EmailExists() throws Exception {
        Mockito.when(patientRepository.findByEmail("test@example.com")).thenReturn(Optional.of(new Patient()));
        mockMvc.perform(post("/api/auth/register")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"test@example.com\",\"password\":\"password\",\"name\":\"Test User\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    @Test
    void login_Success_ReturnsToken() throws Exception {
        Patient patient = Patient.builder()
                .name("Test User")
                .email("test@example.com")
                .password("encoded")
                .build();

        Mockito.when(patientRepository.findByEmail("test@example.com")).thenReturn(Optional.of(patient));
        Mockito.when(passwordEncoder.matches("password", "encoded")).thenReturn(true);
        Mockito.when(jwtService.generateToken(Mockito.eq("test@example.com"), Mockito.anyMap())).thenReturn("jwt-token");

        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"password\":\"password\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value("jwt-token"))
            .andExpect(jsonPath("$.patient.email").value("test@example.com"));
    }
}
