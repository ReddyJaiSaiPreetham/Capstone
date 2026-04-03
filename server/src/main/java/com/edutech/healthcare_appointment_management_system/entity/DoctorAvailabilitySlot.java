package com.edutech.healthcare_appointment_management_system.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "doctor_availability_slot",
        uniqueConstraints = @UniqueConstraint(columnNames = {"doctor_id", "slot_start"})
)
public class DoctorAvailabilitySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(name = "slot_start", nullable = false)
    private LocalDateTime slotStart;

    // ✅ NEW: status instead of boolean
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotStatus status = SlotStatus.AVAILABLE;

    // ✅ NEW: booking details (for doctor visibility)
    private Long bookedAppointmentId;
    private Long bookedPatientId;
    private String bookedPatientName;

    public DoctorAvailabilitySlot() {}

    public DoctorAvailabilitySlot(Doctor doctor, LocalDateTime slotStart, SlotStatus status) {
        this.doctor = doctor;
        this.slotStart = slotStart;
        this.status = status;
    }

    public Long getId() { return id; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public LocalDateTime getSlotStart() { return slotStart; }
    public void setSlotStart(LocalDateTime slotStart) { this.slotStart = slotStart; }

    public SlotStatus getStatus() { return status; }
    public void setStatus(SlotStatus status) { this.status = status; }

    public Long getBookedAppointmentId() { return bookedAppointmentId; }
    public void setBookedAppointmentId(Long bookedAppointmentId) { this.bookedAppointmentId = bookedAppointmentId; }

    public Long getBookedPatientId() { return bookedPatientId; }
    public void setBookedPatientId(Long bookedPatientId) { this.bookedPatientId = bookedPatientId; }

    public String getBookedPatientName() { return bookedPatientName; }
    public void setBookedPatientName(String bookedPatientName) { this.bookedPatientName = bookedPatientName; }
}




























// package com.edutech.healthcare_appointment_management_system.entity;

// import javax.persistence.*;
// import java.time.LocalDateTime;

// @Entity
// @Table(name = "doctor_availability_slot",
//        uniqueConstraints = @UniqueConstraint(columnNames = {"doctor_id", "slot_start"}))
// public class DoctorAvailabilitySlot {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @ManyToOne(optional = false)
//     private Doctor doctor;

//     @Column(name = "slot_start", nullable = false)
//     private LocalDateTime slotStart;

//     @Column(name = "available", nullable = false)
//     private Boolean available = true;

//     public DoctorAvailabilitySlot() {}

//     public DoctorAvailabilitySlot(Doctor doctor, LocalDateTime slotStart, boolean available) {
//         this.doctor = doctor;
//         this.slotStart = slotStart;
//         this.available = available;
//     }

//     public Long getId() { return id; }

//     public Doctor getDoctor() { return doctor; }
//     public void setDoctor(Doctor doctor) { this.doctor = doctor; }

//     public LocalDateTime getSlotStart() { return slotStart; }
//     public void setSlotStart(LocalDateTime slotStart) { this.slotStart = slotStart; }

//     public boolean isAvailable() { return available; }
//     public void setAvailable(boolean available) { this.available = available; }
// }

