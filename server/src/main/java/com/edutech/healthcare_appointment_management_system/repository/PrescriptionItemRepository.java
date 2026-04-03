package com.edutech.healthcare_appointment_management_system.repository;

import com.edutech.healthcare_appointment_management_system.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, Long> {

    // ✅ Get all medicines for a medical record
    List<PrescriptionItem> findByMedicalRecordId(Long medicalRecordId);
}