package com.edutech.healthcare_appointment_management_system.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CaptchaService {

    
    private final Map<String, String> captchaStore = new ConcurrentHashMap<>();

    
    public String generateCaptcha(String sessionId) {
        String captcha = UUID.randomUUID()
                .toString()
                .replaceAll("[^A-Z0-9]", "")
                .substring(0, 6)
                .toUpperCase();

        captchaStore.put(sessionId, captcha);
        return captcha;
    }

    
    public boolean validateCaptcha(String sessionId, String userCaptcha) {

        String storedCaptcha = captchaStore.get(sessionId);

    
        captchaStore.remove(sessionId);

        return storedCaptcha != null &&
               userCaptcha != null &&
               storedCaptcha.equalsIgnoreCase(userCaptcha);
    }
}