import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-patient-appointment',
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.scss']
})
export class PatientAppointmentComponent implements OnInit {

  appointmentList: any[] = [];

  constructor(public httpService: HttpService) {}

  ngOnInit(): void {
    this.getAppointments();
  }

  getAppointments(): void {
    const userIdString = localStorage.getItem('userId');
    const userId = userIdString ? parseInt(userIdString, 10) : null;

    if (userId !== null) {
      this.httpService.getAppointmentByPatient(userId).subscribe((data: any) => {
        this.appointmentList = data;
      });
    }
  }

  formatAppointmentTime(time: string): string {

    if (!time) {
      return '';
    }

    const clean = time.substring(0, 19); 
    const [datePart, timePart] = clean.split('T');

    const [year, month, day] = datePart.split('-');
    const [hourStr, minute] = timePart.split(':');

    const hourNum = parseInt(hourStr, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${day}-${months[+month - 1]}-${year} ${displayHour}:${minute} ${ampm}`;
  }
}