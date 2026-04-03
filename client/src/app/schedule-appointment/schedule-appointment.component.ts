import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-schedule-appointment',
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.scss']
})
export class ScheduleAppointmentComponent implements OnInit {

  doctorList: any[] = [];

  // Form used for selecting time for the selected doctor
  appointmentForm!: FormGroup;

  // Payload form (patientId/doctorId/time) used to submit
  itemForm!: FormGroup;

  isAdded: boolean = false;
  successMessage: string = '';

  minDateTime: string = '';

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder
  ) {
    this.appointmentForm = this.formBuilder.group({
      doctorId: ['', Validators.required],
      appointmentTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.itemForm = this.formBuilder.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      time: ['', Validators.required]
    });

    // ✅ Prevent past date selection (LOCAL datetime, not UTC)
    this.minDateTime = this.getLocalDateTimeMin();

    this.getDoctors();
  }

  // ✅ Local time in yyyy-MM-ddTHH:mm format for datetime-local min attribute
  private getLocalDateTimeMin(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

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

  addAppointment(doctor: any): void {
    const userIdString = localStorage.getItem('userId');
    const userId = userIdString ? parseInt(userIdString, 10) : null;

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

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const rawTime: string = this.appointmentForm.value.appointmentTime;
    // rawTime from datetime-local looks like: "2026-04-03T14:51"

    // ✅ FIX: Send ISO format that LocalDateTime can parse
    // Backend expects: "yyyy-MM-dd'T'HH:mm:ss"
    const formattedTime = rawTime + ':00'; // -> "2026-04-03T14:51:00"

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
      error: (err) => {
        console.error('Schedule failed:', err);
        alert('Failed to schedule appointment');
      }
    });
  }
}
