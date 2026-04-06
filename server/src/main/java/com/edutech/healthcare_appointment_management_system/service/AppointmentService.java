package com.edutech.healthcare_appointment_management_system.service;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.entity.DoctorAvailabilitySlot;
import com.edutech.healthcare_appointment_management_system.entity.SlotStatus;

import com.edutech.healthcare_appointment_management_system.repository.AppointmentRepository;
import com.edutech.healthcare_appointment_management_system.repository.DoctorAvailabilitySlotRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorAvailabilitySlotRepository slotRepository;

    /* ===================== COMMON VALIDATIONS ===================== */

    private void validateNotNullTime(LocalDateTime time, String msg) {
        if (time == null) {
            throw new RuntimeException(msg);
        }
    }

    private void validateNotPast(LocalDateTime time, String msg) {
        if (time.isBefore(LocalDateTime.now())) {
            throw new RuntimeException(msg);
        }
    }

    private void validateDoctorNotNull(Doctor doctor) {
        if (doctor == null) {
            throw new RuntimeException("Doctor is required");
        }
    }

    private void validatePatientNotNull(Patient patient) {
        if (patient == null) {
            throw new RuntimeException("Patient is required");
        }
    }

    /* ===================== SCHEDULE APPOINTMENT (PATIENT/RECEPTIONIST) ===================== */
    /**
     * ✅ Slot-based booking:
     * - Slot must exist
     * - Slot must be AVAILABLE
     * - When booked, slot becomes BOOKED and stores patient + appointment info
     */
    @Transactional
    public Appointment scheduleAppointment(Patient patient, Doctor doctor, LocalDateTime time) {

        validatePatientNotNull(patient);
        validateDoctorNotNull(doctor);
        validateNotNullTime(time, "Appointment time is required");
        validateNotPast(time, "Appointment time cannot be in the past");

        // ✅ Slot must exist (doctor must generate slots first)
        DoctorAvailabilitySlot slot = slotRepository.findByDoctorAndSlotStart(doctor, time)
                .orElseThrow(() -> new RuntimeException("Slot not found. Doctor must generate slots first."));

        // ✅ Slot must be AVAILABLE
        if (slot.getStatus() == SlotStatus.BLOCKED) {
            throw new RuntimeException("Doctor blocked this slot");
        }
        if (slot.getStatus() == SlotStatus.BOOKED) {
            throw new RuntimeException("Slot already booked");
        }

        // ✅ double-safety conflict prevention
        if (appointmentRepository.existsByDoctorAndAppointmentTime(doctor, time)) {
            throw new RuntimeException("Slot already booked");
        }

        Appointment a = new Appointment();
        a.setPatient(patient);
        a.setDoctor(doctor);
        a.setAppointmentTime(time);
        a.setStatus("SCHEDULED");
        a.setCompletionstatus("PENDING");

        Appointment saved = appointmentRepository.save(a);

        // ✅ Mark slot as BOOKED and store why locked (doctor can see)
        slot.setStatus(SlotStatus.BOOKED);
        slot.setBookedAppointmentId(saved.getId());
        slot.setBookedPatientId(patient.getId());
        slot.setBookedPatientName(patient.getUsername());

        slotRepository.save(slot);

        return saved;
    }

    /* ===================== RESCHEDULE (RECEPTIONIST) ===================== */

    @Transactional
public Appointment rescheduleAppointment(Long appointmentId, LocalDateTime newTime) {

    Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

    if (newTime == null) throw new RuntimeException("New appointment time is required");
    if (newTime.isBefore(LocalDateTime.now())) throw new RuntimeException("Cannot reschedule to past time");

    Doctor doctor = appointment.getDoctor();
    Patient patient = appointment.getPatient();

    // ✅ Check new slot exists and is AVAILABLE
    DoctorAvailabilitySlot newSlot = slotRepository.findByDoctorAndSlotStart(doctor, newTime)
            .orElseThrow(() -> new RuntimeException("New slot not found"));

    if (newSlot.getStatus() == SlotStatus.BLOCKED) throw new RuntimeException("Doctor blocked this slot");
    if (newSlot.getStatus() == SlotStatus.BOOKED) throw new RuntimeException("Slot already booked");

    if (appointmentRepository.existsByDoctorAndAppointmentTimeAndIdNot(
        doctor, newTime, appointment.getId())) {
    throw new RuntimeException("Slot already booked");
    }

    // ✅ Free old slot (if exists)
    LocalDateTime oldTime = appointment.getAppointmentTime();
    if (oldTime != null) {
        slotRepository.findByDoctorAndSlotStart(doctor, oldTime).ifPresent(oldSlot -> {
            // only free if it was booked by this appointment
            if (oldSlot.getBookedAppointmentId() != null && oldSlot.getBookedAppointmentId().equals(appointment.getId())) {
                oldSlot.setStatus(SlotStatus.AVAILABLE);
                oldSlot.setBookedAppointmentId(null);
                oldSlot.setBookedPatientId(null);
                oldSlot.setBookedPatientName(null);
                slotRepository.save(oldSlot);
            }
        });
    }

    // ✅ Book new slot
    newSlot.setStatus(SlotStatus.BOOKED);
    newSlot.setBookedAppointmentId(appointment.getId());
    newSlot.setBookedPatientId(patient.getId());
    newSlot.setBookedPatientName(patient.getUsername());
    slotRepository.save(newSlot);

    // ✅ Update appointment
    appointment.setAppointmentTime(newTime);
    appointment.setStatus("RESCHEDULED");

    return appointmentRepository.save(appointment);
}

    /* ===================== CANCEL APPOINTMENT ===================== */

    public Appointment cancelAppointment(Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getAppointmentTime() != null
                && appointment.getAppointmentTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot cancel past appointment");
        }

        appointment.setStatus("CANCELLED");
        return appointmentRepository.save(appointment);
    }

    /* ===================== READ OPERATIONS ===================== */

    public List<Appointment> getAppointmentsByPatient(Patient patient) {
        return appointmentRepository.findByPatient(patient);
    }

    public List<Appointment> getAppointmentsByDoctor(Doctor doctor) {
        return appointmentRepository.findByDoctor(doctor);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getAppointmentsForDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    /* ===================== COMPLETION STATUS ===================== */

    public Appointment markAppointmentCompleted(Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setCompletionstatus("COMPLETED");
        return appointmentRepository.save(appointment);
    }

    public Appointment updateCompletionStatus(Long id, String status) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (status == null || status.trim().isEmpty()) {
            throw new RuntimeException("Completion status is required");
        }

        appointment.setCompletionstatus(status);
        return appointmentRepository.save(appointment);
    }

    /* ===================== DOCTOR RESCHEDULE (SLOT AWARE) ===================== */
@Transactional
public Appointment doctorRescheduleAppointment(Long appointmentId, LocalDateTime newTime) {

    Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

    // ❌ Cannot reschedule completed appointments
    if ("COMPLETED".equalsIgnoreCase(appointment.getCompletionstatus())) {
        throw new RuntimeException("Completed appointments cannot be rescheduled");
    }

    // ✅ 5-hour rule
    if (appointment.getAppointmentTime() != null) {
        long hoursLeft = Duration
                .between(LocalDateTime.now(), appointment.getAppointmentTime())
                .toHours();

        if (hoursLeft < 2) {
            throw new RuntimeException(
                    "Rescheduling allowed only at least 5 hours before appointment time");
        }
    }

    // ✅ Delegate to SLOT-AWARE reschedule
    return rescheduleAppointment(appointmentId, newTime);
}
}