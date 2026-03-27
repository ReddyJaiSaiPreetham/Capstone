package com.edutech.healthcare_appointment_management_system.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.jwt.JwtUtil;
import com.edutech.healthcare_appointment_management_system.service.UserService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
public class RegisterAndLoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/api/patient/register")
    public ResponseEntity<User> registerPatient(@RequestBody Patient patient) {

        patient.setRole("PATIENT");
        User savedUser = userService.registerUser(patient);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/api/doctors/register")
    public ResponseEntity<User> registerDoctor(@RequestBody Doctor doctor) {

        doctor.setRole("DOCTOR");
        User savedUser = userService.registerUser(doctor);
        return ResponseEntity.ok(savedUser);
    }
}
