package com.edutech.healthcare_appointment_management_system.repository;

import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {


    List<MedicalRecord> findByPatientIdOrderByRecordDateDesc(Long patientId);

    List<MedicalRecord> findByDoctorIdOrderByRecordDateDesc(Long doctorId);

}