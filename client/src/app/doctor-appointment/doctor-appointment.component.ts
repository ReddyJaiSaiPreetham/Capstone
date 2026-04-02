import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-doctor-appointment',
  templateUrl: './doctor-appointment.component.html',
  styleUrls: ['./doctor-appointment.component.scss']
})
export class DoctorAppointmentComponent implements OnInit {

  // ✅ OLD LOGIC (UNCHANGED)
  appointmentList: any[] = [];

  // ✅ NEW ENHANCED VIEW VARIABLES
  todayAppointments: any[] = [];
  upcomingGrouped: Map<string, any[]> = new Map();

  constructor(public httpService: HttpService) {}

  // ✅ SINGLE ngOnInit (IMPORTANT)
  ngOnInit(): void {
    // Old method still exists but NOT auto-called
    // this.getAppointments();

    // ✅ New enhanced doctor view
    this.loadAppointments();
  }

  // ✅ OLD METHOD (KEEPING IT – NOT AFFECTED)
  getAppointments(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const doctorId = parseInt(userId, 10);
      this.httpService.getAppointmentByDoctor(doctorId).subscribe((res: any) => {
        this.appointmentList = res;
        console.log('Old appointments list:', this.appointmentList);
      });
    }
  }

  // ✅ NEW METHOD (ENHANCED DOCTOR VIEW)
  loadAppointments(): void {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    console.error('No doctor ID in localStorage');
    return;
  }

  const doctorId = parseInt(userId, 10);

  this.httpService.getAppointmentByDoctor(doctorId).subscribe((data: any[]) => {
    console.log('RAW API DATA:', data);
    this.splitAppointments(data);
  });
}


 splitAppointments(all: any[]): void {
  const todayStr = new Date().toDateString();

  this.todayAppointments = [];
  this.upcomingGrouped.clear();

  all.forEach(appt => {

    // ✅ SAFETY: skip NULL appointment_time
    if (!appt.appointmentTime) {
      console.warn('Skipping appointment with NULL time:', appt);
      return;
    }

    // ✅ Convert MySQL datetime → ISO
    const isoTime = appt.appointmentTime.replace(' ', 'T');
    const apptDateObj = new Date(isoTime);

    // ✅ SAFETY: skip invalid dates
    if (isNaN(apptDateObj.getTime())) {
      console.error('Invalid date:', appt.appointmentTime);
      return;
    }

    const apptDateStr = apptDateObj.toDateString();

    // ✅ TODAY
    if (apptDateStr === todayStr) {
      this.todayAppointments.push(appt);
    }
    // ✅ UPCOMING (future)
    else if (apptDateObj.getTime() > Date.now()) {
      if (!this.upcomingGrouped.has(apptDateStr)) {
        this.upcomingGrouped.set(apptDateStr, []);
      }
      this.upcomingGrouped.get(apptDateStr)!.push(appt);
    }
  });

  // ✅ DEBUG (temporary – remove after verification)
  console.log('TODAY APPOINTMENTS:', this.todayAppointments);
  console.log('UPCOMING GROUPED:', Array.from(this.upcomingGrouped.entries()));
}

  // ✅ MARK APPOINTMENT AS COMPLETED
  markCompleted(id: number): void {
    this.httpService.completeAppointment(id).subscribe(() => {
      this.loadAppointments();
    });
  }


  // ✅ EDIT / RESCHEDULE APPOINTMENT (Doctor)
editAppointment(app: any): void {
  // For now, just log – later you can open a modal or reuse form
  console.log('Reschedule clicked for appointment:', app);

  // Example future usage:
  // this.selectedAppointment = app;
  // this.showRescheduleForm = true;
}


updateCompletionStatus(app: any): void {
  console.log('Auto-saving:', app.id, app.completionstatus);

  this.httpService
    .updateCompletionStatus(app.id, app.completionstatus)
    .subscribe({
      next: () => console.log('✅ DB updated'),
      error: err => console.error('❌ Update failed', err)
    });
}
}
