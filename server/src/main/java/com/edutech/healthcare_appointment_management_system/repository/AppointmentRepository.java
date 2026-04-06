package com.edutech.healthcare_appointment_management_system.repository;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient(Patient patient);

    List<Appointment> findByDoctor(Doctor doctor);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByStatus(String status);

    // ✅ Updated: Date → LocalDateTime
    
 boolean existsByDoctorAndAppointmentTime(Doctor doctor, LocalDateTime appointmentTime);

    // ✅ Used while rescheduling (exclude same appointment)
    boolean existsByDoctorAndAppointmentTimeAndIdNot(
            Doctor doctor,
            LocalDateTime appointmentTime,
            Long id
    );


    // ✅ Updated: Date → LocalDateTime
    List<Appointment> findByDoctorAndAppointmentTimeBetween(
            Doctor doctor,
            LocalDateTime startTime,
            LocalDateTime endTime
    );
}
