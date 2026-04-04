package com.edutech.healthcare_appointment_management_system.service;

import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    // ✅ Get all users (optional)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ Get users by role (DOCTOR / RECEPTIONIST / PATIENT / ADMIN)
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    // ✅ Only ACTIVE users by role (useful if you want active-only lists)
    public List<User> getActiveUsersByRole(String role) {
        return userRepository.findByRoleAndActiveTrue(role);
    }

    // ✅ Activate user (soft enable)
    public User activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setActive(true);
        return userRepository.save(user);
    }

    // ✅ Deactivate user (soft disable) — do NOT delete
    public User deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setActive(false);
        return userRepository.save(user);
    }
}