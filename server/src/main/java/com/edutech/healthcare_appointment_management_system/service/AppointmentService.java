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
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorAvailabilitySlotRepository slotRepository;

    // ✅ FIX: Always interpret incoming LocalDateTime as IST for comparisons
    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    private Instant toIstInstant(LocalDateTime dt) {
        return dt.atZone(IST).toInstant();
    }

    /* ===================== COMMON VALIDATIONS ===================== */

    private void validateNotNullTime(LocalDateTime time, String msg) {
        if (time == null) {
            throw new RuntimeException(msg);
        }
    }

    // ✅ FIXED (timezone-safe)
    private void validateNotPast(LocalDateTime time, String msg) {
        Instant nowInstant = Instant.now();
        Instant timeInstant = toIstInstant(time);
        if (!timeInstant.isAfter(nowInstant)) {
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

        // ✅ Doctor must be active (already correct)
        if (doctor == null || !doctor.isActive()) {
            throw new RuntimeException("Doctor is inactive. Cannot book appointment.");
        }

        // ✅ Doctor availability (optional but good)
        if (!"Yes".equalsIgnoreCase(doctor.getAvailability())) {
            throw new RuntimeException("Doctor is currently unavailable.");
        }

        validatePatientNotNull(patient);
        validateDoctorNotNull(doctor);

        if (time == null) {
            throw new RuntimeException("Appointment time is required");
        }

        // ✅ STRICT check: block past date AND past time (timezone-safe)
        validateNotPast(time, "Cannot book appointment for past date or time.");

        // ✅ Slot must exist
        DoctorAvailabilitySlot slot = slotRepository.findByDoctorAndSlotStart(doctor, time)
                .orElseThrow(() -> new RuntimeException("Slot not found. Doctor must generate slots first."));

        if (slot.getStatus() == SlotStatus.BLOCKED) {
            throw new RuntimeException("Doctor blocked this slot");
        }
        if (slot.getStatus() == SlotStatus.BOOKED) {
            throw new RuntimeException("Slot already booked");
        }

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

        // ✅ FIX: timezone-safe past check (same intention)
        validateNotPast(newTime, "Cannot reschedule to past time");

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

        if (appointment.getAppointmentTime() != null) {
            // ✅ FIX: timezone-safe check
            Instant nowInstant = Instant.now();
            Instant apptInstant = toIstInstant(appointment.getAppointmentTime());
            if (!apptInstant.isAfter(nowInstant)) {
                throw new RuntimeException("Cannot cancel past appointment");
            }
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

        // ✅ 5-hour rule block (your existing logic kept, only timezone-safe)
        if (appointment.getAppointmentTime() != null) {

            Instant nowInstant = Instant.now();
            Instant apptInstant = toIstInstant(appointment.getAppointmentTime());

            long hoursLeft = Duration.between(nowInstant, apptInstant).toHours();

            if (hoursLeft < 2) {
                throw new RuntimeException(
                        "Rescheduling allowed only at least 5 hours before appointment time");
            }
        }

        // ✅ Delegate to SLOT-AWARE reschedule
        return rescheduleAppointment(appointmentId, newTime);
    }

    @Transactional
    public void deleteAppointmentByReceptionist(Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Doctor doctor = appointment.getDoctor();
        LocalDateTime apptTime = appointment.getAppointmentTime();

        // ✅ Free the slot if it exists
        if (doctor != null && apptTime != null) {
            slotRepository.findByDoctorAndSlotStart(doctor, apptTime)
                    .ifPresent(slot -> {
                        // free only if this appointment booked it
                        if (slot.getBookedAppointmentId() != null &&
                                slot.getBookedAppointmentId().equals(appointment.getId())) {

                            slot.setStatus(SlotStatus.AVAILABLE);
                            slot.setBookedAppointmentId(null);
                            slot.setBookedPatientId(null);
                            slot.setBookedPatientName(null);
                            slotRepository.save(slot);
                        }
                    });
        }

        // ✅ Delete appointment AFTER freeing slot
        appointmentRepository.delete(appointment);
    }
}