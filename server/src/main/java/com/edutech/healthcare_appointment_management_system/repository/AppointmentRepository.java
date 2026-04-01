package com.edutech.healthcare_appointment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;

import java.util.Date;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // ✅ FIXED: use ID instead of object
    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByStatus(String status);

    boolean existsByDoctorAndAppointmentTime(Doctor doctor, Date appointmentTime);

    List<Appointment> findByDoctorAndAppointmentTimeBetween(
            Doctor doctor,
            Date startTime,
            Date endTime
    );
}

