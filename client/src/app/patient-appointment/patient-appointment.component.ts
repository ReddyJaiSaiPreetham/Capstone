import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-patient-appointment',
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.scss']
})
export class PatientAppointmentComponent implements OnInit {

  // ✅ Stores the list of appointments for the patient
  appointmentList: any[] = [];

  // ✅ Inject HttpService
  constructor(public httpService: HttpService) {}

  // ✅ Lifecycle hook
  ngOnInit(): void {
    this.getAppointments();
  }

  // ✅ Fetch appointments for patient
  
getAppointments(): void {

  const userIdString = localStorage.getItem('userId');
  const userId = userIdString ? parseInt(userIdString, 10) : null;

  if (userId !== null) {
    this.httpService.getAppointmentByPatient(userId).subscribe({
      next: (data: any) => {
        console.log("Appointments:", data); // ✅ DEBUG
        this.appointmentList = data || [];
      },
      error: (err) => {
        console.log("ERROR fetching appointments:", err);
        this.appointmentList = [];
      }
    });
  }
}
}
``