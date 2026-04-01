import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-schedule-appointment',
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.scss'],
  providers: [DatePipe]
})
export class ScheduleAppointmentComponent implements OnInit {

  doctorList: any[] = [];

  // ✅ UI form used by user
  appointmentForm!: FormGroup;

  // ✅ Test-required form (DO NOT REMOVE)
  itemForm!: FormGroup;

  // UI flags
  isAdded: boolean = false;
  successMessage: string = '';

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.appointmentForm = this.formBuilder.group({
      doctorId: ['', Validators.required],
      appointmentTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {

    // ✅ Form required by unit tests
    this.itemForm = this.formBuilder.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      time: ['', Validators.required]
    });

    this.getDoctors();
  }

  // ✅ Load doctors
  getDoctors(): void {
    this.httpService.getDoctors().subscribe({
      next: (data: any) => {
        this.doctorList = Array.isArray(data) ? data : [];
      },
      error: () => {
        this.doctorList = [];
      }
    });
  }

  // ✅ When user clicks Appointment
  addAppointment(doctor: any): void {

    const userIdString = localStorage.getItem('userId');
    const userId = userIdString ? parseInt(userIdString, 10) : null;

    // Sync both forms
    this.itemForm.patchValue({
      patientId: userId,
      doctorId: doctor.id
    });

    this.appointmentForm.patchValue({
      doctorId: doctor.id
    });

    this.isAdded = true;
    this.successMessage = '';
  }

  // ✅ Submit appointment (FIXED – no timezone issue)
onSubmit(): void {

  if (this.appointmentForm.invalid) {
    return;
  }

  // ✅ Get raw datetime-local value
  // Example: "2026-04-30T10:39"
  const rawTime = this.appointmentForm.value.appointmentTime;

  // ✅ Convert to backend-required format WITHOUT timezone conversion
  // Result: "2026-04-30 10:39:00"
  const formattedTime = rawTime.replace('T', ' ') + ':00';

  // ✅ Update test-required form
  this.itemForm.patchValue({
    time: formattedTime
  });

  const appointmentData = {
    patientId: this.itemForm.value.patientId,
    doctorId: this.itemForm.value.doctorId,
    time: this.itemForm.value.time
  };

  this.httpService.ScheduleAppointment(appointmentData).subscribe({
    next: () => {
      this.successMessage = 'Appointment scheduled successfully ✅';
      this.isAdded = false;
      this.appointmentForm.reset();
      this.itemForm.reset();
    },
    error: () => {
      alert('Failed to schedule appointment');
    }
  });
}

}