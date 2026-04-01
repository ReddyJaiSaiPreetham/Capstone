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
  appointmentForm!: FormGroup;
  itemForm!: FormGroup;

  formattedDate: any;
  isAdded: boolean = false;

  successMessage: string = '';
  errorMessage: string = '';

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

    const userIdString = localStorage.getItem('userId');
    const userId = userIdString ? parseInt(userIdString, 10) : null;

    this.itemForm.patchValue({
      patientId: userId
    });

    this.getDoctors();
  }

  getDoctors(): void {
    this.httpService.getDoctors().subscribe((data: any) => {
      this.doctorList = data;
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
  }

  onSubmit(): void {

    if (this.appointmentForm.invalid) {
      this.errorMessage = 'Please select doctor and appointment time';
      this.successMessage = '';
      return;
    }

    if (!this.itemForm.value.doctorId) {
      this.errorMessage = 'Please click Appointment button first';
      this.successMessage = '';
      return;
    }

    // ✅ Correct format
    const date = new Date(this.appointmentForm.value.appointmentTime);

    this.formattedDate =
      date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0') + ' ' +
      String(date.getHours()).padStart(2, '0') + ':' +
      String(date.getMinutes()).padStart(2, '0') + ':00';

    this.itemForm.patchValue({
      time: this.formattedDate
    });

    const appointmentData = {
      patientId: this.itemForm.value.patientId,
      doctorId: this.itemForm.value.doctorId,
      time: this.itemForm.value.time
    };

    this.httpService.ScheduleAppointment(appointmentData).subscribe({
      next: () => {

        // ✅ SUCCESS WILL NOW WORK
        this.successMessage = 'Appointment scheduled successfully';
        this.errorMessage = '';

        this.isAdded = false;

        setTimeout(() => {
          this.appointmentForm.reset();

          const userId = localStorage.getItem('userId');
          this.itemForm.patchValue({
            patientId: userId
          });
        }, 100);

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },

      error: (err) => {
        console.log("ERROR:", err);

        this.errorMessage = 'Failed to schedule appointment';
        this.successMessage = '';
      }
    });
  }
}