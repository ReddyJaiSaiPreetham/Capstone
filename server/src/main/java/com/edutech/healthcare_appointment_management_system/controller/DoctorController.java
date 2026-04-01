package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;
import com.edutech.healthcare_appointment_management_system.service.DoctorService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class DoctorController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorService doctorService;

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
}