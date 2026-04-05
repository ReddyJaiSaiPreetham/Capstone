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
import com.edutech.healthcare_appointment_management_system.service.CaptchaService;
import com.edutech.healthcare_appointment_management_system.service.UserService;
import com.edutech.healthcare_appointment_management_system.service.EmailOtpService;
@RestController
@RequestMapping
public class RegisterAndLoginController {

    // ✅ HARDCODED ADMIN CREDENTIALS (NO DB ACCOUNT NEEDED)
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "Admin@123";

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CaptchaService captchaService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailOtpService emailOtpService;

   @PostMapping("/api/patient/register")
public ResponseEntity<?> registerPatient(@RequestParam String otp, @RequestBody Patient patient) {
    try {
        emailOtpService.verifyRegistrationOtpOrThrow(patient.getEmail(), otp);
        patient.setRole("PATIENT");
        return ResponseEntity.ok(userService.registerUser(patient));
    } catch (RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}

   @PostMapping("/api/doctors/register")
public ResponseEntity<User> registerDoctor(@RequestParam String otp, @RequestBody Doctor doctor) {
    emailOtpService.verifyRegistrationOtpOrThrow(doctor.getEmail(), otp);
    doctor.setRole("DOCTOR");
    return ResponseEntity.ok(userService.registerUser(doctor));
}

   @PostMapping("/api/receptionist/register")
public ResponseEntity<User> registerReceptionist(@RequestParam String otp, @RequestBody Receptionist receptionist) {
    emailOtpService.verifyRegistrationOtpOrThrow(receptionist.getEmail(), otp);
    receptionist.setRole("RECEPTIONIST");
    return ResponseEntity.ok(userService.registerUser(receptionist));
}

    @PostMapping("/api/user/login")
public ResponseEntity<LoginResponse> login(
        @Validated @RequestBody LoginRequest request,
        HttpServletRequest httpRequest) {

    try {
        // ✅ 1) CAPTCHA VALIDATION FIRST
        String sessionId = httpRequest.getSession().getId();
        boolean isCaptchaValid = captchaService.validateCaptcha(sessionId, request.getCaptcha());

        if (!isCaptchaValid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // ✅ 2) HARDCODED ADMIN LOGIN (BYPASS DB PASSWORD, BUT VERIFY DB ROLE)
        if (ADMIN_USERNAME.equals(request.getUsername())
                && ADMIN_PASSWORD.equals(request.getPassword())) {

            // check admin exists in DB and is role ADMIN
            User dbAdmin = userService.getUserByUsername(ADMIN_USERNAME);

            if (!"ADMIN".equals(dbAdmin.getRole())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            if (!dbAdmin.isActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            LoginResponse response = new LoginResponse(
                    dbAdmin.getId(),
                    jwtUtil.generateToken(ADMIN_USERNAME),
                    dbAdmin.getUsername(),
                    dbAdmin.getEmail(),
                    "ADMIN"
            );

            return ResponseEntity.ok(response);
        }

        // ✅ 3) NORMAL USER AUTHENTICATION (DB users)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // ✅ 4) FETCH USER + GENERATE JWT
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