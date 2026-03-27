package com.edutech.healthcare_appointment_management_system.service;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.repository.AppointmentRepository;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;
import com.edutech.healthcare_appointment_management_system.repository.PatientRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    // ✅ Convert String → Date ("yyyy-MM-dd HH:mm:ss")
    private Date parseDate(String time) {
        try {
            return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse(time);
        } catch (Exception e) {
            throw new RuntimeException("Invalid time format! Use: yyyy-MM-dd HH:mm:ss");
        }
    }

    // ✅ Schedule Appointment (Patient)
    public Appointment scheduleAppointment(Long patientId, Long doctorId, String time) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        Date appointmentTime = parseDate(time);

        // ✅ Check doctor availability for same time
        if (appointmentRepository.existsByDoctorAndAppointmentTime(doctor, appointmentTime)) {
            throw new RuntimeException("Doctor already has an appointment at this time");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentTime(appointmentTime);
        appointment.setStatus("SCHEDULED");

        return appointmentRepository.save(appointment);
    }

    // ✅ Reschedule Appointment (Receptionist)
    public Appointment rescheduleAppointment(Long appointmentId, String newTime) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        Date updatedTime = parseDate(newTime);

        if (appointmentRepository.existsByDoctorAndAppointmentTime(appointment.getDoctor(), updatedTime)) {
            throw new RuntimeException("Doctor already has another appointment at this time");
        }

        appointment.setAppointmentTime(updatedTime);
        appointment.setStatus("RESCHEDULED");

        return appointmentRepository.save(appointment);
    }

    // ✅ Patient: View all appointments
    public List<Appointment> getAppointmentsByPatientId(Long patientId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

        return appointmentRepository.findByPatient(patient);
    }

    // ✅ Doctor: View all appointments
    public List<Appointment> getAppointmentsByDoctorId(Long doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        return appointmentRepository.findByDoctor(doctor);
    }

    // ✅ Receptionist: View ALL appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }



    // ✅ GET APPOINTMENTS BY DOCTOR
    public List<Appointment> getAppointmentsByDoctor(Doctor doctor) {
        return appointmentRepository.findByDoctor(doctor);
    }

    // ✅ SCHEDULE APPOINTMENT
    public Appointment scheduleAppointment(Patient patient, Doctor doctor, Date time) {

        // Optional validation (recommended)
        if (appointmentRepository.existsByDoctorAndAppointmentTime(doctor, time)) {
            throw new RuntimeException("Doctor already has an appointment at this time");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentTime(time);
        appointment.setStatus("SCHEDULED");

        return appointmentRepository.save(appointment);
    }

    // ✅ GET APPOINTMENTS BY PATIENT
    public List<Appointment> getAppointmentsByPatient(Patient patient) {
        return appointmentRepository.findByPatient(patient);
    }

}