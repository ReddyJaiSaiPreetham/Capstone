package com.edutech.healthcare_appointment_management_system.service;

import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.DoctorAvailabilitySlot;
import com.edutech.healthcare_appointment_management_system.entity.SlotStatus;
import com.edutech.healthcare_appointment_management_system.repository.DoctorAvailabilitySlotRepository;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilitySlotRepository slotRepository;

    private static final int START_HOUR = 9;      // 9 AM
    private static final int END_HOUR = 21;       // 9 PM (last slot start = 20:00)
    private static final int MAX_DAYS_AHEAD = 10; // booking window

    @Autowired
    public DoctorService(DoctorRepository doctorRepository,
                         DoctorAvailabilitySlotRepository slotRepository) {
        this.doctorRepository = doctorRepository;
        this.slotRepository = slotRepository;
    }

    /* ================= EXISTING METHODS ================= */

    public Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor updateAvailability(Long doctorId, String availability) {
        Doctor doctor = getDoctorById(doctorId);
        doctor.setAvailability(availability);
        return doctorRepository.save(doctor);
    }

    /* ================= SLOT BASED FEATURES ================= */

    // ✅ Generate slots for next 10 days (including today)
    // Default status: AVAILABLE
    public void generateSlotsForNext10Days(Long doctorId) {

        Doctor doctor = getDoctorById(doctorId);
        LocalDate today = LocalDate.now();

        for (int d = 0; d <= MAX_DAYS_AHEAD; d++) {
            LocalDate date = today.plusDays(d);

            // slotStart: 09:00..20:00 (20:00-21:00 is last slot)
            for (int hour = START_HOUR; hour < END_HOUR; hour++) {
                LocalDateTime slotStart = date.atTime(hour, 0);

                slotRepository.findByDoctorAndSlotStart(doctor, slotStart)
                        .orElseGet(() -> {
                            DoctorAvailabilitySlot slot = new DoctorAvailabilitySlot();
                            slot.setDoctor(doctor);
                            slot.setSlotStart(slotStart);
                            slot.setStatus(SlotStatus.AVAILABLE); // ✅ STATUS BASED
                            return slotRepository.save(slot);
                        });
            }
        }
    }

    // ✅ Fetch all slots for a date (Doctor view wants AVAILABLE/BLOCKED/BOOKED)
    public List<DoctorAvailabilitySlot> getSlotsForDoctorOnDate(Long doctorId, LocalDate date) {

        Doctor doctor = getDoctorById(doctorId);

        LocalDateTime start = date.atTime(START_HOUR, 0);
        LocalDateTime end = date.atTime(END_HOUR, 0);

        return slotRepository.findByDoctorAndSlotStartBetween(doctor, start, end);
    }

    // ✅ Enable/Disable a slot (Doctor can toggle ONLY if not BOOKED)
    // available=true  -> AVAILABLE
    // available=false -> BLOCKED
    public DoctorAvailabilitySlot setSlotAvailability(Long doctorId, LocalDateTime slotStart, boolean available) {

        Doctor doctor = getDoctorById(doctorId);

        DoctorAvailabilitySlot slot = slotRepository.findByDoctorAndSlotStart(doctor, slotStart)
                .orElseThrow(() -> new RuntimeException("Slot not found. Generate slots first."));

        // 🔒 If patient booked it, doctor cannot modify
        if (slot.getStatus() == SlotStatus.BOOKED) {
            throw new RuntimeException("Booked slot cannot be modified");
        }

        slot.setStatus(available ? SlotStatus.AVAILABLE : SlotStatus.BLOCKED);
        return slotRepository.save(slot);
    }
}