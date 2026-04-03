package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;
import com.edutech.healthcare_appointment_management_system.service.MedicalRecordService;
import com.edutech.healthcare_appointment_management_system.service.PrescriptionPdfService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient/medicalrecords")
public class PatientMedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Autowired
    private PrescriptionPdfService prescriptionPdfService;

    @GetMapping
    public ResponseEntity<?> getMyRecords(@RequestParam Long patientId) {
        try {
            List<MedicalRecord> records = medicalRecordService.getMedicalRecordsByPatient(patientId);
            return ResponseEntity.ok(records);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/{recordId}")
    public ResponseEntity<?> getRecord(@PathVariable Long recordId) {
        try {
            MedicalRecord record = medicalRecordService.getMedicalRecordById(recordId);
            return ResponseEntity.ok(record);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/{recordId}/pdf")
    public ResponseEntity<byte[]> downloadPrescriptionPdf(@PathVariable Long recordId) {

        MedicalRecord record = medicalRecordService.getMedicalRecordById(recordId);
        byte[] pdfBytes = prescriptionPdfService.generatePrescriptionPdf(record);

        String fileName = "prescription_" + recordId + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
    @GetMapping("/medicalrecords")
    public List<MedicalRecord> getMedicalRecords(@RequestParam Long patientId) {
        return medicalRecordService.getMedicalRecordsByPatient(patientId);
    }
}