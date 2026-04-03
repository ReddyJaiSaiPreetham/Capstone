package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;
import com.edutech.healthcare_appointment_management_system.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor/medicalrecords")
public class DoctorMedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    /**
     * ✅ Doctor creates a medical record + prescription items
     * Request Body: MedicalRecord { diagnosis, treatment, prescriptionItems[] }
     * Params: patientId, doctorId
     */
    @PostMapping
    public ResponseEntity<?> createMedicalRecord(
            @RequestParam Long patientId,
            @RequestParam Long doctorId,
            @RequestBody MedicalRecord body
    ) {
        try {
            MedicalRecord saved = medicalRecordService.createMedicalRecord(patientId, doctorId, body);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * ✅ Doctor edits an existing medical record (replaces medicines list)
     * Params: doctorId (for authorization check in service)
     */
    @PutMapping("/{recordId}")
    public ResponseEntity<?> updateMedicalRecord(
            @PathVariable Long recordId,
            @RequestParam Long doctorId,
            @RequestBody MedicalRecord body
    ) {
        try {
            MedicalRecord updated = medicalRecordService.updateMedicalRecord(recordId, doctorId, body);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * ✅ Doctor views a single medical record (optional)
     * (If you want strict doctor-only access, we can validate doctorId ownership in service later.)
     */
    @GetMapping("/{recordId}")
    public ResponseEntity<?> getRecordById(@PathVariable Long recordId) {
        try {
            MedicalRecord record = medicalRecordService.getMedicalRecordById(recordId);
            return ResponseEntity.ok(record);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * ✅ Doctor views all records created by doctor (optional)
     */
    @GetMapping
    public ResponseEntity<?> getRecordsByDoctor(@RequestParam Long doctorId) {
        try {
            List<MedicalRecord> records = medicalRecordService.getMedicalRecordsByDoctor(doctorId);
            return ResponseEntity.ok(records);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}