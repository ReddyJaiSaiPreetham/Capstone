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

  /**
   * ✅ Safe formatter for ISO datetime string
   * Example input : 2026-04-29T10:55:00.000+00:00
   * Output        : 29-Apr-2026 10:55 AM
   */
  formatAppointmentTime(time: string): string {

    if (!time) {
      return '';
    }

    // Remove timezone & milliseconds
    const clean = time.substring(0, 19); // YYYY-MM-DDTHH:MM:SS
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