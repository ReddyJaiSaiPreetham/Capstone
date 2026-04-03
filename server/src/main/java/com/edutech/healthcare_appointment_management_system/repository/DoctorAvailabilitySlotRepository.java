package com.edutech.healthcare_appointment_management_system.repository;

import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.DoctorAvailabilitySlot;
import com.edutech.healthcare_appointment_management_system.entity.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilitySlotRepository extends JpaRepository<DoctorAvailabilitySlot, Long> {

    Optional<DoctorAvailabilitySlot> findByDoctorAndSlotStart(Doctor doctor, LocalDateTime slotStart);

    List<DoctorAvailabilitySlot> findByDoctorAndSlotStartBetween(
            Doctor doctor,
            LocalDateTime start,
            LocalDateTime end
    );

    // ✅ Status-based: AVAILABLE / BLOCKED / BOOKED
    List<DoctorAvailabilitySlot> findByDoctorAndSlotStartBetweenAndStatus(
            Doctor doctor,
            LocalDateTime start,
            LocalDateTime end,
            SlotStatus status
    );
}