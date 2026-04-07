package com.edutech.healthcare_appointment_management_system.service;

import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.entity.PrescriptionItem;
import com.edutech.healthcare_appointment_management_system.repository.MedicalRecordRepository;
import com.edutech.healthcare_appointment_management_system.repository.PrescriptionItemRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired(required = false)
    private PrescriptionItemRepository prescriptionItemRepository; 

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;


    @Transactional
    public MedicalRecord createMedicalRecord(Long patientId, Long doctorId, MedicalRecord incoming) {

        if (incoming == null) {
            throw new RuntimeException("Medical record data is required");
        }

        Patient patient = patientService.getPatientById(patientId);
        Doctor doctor = doctorService.getDoctorById(doctorId);

        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setDoctor(doctor);

        record.setDiagnosis(incoming.getDiagnosis());
        record.setTreatment(incoming.getTreatment());

        if (incoming.getPrescriptionItems() != null) {
            for (PrescriptionItem item : incoming.getPrescriptionItems()) {
                validatePrescriptionItem(item);
                record.addPrescriptionItem(cleanItem(item)); 
            }
        }

        return medicalRecordRepository.save(record);
    }


    @Transactional
    public MedicalRecord updateMedicalRecord(Long recordId, Long doctorId, MedicalRecord incoming) {

        MedicalRecord existing = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Medical record not found"));

        if (existing.getDoctor() == null || existing.getDoctor().getId() == null) {
            throw new RuntimeException("Record has no doctor mapping");
        }

        if (!existing.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("You are not allowed to edit this prescription");
        }

        existing.setDiagnosis(incoming.getDiagnosis());
        existing.setTreatment(incoming.getTreatment());

        existing.getPrescriptionItems().clear(); 

        if (incoming.getPrescriptionItems() != null) {
            for (PrescriptionItem item : incoming.getPrescriptionItems()) {
                validatePrescriptionItem(item);
                existing.addPrescriptionItem(cleanItem(item));
            }
        }

        return medicalRecordRepository.save(existing);
    }

  
    public List<MedicalRecord> getMedicalRecordsByPatient(Long patientId) {
        return medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
    }

    public List<MedicalRecord> getMedicalRecordsByDoctor(Long doctorId) {
        return medicalRecordRepository.findByDoctorIdOrderByRecordDateDesc(doctorId);
    }

 
    public MedicalRecord getMedicalRecordById(Long recordId) {
        return medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Medical record not found"));
    }

   

    private void validatePrescriptionItem(PrescriptionItem item) {
        if (item == null) throw new RuntimeException("Prescription item is required");
        if (item.getMedicineName() == null || item.getMedicineName().trim().isEmpty()) {
            throw new RuntimeException("Medicine name is required");
        }
        if (item.getDosage() == null || item.getDosage().trim().isEmpty()) {
            throw new RuntimeException("Dosage is required");
        }
        if (item.getFrequency() == null || item.getFrequency().trim().isEmpty()) {
            throw new RuntimeException("Frequency is required");
        }
        if (item.getDays() == null || item.getDays() <= 0) {
            throw new RuntimeException("Days must be greater than 0");
        }
    }

    private PrescriptionItem cleanItem(PrescriptionItem item) {
        PrescriptionItem clean = new PrescriptionItem();
        clean.setMedicineName(item.getMedicineName());
        clean.setDosage(item.getDosage());
        clean.setFrequency(item.getFrequency());
        clean.setDays(item.getDays());
        clean.setInstructions(item.getInstructions());
        return clean;
    }
}