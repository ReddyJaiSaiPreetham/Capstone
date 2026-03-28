package com.edutech.healthcare_appointment_management_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    @Autowired
    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // ✅ Get doctor by ID
    public Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));
    }

    // ✅ Get all doctors
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // ✅ Update doctor availability
    public Doctor updateAvailability(Long doctorId, String availability) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        doctor.setAvailability(availability);
        return doctorRepository.save(doctor);
    }


}