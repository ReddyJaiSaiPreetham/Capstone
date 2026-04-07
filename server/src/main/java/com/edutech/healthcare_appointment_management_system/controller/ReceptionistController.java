package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.dto.TimeDto;
import com.edutech.healthcare_appointment_management_system.entity.*;
import com.edutech.healthcare_appointment_management_system.repository.AppointmentRepository;
import com.edutech.healthcare_appointment_management_system.repository.DoctorAvailabilitySlotRepository;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;
import com.edutech.healthcare_appointment_management_system.repository.PatientRepository;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;

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
@RequestMapping("/api/receptionist")
public class ReceptionistController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorAvailabilitySlotRepository doctorAvailabilitySlotRepository;

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    @GetMapping("/appointments")
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/patients")
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getDoctors() {
        return ResponseEntity.ok(doctorRepository.findByActiveTrue());
    }

    @PostMapping("/appointment")
    public Appointment scheduleAppointment(
            @RequestParam Long patientId,
            @RequestParam Long doctorId,
            @RequestBody TimeDto timeDto) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        return appointmentService.scheduleAppointment(patient, doctor, timeDto.getTime());
    }

    @PutMapping("/appointment-reschedule/{appointmentId}")
    public Appointment rescheduleAppointment(
            @PathVariable Long appointmentId,
            @RequestBody TimeDto timeDto) {

        return appointmentService.rescheduleAppointment(appointmentId, timeDto.getTime());
    }

    @DeleteMapping("/appointment/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointmentByReceptionist(id);
        return ResponseEntity.ok().build();
    }

   
    @GetMapping("/doctor/{doctorId}/available-slots")
    public ResponseEntity<List<Map<String, String>>> getDoctorAvailableSlots(
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

        List<DoctorAvailabilitySlot> slots =
                doctorAvailabilitySlotRepository.findByDoctorAndSlotStartBetweenAndStatus(
                        doctor, start, end, SlotStatus.AVAILABLE
                );

        Instant nowInstant = Instant.now();

        List<Map<String, String>> result = slots.stream()
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

    @GetMapping("/doctor/{doctorId}/slots")
    public ResponseEntity<List<DoctorAvailabilitySlot>> getDoctorAllSlots(
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

        List<DoctorAvailabilitySlot> slots =
                doctorAvailabilitySlotRepository.findByDoctorAndSlotStartBetween(doctor, start, end);

        return ResponseEntity.ok(slots);
    }
}