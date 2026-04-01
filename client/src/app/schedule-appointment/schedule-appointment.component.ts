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

  appointmentForm!: FormGroup;

  itemForm!: FormGroup;

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

    this.itemForm = this.formBuilder.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      time: ['', Validators.required]
    });

    this.getDoctors();
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
    return;
  }

  const rawTime = this.appointmentForm.value.appointmentTime;

  const formattedTime = rawTime.replace('T', ' ') + ':00';

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