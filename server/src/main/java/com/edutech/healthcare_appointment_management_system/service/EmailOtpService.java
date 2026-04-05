package com.edutech.healthcare_appointment_management_system.service;

import com.edutech.healthcare_appointment_management_system.entity.EmailOtp;
import com.edutech.healthcare_appointment_management_system.repository.EmailOtpRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class EmailOtpService {

    @Autowired
    private EmailOtpRepository emailOtpRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromEmail;

    private static final int OTP_EXP_MIN = 5;
    private static final int MAX_ATTEMPTS = 5;

    // ✅ Send OTP for registration
    public void sendRegistrationOtp(String email) {
        sendOtp(email, "REGISTRATION");
    }

    // ✅ Verify OTP for registration
    public void verifyRegistrationOtpOrThrow(String email, String otp) {
        verifyOtpOrThrow(email, "REGISTRATION", otp);
    }

    // ✅ Generic sender
    public void sendOtp(String email, String purpose) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        String otp = generate6DigitOtp();
        String hash = sha256(otp);

        EmailOtp rec = new EmailOtp();
        rec.setEmail(email.trim().toLowerCase());
        rec.setPurpose(purpose);
        rec.setOtpHash(hash);
        rec.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXP_MIN));
        rec.setUsed(false);
        rec.setAttempts(0);

        emailOtpRepository.save(rec);

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);

        if (fromEmail != null && !fromEmail.isEmpty()) {
            msg.setFrom(fromEmail);
        }

        msg.setSubject("Your OTP for " + purpose);
        msg.setText(
            "Your OTP is: " + otp +
            "\nValid for " + OTP_EXP_MIN + " minutes." +
            "\nDo not share this OTP."
        );

        mailSender.send(msg);
    }

    // ✅ Generic verifier
    public void verifyOtpOrThrow(String email, String purpose, String otp) {
        if (email == null || otp == null) {
            throw new RuntimeException("Email and OTP are required");
        }

        EmailOtp rec = emailOtpRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email.trim().toLowerCase(), purpose)
                .orElseThrow(() -> new RuntimeException("OTP not requested"));

        if (rec.isUsed()) throw new RuntimeException("OTP already used");
        if (rec.getExpiresAt().isBefore(LocalDateTime.now())) throw new RuntimeException("OTP expired");
        if (rec.getAttempts() >= MAX_ATTEMPTS) throw new RuntimeException("Too many attempts. Request new OTP.");

        String hash = sha256(otp.trim());
        if (!hash.equals(rec.getOtpHash())) {
            rec.setAttempts(rec.getAttempts() + 1);
            emailOtpRepository.save(rec);
            throw new RuntimeException("Invalid OTP");
        }

        rec.setUsed(true);
        emailOtpRepository.save(rec);
    }

    private String generate6DigitOtp() {
        int val = 100000 + new Random().nextInt(900000);
        return String.valueOf(val);
    }

    private String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] out = md.digest(input.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : out) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("OTP hash error");
        }
    }
}