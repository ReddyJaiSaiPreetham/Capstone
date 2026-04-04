package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.service.AdminService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ✅ OPTIONAL: Get all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // ✅ Get all doctors (active + inactive)
    @GetMapping("/doctors")
    public ResponseEntity<List<User>> getAllDoctors() {
        return ResponseEntity.ok(adminService.getUsersByRole("DOCTOR"));
    }

    // ✅ Get all receptionists (active + inactive)
    @GetMapping("/receptionists")
    public ResponseEntity<List<User>> getAllReceptionists() {
        return ResponseEntity.ok(adminService.getUsersByRole("RECEPTIONIST"));
    }

    // ✅ Get all patients (active + inactive)
    @GetMapping("/patients")
    public ResponseEntity<List<User>> getAllPatients() {
        return ResponseEntity.ok(adminService.getUsersByRole("PATIENT"));
    }

    // ✅ Activate any user
    @PutMapping("/users/{id}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        try {
            User updated = adminService.activateUser(id);
            return ResponseEntity.ok(Map.of(
                    "message", "User activated successfully",
                    "id", String.valueOf(updated.getId()),
                    "active", String.valueOf(updated.isActive())
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // ✅ Deactivate any user
    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        try {
            User updated = adminService.deactivateUser(id);
            return ResponseEntity.ok(Map.of(
                    "message", "User deactivated successfully",
                    "id", String.valueOf(updated.getId()),
                    "active", String.valueOf(updated.isActive())
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}