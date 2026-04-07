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

    private static final int START_HOUR = 9;      
    private static final int END_HOUR = 21;    
    private static final int MAX_DAYS_AHEAD = 10; 

    @Autowired
    public DoctorService(DoctorRepository doctorRepository,
                         DoctorAvailabilitySlotRepository slotRepository) {
        this.doctorRepository = doctorRepository;
        this.slotRepository = slotRepository;
    }



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

 
    public void generateSlotsForNext10Days(Long doctorId) {

        Doctor doctor = getDoctorById(doctorId);
        LocalDate today = LocalDate.now();

        for (int d = 0; d <= MAX_DAYS_AHEAD; d++) {
            LocalDate date = today.plusDays(d);

            for (int hour = START_HOUR; hour < END_HOUR; hour++) {
                LocalDateTime slotStart = date.atTime(hour, 0);

                slotRepository.findByDoctorAndSlotStart(doctor, slotStart)
                        .orElseGet(() -> {
                            DoctorAvailabilitySlot slot = new DoctorAvailabilitySlot();
                            slot.setDoctor(doctor);
                            slot.setSlotStart(slotStart);
                            slot.setStatus(SlotStatus.AVAILABLE);
                            return slotRepository.save(slot);
                        });
            }
        }
    }

    public List<DoctorAvailabilitySlot> getSlotsForDoctorOnDate(Long doctorId, LocalDate date) {

        Doctor doctor = getDoctorById(doctorId);

        LocalDateTime start = date.atTime(START_HOUR, 0);
        LocalDateTime end = date.atTime(END_HOUR, 0);

        return slotRepository.findByDoctorAndSlotStartBetween(doctor, start, end);
    }


    public DoctorAvailabilitySlot setSlotAvailability(Long doctorId, LocalDateTime slotStart, boolean available) {

        Doctor doctor = getDoctorById(doctorId);

        DoctorAvailabilitySlot slot = slotRepository.findByDoctorAndSlotStart(doctor, slotStart)
                .orElseThrow(() -> new RuntimeException("Slot not found. Generate slots first."));

        
        if (slot.getStatus() == SlotStatus.BOOKED) {
            throw new RuntimeException("Booked slot cannot be modified");
        }

        slot.setStatus(available ? SlotStatus.AVAILABLE : SlotStatus.BLOCKED);
        return slotRepository.save(slot);
    }
}