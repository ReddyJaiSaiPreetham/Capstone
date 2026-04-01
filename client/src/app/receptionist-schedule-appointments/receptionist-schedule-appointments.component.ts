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

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.itemForm = this.formBuilder.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

 minDateTime: string = '';

ngOnInit(): void {
  const now = new Date();
  this.minDateTime = now.toISOString().slice(0, 16);

  this.loadPatients();
  this.loadDoctors();
}

  loadPatients(): void {
    this.httpService.getAllAppointments().subscribe({
      next: (data: any[]) => {
        const map = new Map<number, any>();
        data.forEach(appt => {
          if (appt.patient && !map.has(appt.patient.id)) {
            map.set(appt.patient.id, appt.patient);
          }
        });
        this.patientList = Array.from(map.values());
      },
      error: () => {
        this.patientList = [];
      }
    });
  }

  loadDoctors(): void {
  this.httpService.getAllAppointments().subscribe({
    next: (data: any[]) => {
      const map = new Map<number, any>();

      data.forEach(appt => {
        if (appt.doctor && !map.has(appt.doctor.id)) {
          map.set(appt.doctor.id, appt.doctor);
        }
      });

      this.doctorList = Array.from(map.values());
    },
    error: () => {
      this.doctorList = [];
    }
  });
}

  onSubmit(): void {

    if (this.itemForm.invalid) {
      return;
    }

    const formattedTime = this.datePipe.transform(
      this.itemForm.value.time,
      'yyyy-MM-dd HH:mm:ss'
    );

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
}