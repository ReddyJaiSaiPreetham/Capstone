package com.edutech.healthcare_appointment_management_system.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;


public class LoginRequest {

    // ✅ Username validation
    @NotBlank(message = "Username is required")
    @Size(min = 4, max = 20, message = "Username must be between 4 and 20 characters")
    private String username;

    // ✅ Password validation
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters", max = 1000)
    private String password;

    // ✅ Captcha validation
    @NotBlank(message = "Captcha is required")
    private String captcha;

    // ✅ Constructor used for JSON deserialization
    @JsonCreator
    public LoginRequest(
            @JsonProperty("username") String username,
            @JsonProperty("password") String password,
            @JsonProperty("captcha") String captcha
    ) {
        this.username = username;
        this.password = password;
        this.captcha = captcha;
    }

    // ✅ Default constructor (required by Jackson)
    public LoginRequest() {}

    // ✅ Getters & Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }

    public String getCaptcha() {
        return captcha;
    }

    public void setCaptcha(String captcha) {
        this.captcha = captcha;
    }
}