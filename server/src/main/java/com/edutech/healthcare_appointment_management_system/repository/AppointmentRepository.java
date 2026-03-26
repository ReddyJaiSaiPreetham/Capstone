package com.edutech.healthcare_appointment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;

import java.util.Date;
import java.util.List;

import javax.print.Doc;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment,Long> {
    List<Appointment> findByPatient(Patient patient);
    
    List<Appointment> findByDoctor(Doctor doctor);

    List<Appointment> findByStatus(String status);

    boolean existsByDoctorAndAppointmentTime(Doctor doctor, Date appointmentTime);

    List<Appointment> findByDoctorAndAppointmentTimeBetween(
            Doctor doctor,
            Date startTime,
            Date endTime
    );


}
