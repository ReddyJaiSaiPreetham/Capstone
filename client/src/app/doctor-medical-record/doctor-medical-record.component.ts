import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-doctor-medical-record',
  templateUrl: './doctor-medical-record.component.html',
  styleUrls: ['./doctor-medical-record.component.scss']
})
export class DoctorMedicalRecordComponent implements OnInit {

  recordForm!: FormGroup;

  // route params/query params
  recordId: number | null = null;
  patientId: number | null = null;
  doctorId: number | null = null;

  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // doctorId from localStorage (your project uses this)
    const d = localStorage.getItem('userId');
    this.doctorId = d ? parseInt(d, 10) : null;

    // recordId can come from route param OR query param
    const ridFromParam = this.route.snapshot.paramMap.get('recordId');
    const ridFromQuery = this.route.snapshot.queryParamMap.get('recordId');

    this.recordId = ridFromParam ? parseInt(ridFromParam, 10) : (ridFromQuery ? parseInt(ridFromQuery, 10) : null);

    // patientId comes from query param
    const pid = this.route.snapshot.queryParamMap.get('patientId');
    this.patientId = pid ? parseInt(pid, 10) : null;

    this.buildForm();

    // if editing, load record
    if (this.recordId) {
      this.loadRecord(this.recordId);
    } else {
      // add one empty medicine row by default
      this.addMedicine();
    }
  }

  /* ===================== FORM ===================== */

  private buildForm(): void {
    this.recordForm = this.fb.group({
      diagnosis: ['', [Validators.required, Validators.minLength(2)]],
      treatment: ['', [Validators.required, Validators.minLength(2)]],
      prescriptionItems: this.fb.array([])
    });
  }

  get prescriptionItems(): FormArray {
    return this.recordForm.get('prescriptionItems') as FormArray;
  }

  private createMedicineGroup(data?: any): FormGroup {
    return this.fb.group({
      medicineName: [data?.medicineName || '', Validators.required],
      dosage: [data?.dosage || '', Validators.required],
      frequency: [data?.frequency || '', Validators.required],
      days: [data?.days ?? 1, [Validators.required, Validators.min(1)]],
      instructions: [data?.instructions || '']
    });
  }

  addMedicine(data?: any): void {
    this.prescriptionItems.push(this.createMedicineGroup(data));
  }

  removeMedicine(index: number): void {
    if (this.prescriptionItems.length === 1) return; // keep at least 1 row
    this.prescriptionItems.removeAt(index);
  }

  /* ===================== LOAD (EDIT) ===================== */

  loadRecord(recordId: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.httpService.getMedicalRecordByIdForDoctor(recordId).subscribe({
      next: (record: any) => {
        this.loading = false;

        // patch main fields
        this.recordForm.patchValue({
          diagnosis: record?.diagnosis || '',
          treatment: record?.treatment || ''
        });

        // reset medicines array and load from backend
        this.prescriptionItems.clear();

        const items = record?.prescriptionItems || [];
        if (Array.isArray(items) && items.length > 0) {
          items.forEach((m: any) => this.addMedicine(m));
        } else {
          this.addMedicine();
        }

        // If patientId not supplied in query, try to get from record
        if (!this.patientId && record?.patient?.id) {
          this.patientId = record.patient.id;
        }
      },
      error: (err) => {
        console.error('Load medical record failed:', err);
        this.loading = false;
        this.errorMessage =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message || 'Failed to load medical record');
      }
    });
  }

  /* ===================== SAVE (CREATE/UPDATE) ===================== */

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.doctorId) {
      this.errorMessage = 'Doctor not logged in';
      return;
    }

    if (!this.patientId) {
      this.errorMessage = 'PatientId not provided (open this form from an appointment)';
      return;
    }

    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }

    const body = this.recordForm.value;

    // extra safety: ensure prescriptionItems exists
    if (!body.prescriptionItems || body.prescriptionItems.length === 0) {
      this.errorMessage = 'Please add at least one medicine';
      return;
    }

    this.loading = true;

    // CREATE
    if (!this.recordId) {
      this.httpService.createMedicalRecord(this.patientId, this.doctorId, body).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.successMessage = 'Prescription created successfully ✅';

          // if backend returns saved record, capture id and switch to edit mode
          if (res?.id) this.recordId = res.id;

          setTimeout(() => this.successMessage = '', 2500);
        },
        error: (err) => {
          console.error('Create record failed:', err);
          this.loading = false;
          this.errorMessage =
            typeof err?.error === 'string'
              ? err.error
              : (err?.error?.message || 'Failed to create prescription');
        }
      });
      return;
    }

    // UPDATE
    this.httpService.updateMedicalRecord(this.recordId, this.doctorId, body).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Prescription updated successfully ✅';
        setTimeout(() => this.successMessage = '', 2500);
      },
      error: (err) => {
        console.error('Update record failed:', err);
        this.loading = false;
        this.errorMessage =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message || 'Failed to update prescription');
      }
    });
  }

  /* ===================== NAV ===================== */

  goBack(): void {
    // navigate back to doctor appointment page (adjust if route differs)
    this.router.navigate(['/doctor-appointment']);
  }
}