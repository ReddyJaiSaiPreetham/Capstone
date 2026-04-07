package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.dto.TimeDto;
import com.edutech.healthcare_appointment_management_system.entity.*;
import com.edutech.healthcare_appointment_management_system.repository.AppointmentRepository;
import com.edutech.healthcare_appointment_management_system.repository.DoctorAvailabilitySlotRepository;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;
import com.edutech.healthcare_appointment_management_system.service.DoctorService;
import com.edutech.healthcare_appointment_management_system.service.PatientService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DoctorAvailabilitySlotRepository doctorAvailabilitySlotRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getDoctors() {
        return ResponseEntity.ok(doctorRepository.findByActiveTrue());
    }

    @PostMapping("/appointment")
    public ResponseEntity<Map<String, String>> scheduleAppointment(
            @RequestParam Long patientId,
            @RequestParam Long doctorId,
            @RequestBody TimeDto timeDto
    ) {
        Patient patient = patientService.getPatientById(patientId);
        Doctor doctor = doctorService.getDoctorById(doctorId);

        appointmentService.scheduleAppointment(patient, doctor, timeDto.getTime());

        Map<String, String> resp = new java.util.HashMap<>();
        resp.put("message", "Appointment Scheduled");
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/appointments")
    public List<Appointment> getPatientAppointments(@RequestParam Long patientId) {
        Patient patient = patientService.getPatientById(patientId);
        return appointmentService.getAppointmentsByPatient(patient);
    }

    @GetMapping("/doctor/{doctorId}/available-slots")
    public ResponseEntity<List<Map<String, String>>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam String date
    ) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!doctor.isActive()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        LocalDate localDate = LocalDate.parse(date);
        LocalDateTime start = localDate.atTime(9, 0);
        LocalDateTime end = localDate.atTime(21, 0);

        DateTimeFormatter isoFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        DateTimeFormatter displayFmt = DateTimeFormatter.ofPattern("hh:mm a");

        List<DoctorAvailabilitySlot> enabledSlots =
                doctorAvailabilitySlotRepository.findByDoctorAndSlotStartBetweenAndStatus(
                        doctor, start, end, SlotStatus.AVAILABLE
                );

        Instant nowInstant = Instant.now();

        List<Map<String, String>> result = enabledSlots.stream()
                .map(DoctorAvailabilitySlot::getSlotStart)
                .filter(slotStart -> slotStart.atZone(IST).toInstant().isAfter(nowInstant))
                .filter(slotStart -> !appointmentRepository.existsByDoctorAndAppointmentTime(doctor, slotStart))
                .map(slotStart -> {
                    Map<String, String> m = new java.util.HashMap<>();
                    m.put("time", slotStart.format(isoFmt));
                    m.put("display", slotStart.format(displayFmt));
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}