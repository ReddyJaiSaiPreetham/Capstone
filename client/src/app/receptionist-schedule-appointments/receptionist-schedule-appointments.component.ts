import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-receptionist-schedule-appointments',
  templateUrl: './receptionist-schedule-appointments.component.html',
  styleUrls: ['./receptionist-schedule-appointments.component.scss'],
  providers: [DatePipe]
})
export class ReceptionistScheduleAppointmentsComponent implements OnInit {

  itemForm: FormGroup;
  patientList: any[] = [];
  doctorList: any[] = [];
  responseMessage: string = '';
  minDateTime: string = '';

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder
  ) {
    this.itemForm = this.formBuilder.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.minDateTime = this.getLocalDateTime();

    this.loadPatients();
    this.loadDoctors();
  }

  loadPatients(): void {
    this.httpService.getAllPatients().subscribe({
      next: (data: any[]) => {
        this.patientList = data;
      },
      error: () => {
        this.patientList = [];
      }
    });
  }

loadDoctors(): void {
  this.httpService.getDoctorsForReceptionist().subscribe({
    next: (doctors) => {
      this.doctorList = doctors;
    },
    error: () => {
      this.doctorList = [];
    }
  });
}

  onSubmit(): void {
    if (this.itemForm.invalid) return;

    // ✅ IST-safe formatting
    const formattedTime =
      this.itemForm.value.time.replace('T', ' ') + ':00';

    this.itemForm.patchValue({ time: formattedTime });

    this.httpService
      .ScheduleAppointmentByReceptionist(this.itemForm.value)
      .subscribe({
        next: () => {
          this.responseMessage = 'Appointment scheduled successfully ✅';
          this.itemForm.reset();
        },
        error: () => {
          alert('Failed to schedule appointment');
        }
      });
  }

  getLocalDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}
