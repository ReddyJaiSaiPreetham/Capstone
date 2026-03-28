package com.edutech.healthcare_appointment_management_system.service;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.repository.AppointmentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // ✅ Schedule appointment (Patient / Receptionist)
    public Appointment scheduleAppointment(
            Patient patient,
            Doctor doctor,
            Date time) {

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentTime(time);
        appointment.setStatus("SCHEDULED");

        return appointmentRepository.save(appointment);
    }

    // ✅ Reschedule appointment (Receptionist)
    public Appointment rescheduleAppointment(
            Long appointmentId,
            Date newTime) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() ->
                        new RuntimeException("Appointment not found"));

        appointment.setAppointmentTime(newTime);
        appointment.setStatus("RESCHEDULED");

        return appointmentRepository.save(appointment);
    }

    // ✅ Patient: view appointments
    public List<Appointment> getAppointmentsByPatient(Patient patient) {
        return appointmentRepository.findByPatient(patient);
    }

    // ✅ Doctor: view appointments
    public List<Appointment> getAppointmentsByDoctor(Doctor doctor) {
        return appointmentRepository.findByDoctor(doctor);
    }

    // ✅ Receptionist: view all
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}