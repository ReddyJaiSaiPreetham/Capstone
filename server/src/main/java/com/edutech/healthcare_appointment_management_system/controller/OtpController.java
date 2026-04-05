package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.service.EmailOtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    @Autowired
    private EmailOtpService emailOtpService;

    // POST /api/otp/send?email=...&purpose=REGISTRATION
    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestParam String email,
                                    @RequestParam(defaultValue = "REGISTRATION") String purpose) {
        emailOtpService.sendOtp(email, purpose);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }
}