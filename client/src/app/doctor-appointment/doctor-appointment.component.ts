import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-doctor-appointment',
  templateUrl: './doctor-appointment.component.html',
  styleUrls: ['./doctor-appointment.component.scss']
})

export class DoctorAppointmentComponent implements OnInit {

  appointmentList: any[] = [];

  constructor(public httpService: HttpService) {}

  ngOnInit(): void {
    this.getAppointments();
  }

  getAppointments(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const doctorId = parseInt(userId, 10);
      this.httpService.getAppointmentByDoctor(doctorId).subscribe((res: any) => {
        this.appointmentList = res;
        console.log(this.appointmentList);
      });
    }
  }
}