package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.dto.TimeDto;
import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;
import com.edutech.healthcare_appointment_management_system.service.DoctorService;
import com.edutech.healthcare_appointment_management_system.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
public class DoctorController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private UserService userService;

    // ✅ Update doctor availability
    @PostMapping("/api/doctor/availability")
    public ResponseEntity<Doctor> updateAvailability(
            @RequestParam Long doctorId,
            @RequestParam String availability) {

        Doctor updatedDoctor = doctorService.updateAvailability(doctorId, availability);
        return new ResponseEntity<>(updatedDoctor, HttpStatus.OK);
    }

    // ✅ Get doctor appointments by doctorId (used by your UI)
    @GetMapping("/api/doctor/appointments")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(
            @RequestParam Long doctorId) {

        Doctor doctor = doctorService.getDoctorById(doctorId);
        List<Appointment> appointments = appointmentService.getAppointmentsByDoctor(doctor);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    // ✅ Fetch doctor appointments using JWT principal (optional endpoint)
    @GetMapping("/appointments")
    public List<Appointment> getDoctorAppointmentsByPrincipal(Principal principal) {
        User doctor = userService.getUserByUsername(principal.getName());
        return appointmentService.getAppointmentsForDoctor(doctor.getId());
    }

    // ✅ Mark appointment as completed
    @PutMapping("/appointment/{id}/complete")
    public Appointment completeAppointment(@PathVariable Long id) {
        return appointmentService.markAppointmentCompleted(id);
    }

    // ✅ Update completion status (PENDING/COMPLETED)
    @PutMapping("/api/doctor/appointment/{id}/completion-status")
    public ResponseEntity<?> updateCompletionStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("completionstatus");
        appointmentService.updateCompletionStatus(id, status);
        return ResponseEntity.ok().build();
    }

    // ✅ Doctor reschedule appointment (LocalDateTime)
    // Recommended: use TimeDto so LocalDateTime parsing is clean
    @PutMapping("/api/doctor/appointment/{id}/reschedule")
    public ResponseEntity<Appointment> rescheduleAppointmentByDoctor(
            @PathVariable Long id,
            @RequestBody TimeDto timeDto) {

        LocalDateTime newTime = timeDto.getTime();
        Appointment updated = appointmentService.doctorRescheduleAppointment(id, newTime);

        return ResponseEntity.ok(updated);
    }
}
