package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.dto.TimeDto;
import com.edutech.healthcare_appointment_management_system.entity.*;
import com.edutech.healthcare_appointment_management_system.repository.AppointmentRepository;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;
import com.edutech.healthcare_appointment_management_system.repository.PatientRepository;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReceptionistController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;
 
    // ✅ FETCH ALL APPOINTMENTS
    @GetMapping("/api/receptionist/appointments")
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    // ✅ FETCH ALL PATIENTS (CRITICAL FIX ✅)
    @GetMapping("/api/receptionist/patients")
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // @GetMapping("/api/patient/doctors")
    // public List<Doctor> getDoctors() {
    //     return doctorRepository.findAll();
    // }


    @GetMapping("/api/receptionist/doctors")
public List<Doctor> getAllDoctors() {
    return doctorRepository.findAll();
}


    // ✅ SCHEDULE APPOINTMENT
    @PostMapping("/api/receptionist/appointment")
    public Appointment scheduleAppointment(
            @RequestParam Long patientId,
            @RequestParam Long doctorId,
            @RequestBody TimeDto timeDto) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        return appointmentService.scheduleAppointment(
                patient, doctor, timeDto.getTime());
    }

    // ✅ RESCHEDULE APPOINTMENT
    @PutMapping("/api/receptionist/appointment-reschedule/{appointmentId}")
    public Appointment rescheduleAppointment(
            @PathVariable Long appointmentId,
            @RequestBody TimeDto timeDto) {

        return appointmentService.rescheduleAppointment(
                appointmentId, timeDto.getTime());
    }

    @DeleteMapping("/api/receptionist/appointment/{id}")
public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
    appointmentRepository.deleteById(id);
    return ResponseEntity.ok().build();
}

}