package com.edutech.healthcare_appointment_management_system.entity;

import javax.persistence.*;

@Entity
public class MedicalRecord {

   @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   private String diagnosis;
   private String treatment;

   @ManyToOne
   private Patient patient;

   @ManyToOne
   private Doctor doctor;

   public MedicalRecord() {}

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

   


}
