package com.healthrecord.backend.service;

import com.healthrecord.backend.model.Otp;
import com.healthrecord.backend.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final Random random = new Random();

    @Transactional
    public void generateAndSendOtp(String email) {
        // 1. Delete previous OTPs for this email
        otpRepository.deleteByEmail(email);

        // 2. Generate 6-digit code
        String code = String.format("%06d", random.nextInt(1000000));

        // 3. Save to DB with 5-minute expiry
        Otp otp = Otp.builder()
                .email(email)
                .code(code)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();
        otpRepository.save(otp);

        // 4. Send email
        String subject = "Your Aushadhara Verification OTP";
        String message = "Hello,\n\n" +
                "Your verification code is: " + code + "\n\n" +
                "This code will expire in 5 minutes. Do not share it with anyone.\n\n" +
                "Thank you,\n" +
                "Aushadhara Healthcare Team";
        emailService.sendEmail(email, subject, message);
    }

    public boolean verifyOtp(String email, String code) {
        Optional<Otp> otpOpt = otpRepository.findByEmailOrderByExpiryTimeDesc(email);
        if (otpOpt.isEmpty()) return false;
        
        Otp otp = otpOpt.get();
        if (otp.isExpired()) return false;
        
        return otp.getCode().equals(code);
    }

    @Transactional
    public void clearOtp(String email) {
        otpRepository.deleteByEmail(email);
    }
}
