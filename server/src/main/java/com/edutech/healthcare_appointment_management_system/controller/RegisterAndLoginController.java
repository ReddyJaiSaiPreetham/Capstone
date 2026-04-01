package com.edutech.healthcare_appointment_management_system.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.edutech.healthcare_appointment_management_system.dto.LoginRequest;
import com.edutech.healthcare_appointment_management_system.dto.LoginResponse;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.entity.Receptionist;
import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.jwt.JwtUtil;
import com.edutech.healthcare_appointment_management_system.repository.UserRepository;
import com.edutech.healthcare_appointment_management_system.service.CaptchaService;
import com.edutech.healthcare_appointment_management_system.service.UserService;
@RestController
@RequestMapping
public class RegisterAndLoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CaptchaService captchaService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/api/patient/register")
    public ResponseEntity<User> registerPatient(@RequestBody Patient patient) {
        patient.setRole("PATIENT");
        return ResponseEntity.ok(userService.registerUser(patient));
    }

    @PostMapping("/api/doctors/register")
    public ResponseEntity<User> registerDoctor(@RequestBody Doctor doctor) {
        doctor.setRole("DOCTOR");
        return ResponseEntity.ok(userService.registerUser(doctor));
    }

    @PostMapping("/api/receptionist/register")
public ResponseEntity<User> registerReceptionist(@RequestBody Receptionist receptionist) {
    receptionist.setRole("RECEPTIONIST");
    return ResponseEntity.ok(userService.registerUser(receptionist));
}

@PostMapping("/api/user/login")
public ResponseEntity<LoginResponse> login(
        @Validated @RequestBody LoginRequest request,
        HttpServletRequest httpRequest) {

    try {

        // ✅ 1️⃣ CAPTCHA VALIDATION FIRST
        String sessionId = httpRequest.getSession().getId();

        boolean isCaptchaValid = captchaService.validateCaptcha(
                sessionId,
                request.getCaptcha()
        );

        if (!isCaptchaValid) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(null); // or custom error message
        }

        // ✅ 2️⃣ AUTHENTICATE USER
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        // ✅ 3️⃣ FETCH USER
        User user = userService.getUserByUsername(request.getUsername());

        // ✅ 4️⃣ GENERATE JWT
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