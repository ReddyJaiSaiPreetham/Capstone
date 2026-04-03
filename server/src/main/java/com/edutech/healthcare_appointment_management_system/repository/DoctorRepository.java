package com.edutech.healthcare_appointment_management_system.repository;

import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // Optional helper if you use username lookup anywhere
    Optional<Doctor> findByUsername(String username);

    List<Doctor> findByAvailability(String availability);

    List<Doctor> findBySpecialty(String specialty);
}