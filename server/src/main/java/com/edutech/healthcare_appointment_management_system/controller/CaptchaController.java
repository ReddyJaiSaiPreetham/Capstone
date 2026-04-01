package com.edutech.healthcare_appointment_management_system.controller;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edutech.healthcare_appointment_management_system.service.CaptchaService;

@RestController
@RequestMapping("/api/captcha")
public class CaptchaController {

    @Autowired
    private CaptchaService captchaService;

    @GetMapping
    public Map<String, String> getCaptcha(HttpServletRequest request) {

        String key = request.getSession().getId();
        String captcha = captchaService.generateCaptcha(key);

        return Map.of("captcha", captcha);
    }
}
