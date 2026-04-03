package com.edutech.healthcare_appointment_management_system.service;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // ✅ Schedule Appointment (LocalDateTime)
    public Appointment scheduleAppointment(Patient patient, Doctor doctor, LocalDateTime time) {

        if (time == null) {
            throw new RuntimeException("Appointment time is required");
        }

        if (time.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Appointment time cannot be in the past");
        }

        Appointment a = new Appointment();
        a.setPatient(patient);
        a.setDoctor(doctor);
        a.setAppointmentTime(time);
        a.setStatus("SCHEDULED");
        a.setCompletionstatus("PENDING");

        return appointmentRepository.save(a);
    }

    // ✅ Reschedule Appointment (LocalDateTime)
    public Appointment rescheduleAppointment(Long appointmentId, LocalDateTime newTime) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (newTime == null) {
            throw new RuntimeException("New appointment time is required");
        }

        if (newTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot reschedule appointment to past time");
        }

        appointment.setAppointmentTime(newTime);
        appointment.setStatus("RESCHEDULED");

        return appointmentRepository.save(appointment);
    }

    // ✅ Cancel Appointment (LocalDateTime)
    public Appointment cancelAppointment(Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // If appointmentTime is null, cancel is allowed (or you can block it)
        if (appointment.getAppointmentTime() != null &&
                appointment.getAppointmentTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot cancel past appointment");
        }

        appointment.setStatus("CANCELLED");
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByPatient(Patient patient) {
        return appointmentRepository.findByPatient(patient);
    }

    public List<Appointment> getAppointmentsByDoctor(Doctor doctor) {
        return appointmentRepository.findByDoctor(doctor);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getAppointmentsForDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    // ✅ Mark Completed
    public Appointment markAppointmentCompleted(Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setCompletionstatus("COMPLETED");
        return appointmentRepository.save(appointment);
    }

    // ✅ Update Completion Status
    public Appointment updateCompletionStatus(Long id, String status) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setCompletionstatus(status);
        return appointmentRepository.save(appointment);
    }

    // ✅ Doctor Reschedule with 5-hour rule (LocalDateTime)
    public Appointment doctorRescheduleAppointment(Long appointmentId, LocalDateTime newTime) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if ("COMPLETED".equals(appointment.getCompletionstatus())) {
            throw new RuntimeException("Completed appointments cannot be rescheduled");
        }

        if (newTime == null) {
            throw new RuntimeException("New appointment time is required");
        }

        if (newTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Appointment time cannot be in the past");
        }

        // ✅ Enforce 5-hour rule based on CURRENT appointment time
        if (appointment.getAppointmentTime() != null) {
            long hoursLeft = Duration.between(LocalDateTime.now(), appointment.getAppointmentTime()).toHours();
            if (hoursLeft < 5) {
                throw new RuntimeException("Rescheduling is allowed only at least 5 hours before appointment time");
            }
        }

        appointment.setAppointmentTime(newTime);
        appointment.setStatus("RESCHEDULED");

        return appointmentRepository.save(appointment);
    }
}