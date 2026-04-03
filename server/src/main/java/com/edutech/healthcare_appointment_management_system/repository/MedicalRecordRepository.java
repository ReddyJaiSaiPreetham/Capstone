package com.edutech.healthcare_appointment_management_system.repository;

import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    // ✅ Patient: view their records (latest first)
    List<MedicalRecord> findByPatientIdOrderByRecordDateDesc(Long patientId);

    // ✅ Doctor: view records created by them (optional)
    List<MedicalRecord> findByDoctorIdOrderByRecordDateDesc(Long doctorId);

    // ✅ If you later link MedicalRecord to Appointment (recommended), enable this:
    // Optional<MedicalRecord> findByAppointmentId(Long appointmentId);
}