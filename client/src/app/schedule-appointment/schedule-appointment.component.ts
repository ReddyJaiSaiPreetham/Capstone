import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-schedule-appointment',
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.scss']
})
export class ScheduleAppointmentComponent implements OnInit {

  // ✅ Variables as per PDF
  doctorList: any[] = [];
  appointmentForm!: FormGroup;
  formattedDate: any;
  isAdded: boolean = false;

  // ✅ Constructor
  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder
  ) {
    // Initialize form
    this.appointmentForm = this.formBuilder.group({
      doctorId: ['', Validators.required],
      appointmentTime: ['', Validators.required]
    });
  }

  // ✅ Lifecycle hook
  ngOnInit(): void {
    this.getDoctors();
  }

  // ✅ Fetch doctors from server
  getDoctors(): void {
    this.httpService.getDoctors().subscribe((data: any) => {
      this.doctorList = data;
    });
  }

  // ✅ Prepare appointment form
  addAppointment(doctor: any): void {

    const userIdString = localStorage.getItem('userId');
    const userId = userIdString ? parseInt(userIdString, 10) : null;

    this.appointmentForm.patchValue({
      doctorId: doctor.id,
      patientId: userId
    });

    this.isAdded = true;
  }

  // ✅ Submit appointment
  onSubmit(): void {

    if (this.appointmentForm.valid) {

      // Format appointment date
      this.formattedDate = new Date(
        this.appointmentForm.value.appointmentTime
      ).toISOString();

      const appointmentData = {
        doctorId: this.appointmentForm.value.doctorId,
        patientId: localStorage.getItem('userId'),
        appointmentTime: this.formattedDate
      };

      this.httpService.ScheduleAppointment(appointmentData).subscribe(() => {
        this.isAdded = false;
        this.appointmentForm.reset();
        alert('Appointment scheduled successfully');
      });
    }
  }
}