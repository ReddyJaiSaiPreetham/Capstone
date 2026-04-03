package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserService userService;

    /**
     * ✅ Get logged-in user's profile
     * Uses username from JWT token (secure)
     */
    @GetMapping
    public User getProfile(Authentication authentication) {
        String username = authentication.getName();
        return userService.getUserByUsername(username);
    }

    /**
     * ✅ Update username of logged-in user
     */
    @PutMapping("/username")
    public User updateUsername(
            Authentication authentication,
            @RequestBody Map<String, String> request
    ) {
        String oldUsername = authentication.getName();
        String newUsername = request.get("username");

        return userService.updateUsername(oldUsername, newUsername);
    }
}