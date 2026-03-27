package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.dto.TimeDto;
import com.edutech.healthcare_appointment_management_system.entity.*;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReceptionistController {

    @Autowired
    private AppointmentService appointmentService;

    // VIEW ALL APPOINTMENTS
    @GetMapping("/api/receptionist/appointments")
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    // SCHEDULE APPOINTMENT
    @PostMapping("/api/receptionist/appointment")
    public Appointment scheduleAppointment(
            @RequestParam Long patientId,
            @RequestParam Long doctorId,
            @RequestBody TimeDto timeDto) {

        Patient patient = new Patient();
        patient.setId(patientId);

        Doctor doctor = new Doctor();
        doctor.setId(doctorId);

        return appointmentService.scheduleAppointment(
                patient, doctor, timeDto.getTime());
    }
}