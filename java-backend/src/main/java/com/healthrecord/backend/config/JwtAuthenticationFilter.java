package com.healthrecord.backend.config;

import com.healthrecord.backend.model.Admin;
import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.repository.AdminRepository;
import com.healthrecord.backend.repository.PatientRepository;
import com.healthrecord.backend.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final PatientRepository patientRepository;
    private final AdminRepository adminRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token) || SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        Claims claims = jwtService.extractAllClaims(token);
        String subject = claims.getSubject();
        String userType = claims.get("userType", String.class);
        String role = claims.get("role", String.class);

        if (subject == null || userType == null) {
            filterChain.doFilter(request, response);
            return;
        }

        resolvePrincipal(subject, userType).ifPresent(principal -> {
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            role == null ? List.of() : List.of(new SimpleGrantedAuthority(role))
                    );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        });

        filterChain.doFilter(request, response);
    }

    private Optional<?> resolvePrincipal(String email, String userType) {
        if ("ADMIN".equalsIgnoreCase(userType)) {
            return adminRepository.findByEmail(email).map(Admin.class::cast);
        }

        if ("PATIENT".equalsIgnoreCase(userType)) {
            return patientRepository.findByEmail(email).map(Patient.class::cast);
        }

        return Optional.empty();
    }
}
