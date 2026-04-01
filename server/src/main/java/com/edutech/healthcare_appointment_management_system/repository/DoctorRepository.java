package com.edutech.healthcare_appointment_management_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor,Long>{
    
    List<Doctor> findByAvailability(String availability);
    List<Doctor> findBySpecialty(String specialty);

}
