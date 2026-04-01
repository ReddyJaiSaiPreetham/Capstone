package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.dto.TimeDto;
import com.edutech.healthcare_appointment_management_system.entity.*;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;
import com.edutech.healthcare_appointment_management_system.repository.PatientRepository;
import com.edutech.healthcare_appointment_management_system.service.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PatientController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Autowired
    private DoctorService doctorService;

    // ✅ Repositories
    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // ✅ VIEW DOCTORS
    @GetMapping("/api/patient/doctors")
    public List<Doctor> getDoctors() {
        return doctorService.getAllDoctors();
    }

    // ✅ SCHEDULE APPOINTMENT (FIXED ✅)
    @PostMapping("/api/patient/appointment")
    public ResponseEntity<String> scheduleAppointment(
            @RequestParam Long patientId,
            @RequestParam Long doctorId,
            @RequestBody TimeDto timeDto
    ) {

        // ✅ Fetch Patient
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // ✅ Fetch Doctor
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // ✅ Schedule appointment (NO 반환 object → avoids Jackson loop)
        appointmentService.scheduleAppointment(
                patient,
                doctor,
                timeDto.getTime()
        );

        // ✅ Safe response
        return ResponseEntity.ok("Appointment Scheduled");
    }

    // ✅ VIEW PATIENT APPOINTMENTS
    @GetMapping("/api/patient/appointments")
    public List<Appointment> getPatientAppointments(
            @RequestParam Long patientId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        return appointmentService.getAppointmentsByPatient(patient);
    }

    // ✅ VIEW MEDICAL RECORDS
    @GetMapping("/api/patient/medicalrecords")
    public List<MedicalRecord> getMedicalRecords(
            @RequestParam Long patientId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        return medicalRecordService.getMedicalRecordsByPatient(patient);
    }
}