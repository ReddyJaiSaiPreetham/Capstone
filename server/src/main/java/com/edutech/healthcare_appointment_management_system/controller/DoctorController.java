package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.repository.AppointmentRepository;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;
import com.edutech.healthcare_appointment_management_system.service.DoctorService;
import com.edutech.healthcare_appointment_management_system.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
public class DoctorController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @PostMapping("/api/doctor/availability")
    public ResponseEntity<Doctor> updateAvailability(
            @RequestParam Long doctorId,
            @RequestParam String availability) {

        Doctor updatedDoctor =
                doctorService.updateAvailability(doctorId, availability);

        return new ResponseEntity<>(updatedDoctor, HttpStatus.OK);
    }

    @GetMapping("/api/doctor/appointments")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(
            @RequestParam Long doctorId) {

        Doctor doctor = doctorService.getDoctorById(doctorId);
        List<Appointment> appointments =
                appointmentService.getAppointmentsByDoctor(doctor);

        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }



    @Autowired
    private UserService userService;

    // ✅ Fetch all doctor appointments
    @GetMapping("/appointments")
    public List<Appointment> getDoctorAppointments(Principal principal) {

        User doctor = userService.getUserByUsername(principal.getName());
        return appointmentService.getAppointmentsForDoctor(doctor.getId());
    }

    @PutMapping("/appointment/{id}/complete")
    public Appointment completeAppointment(@PathVariable Long id) {
        return appointmentService.markAppointmentCompleted(id);
    }

@PutMapping("/api/doctor/appointment/{id}/completion-status")
public ResponseEntity<?> updateCompletionStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> body) {

    System.out.println("🔥 HIT backend");
    System.out.println("🔥 ID = " + id);
    System.out.println("🔥 BODY = " + body);

    String status = body.get("completionstatus");

    appointmentService.updateCompletionStatus(id, status);

    return ResponseEntity.ok().build();
}
}
