package com.healthrecord.backend.repository;

import com.healthrecord.backend.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByEmailOrderByExpiryTimeDesc(String email);
    void deleteByEmail(String email);
}
