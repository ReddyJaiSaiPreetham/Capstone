package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.dto.TimeDto;
import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.DoctorAvailabilitySlot;
import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;
import com.edutech.healthcare_appointment_management_system.service.DoctorService;
import com.edutech.healthcare_appointment_management_system.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private UserService userService;

    @PostMapping("/availability")
    public ResponseEntity<Doctor> updateAvailability(
            @RequestParam Long doctorId,
            @RequestParam String availability) {

        Doctor updatedDoctor = doctorService.updateAvailability(doctorId, availability);
        return new ResponseEntity<>(updatedDoctor, HttpStatus.OK);
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(
            @RequestParam Long doctorId) {

        Doctor doctor = doctorService.getDoctorById(doctorId);
        List<Appointment> appointments = appointmentService.getAppointmentsByDoctor(doctor);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<List<Appointment>> getDoctorAppointmentsByPrincipal(Principal principal) {

        User doctor = userService.getUserByUsername(principal.getName());
        List<Appointment> appointments = appointmentService.getAppointmentsForDoctor(doctor.getId());
        return ResponseEntity.ok(appointments);
    }

    @PutMapping("/appointment/{id}/complete")
    public ResponseEntity<Appointment> completeAppointment(@PathVariable Long id) {

        Appointment updated = appointmentService.markAppointmentCompleted(id);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/appointment/{id}/completion-status")
    public ResponseEntity<?> updateCompletionStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("completionstatus");
        appointmentService.updateCompletionStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/appointment/{id}/reschedule")
    public ResponseEntity<Appointment> rescheduleAppointmentByDoctor(
            @PathVariable Long id,
            @RequestBody TimeDto timeDto) {

        LocalDateTime newTime = timeDto.getTime();
        Appointment updated = appointmentService.rescheduleAppointment(id, newTime);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{doctorId}/generate-slots")
    public ResponseEntity<?> generateSlots(@PathVariable Long doctorId) {
        doctorService.generateSlotsForNext10Days(doctorId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{doctorId}/slots")
    public ResponseEntity<List<DoctorAvailabilitySlot>> getSlots(
            @PathVariable Long doctorId,
            @RequestParam String date) {

        LocalDate localDate = LocalDate.parse(date); 
        List<DoctorAvailabilitySlot> slots = doctorService.getSlotsForDoctorOnDate(doctorId, localDate);
        return ResponseEntity.ok(slots);
    }

    @PutMapping("/{doctorId}/slot")
    public ResponseEntity<DoctorAvailabilitySlot> updateSlot(
            @PathVariable Long doctorId,
            @RequestParam boolean available,
            @RequestBody TimeDto timeDto) {

        DoctorAvailabilitySlot updated =
                doctorService.setSlotAvailability(doctorId, timeDto.getTime(), available);

        return ResponseEntity.ok(updated);
    }
}