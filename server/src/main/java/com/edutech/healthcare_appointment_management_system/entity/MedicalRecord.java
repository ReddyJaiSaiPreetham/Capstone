package com.edutech.healthcare_appointment_management_system.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.*;

@Entity
public class MedicalRecord {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   private String diagnosis;

   private String treatment;

   private LocalDateTime recordDate;

   @ManyToOne
   private Patient patient;

   @ManyToOne
   private Doctor doctor;

   @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
   private List<PrescriptionItem> prescriptionItems = new ArrayList<>();

   public MedicalRecord() {}

   @PrePersist
   public void onCreate() {
      this.recordDate = LocalDateTime.now();
   }

   @PreUpdate
   public void onUpdate() {
      this.recordDate = LocalDateTime.now();
   }


   public Long getId() {
      return id;
   }

   public void setId(Long id) {
      this.id = id;
   }

   public String getDiagnosis() {
      return diagnosis;
   }

   public void setDiagnosis(String diagnosis) {
      this.diagnosis = diagnosis;
   }

   public String getTreatment() {
      return treatment;
   }

   public void setTreatment(String treatment) {
      this.treatment = treatment;
   }

   public LocalDateTime getRecordDate() {
      return recordDate;
   }

   public void setRecordDate(LocalDateTime recordDate) {
      this.recordDate = recordDate;
   }

   public Patient getPatient() {
      return patient;
   }

   public void setPatient(Patient patient) {
      this.patient = patient;
   }

   public Doctor getDoctor() {
      return doctor;
   }

   public void setDoctor(Doctor doctor) {
      this.doctor = doctor;
   }

   public List<PrescriptionItem> getPrescriptionItems() {
      return prescriptionItems;
   }

   public void setPrescriptionItems(List<PrescriptionItem> prescriptionItems) {
      this.prescriptionItems = prescriptionItems;
   }

   public void addPrescriptionItem(PrescriptionItem item) {
      prescriptionItems.add(item);
      item.setMedicalRecord(this);
   }

   public void removePrescriptionItem(PrescriptionItem item) {
      prescriptionItems.remove(item);
      item.setMedicalRecord(null);
   }
}