package com.edutech.healthcare_appointment_management_system.service;

import com.edutech.healthcare_appointment_management_system.entity.EmailOtp;
import com.edutech.healthcare_appointment_management_system.repository.EmailOtpRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import javax.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import java.nio.charset.StandardCharsets;
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


    public void sendRegistrationOtp(String email) {
        sendOtp(email, "REGISTRATION");
    }

 
    public void sendOtp(String email, String purpose) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (purpose == null || purpose.trim().isEmpty()) {
            purpose = "REGISTRATION";
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

        sendOtpEmailHtml(email, otp, purpose, OTP_EXP_MIN);
    }

    public void verifyRegistrationOtpOrThrow(String email, String otp) {
        verifyOtpOrThrow(email, "REGISTRATION", otp);
    }

    public void verifyOtpOrThrow(String email, String purpose, String otp) {
        if (email == null || otp == null) throw new RuntimeException("Email and OTP are required");

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



      
 
private void sendOtpEmailHtml(String toEmail, String otp, String purpose, int validMinutes) {
    try {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());

        helper.setTo(toEmail);
        helper.setSubject("Medicare Hospitals - Email Verification OTP");

        if (fromEmail != null && !fromEmail.isEmpty()) {
            helper.setFrom(fromEmail);
        }

        // ✅ check logo existence
        Resource logo = new ClassPathResource("static/medicare-logo.png");
        boolean hasLogo = logo.exists();
        System.out.println("Logo exists? " + hasLogo);

        // ✅ if logo missing, show a simple fallback icon block
        String logoBlock = hasLogo
                ? "<img src='cid:medicareLogo' width='42' height='42' style='display:block;' alt='Medicare Logo'/>"
                : "<div style='width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;font-weight:900;'>M</div>";

        String html =
            "<div style='font-family:Arial,sans-serif;background:#f6f9ff;padding:18px;'>" +
              "<div style='max-width:560px;margin:auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6eefc;'>" +

                "<div style='background:linear-gradient(135deg,#2563eb,#22c55e);padding:18px;color:#fff;'>" +
                  "<div style='display:flex;align-items:center;gap:12px;'>" +

                    "<div style='width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;overflow:hidden;'>" +
                      logoBlock +
                    "</div>" +

                    "<div>" +
                      "<div style='font-size:18px;font-weight:800;letter-spacing:0.3px;'>Medicare Hospitals</div>" +
                      "<div style='font-size:12px;opacity:0.9;'>Healthcare Appointment Management</div>" +
                    "</div>" +

                  "</div>" +
                "</div>" +

                "<div style='padding:18px;color:#0f172a;'>" +
                  "<h2 style='margin:0 0 8px;font-size:18px;'>Welcome!</h2>" +
                  "<p style='margin:0 0 12px;font-size:14px;line-height:1.6;color:#334155;'>" +
                    "Thank you for registering. Use the OTP below to verify your email." +
                  "</p>" +

                  "<div style='background:#eef6ff;border:1px solid #dbeafe;border-radius:12px;padding:14px;text-align:center;'>" +
                    "<div style='font-size:12px;color:#475569;font-weight:700;'>Your OTP</div>" +
                    "<div style='font-size:28px;font-weight:900;letter-spacing:6px;color:#1d4ed8;margin-top:6px;'>" +
                      otp +
                    "</div>" +
                    "<div style='font-size:12px;color:#475569;margin-top:6px;'>Valid for <b>" + validMinutes + " minutes</b></div>" +
                  "</div>" +

                  "<p style='margin:12px 0 0;font-size:12.5px;color:#64748b;line-height:1.6;'>" +
                    "If you did not request this OTP, ignore this email. Do not share OTP with anyone." +
                  "</p>" +
                "</div>" +

                "<div style='padding:12px 18px;background:#f8fafc;border-top:1px solid #eef2f7;font-size:12px;color:#64748b;'>" +
                  "© " + java.time.Year.now() + " Medicare Hospitals • Automated message" +
                "</div>" +

              "</div>" +
            "</div>";

        helper.setText(html, true);

        // ✅ attach only if exists
        if (hasLogo) {
            helper.addInline("medicareLogo", logo, "image/png");
        }

        mailSender.send(mimeMessage);

    } catch (Exception e) {
        throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
    }
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
