package com.edutech.healthcare_appointment_management_system.controller;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.edutech.healthcare_appointment_management_system.dto.LoginRequest;
import com.edutech.healthcare_appointment_management_system.dto.LoginResponse;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.jwt.JwtUtil;
import com.edutech.healthcare_appointment_management_system.service.UserService;
@RestController
@RequestMapping
public class RegisterAndLoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ PATIENT REGISTER
    @PostMapping("/api/patient/register")
    public ResponseEntity<User> registerPatient(@RequestBody Patient patient) {
        patient.setRole("PATIENT");
        return ResponseEntity.ok(userService.registerUser(patient));
    }

    // ✅ DOCTOR REGISTER
    @PostMapping("/api/doctors/register")
    public ResponseEntity<User> registerDoctor(@RequestBody Doctor doctor) {
        doctor.setRole("DOCTOR");
        return ResponseEntity.ok(userService.registerUser(doctor));
    }

//     @PostMapping("/api/user/login")
// public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
//     try {
//         authenticationManager.authenticate(
//             new UsernamePasswordAuthenticationToken(
//                 request.getUsername(),
//                 request.getPassword()
//             )
//         );

//         User user = userService.getUserByUsername(request.getUsername());

//         LoginResponse response = new LoginResponse(
//             user.getId(),
//             jwtUtil.generateToken(user.getUsername()),
//             user.getUsername(),
//             user.getEmail(),
//             user.getRole()
//         );

//         return ResponseEntity.ok(response);

//     } catch (AuthenticationException ex) {
//         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//     }
// }
   @PostMapping("/api/user/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

    try {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        User user = userService.getUserByUsername(request.getUsername());

        LoginResponse response = new LoginResponse(
            user.getId(),
            jwtUtil.generateToken(user.getUsername()),
            user.getUsername(),
            user.getEmail(),
            user.getRole()
        );

        return ResponseEntity.ok(response);

    } catch (AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}

}