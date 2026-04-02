package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.dto.TimeDto;
import com.edutech.healthcare_appointment_management_system.entity.*;
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
    private DoctorService doctorService;   // ✅ Using service

    @Autowired
    private PatientService patientService; // ✅ Using service

    // ✅ GET ALL DOCTORS
    @GetMapping("/api/patient/doctors")
    public List<Doctor> getDoctors() {
        return doctorService.getAllDoctors();
    }

    // ✅ SCHEDULE APPOINTMENT
    @PostMapping("/api/patient/appointment")
    public ResponseEntity<String> scheduleAppointment(
            @RequestParam Long patientId,
            @RequestParam Long doctorId,
            @RequestBody TimeDto timeDto
    ) {

        // ✅ Using PatientService
        Patient patient = patientService.getPatientById(patientId);

        // ✅ Using DoctorService
        Doctor doctor = doctorService.getDoctorById(doctorId);

        appointmentService.scheduleAppointment(
                patient,
                doctor,
                timeDto.getTime()
        );

        return ResponseEntity.ok("Appointment Scheduled");
    }

    // ✅ GET PATIENT APPOINTMENTS
    @GetMapping("/api/patient/appointments")
    public List<Appointment> getPatientAppointments(@RequestParam Long patientId) {

        Patient patient = patientService.getPatientById(patientId);

        return appointmentService.getAppointmentsByPatient(patient);
    }

    // ✅ GET PATIENT MEDICAL RECORDS
    @GetMapping("/api/patient/medicalrecords")
    public List<MedicalRecord> getMedicalRecords(@RequestParam Long patientId) {

        Patient patient = patientService.getPatientById(patientId);

        return medicalRecordService.getMedicalRecordsByPatient(patient);
    }
}