import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-doctor-appointment',
  templateUrl: './doctor-appointment.component.html',
  styleUrls: ['./doctor-appointment.component.scss']
})
export class DoctorAppointmentComponent implements OnInit {

  allAppointments: any[] = [];

  todayAppointments: any[] = [];
  upcomingGrouped: Map<string, any[]> = new Map();

  // Date search
  selectedDate: string = '';

  // Reschedule state
  rescheduleAppointmentId: number | null = null;
  selectedAppointment: any = null;
  rescheduleTime: string = '';
  minDateTime: string = '';

  constructor(public httpService: HttpService) {}

  ngOnInit(): void {
    this.minDateTime = this.getLocalDateTime();
    this.loadAppointments();
  }

  /* ================= LOAD ================= */
  loadAppointments(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.httpService.getAppointmentByDoctor(+userId).subscribe(data => {
      this.allAppointments = data;
      this.applyFilter();
    });
  }

  /* ================= SEARCH ================= */
  applyFilter(): void {
    let list = [...this.allAppointments];

    if (this.selectedDate) {
      const selected = new Date(this.selectedDate).toDateString();
      list = list.filter(app => {
        return this.parseLocal(app.appointmentTime).toDateString() === selected;
      });
    }

    this.splitAppointments(list);
  }

  clearFilter(): void {
    this.selectedDate = '';
    this.splitAppointments(this.allAppointments);
  }

splitAppointments(list: any[]): void {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // ✅ date-only comparison

  this.todayAppointments = [];
  const tempMap = new Map<string, any[]>();

  list.forEach(app => {
    if (!app.appointmentTime) return;

    const dateObj = this.parseLocal(app.appointmentTime);

    const appDate = new Date(dateObj);
    appDate.setHours(0, 0, 0, 0);

    // ✅ ALL today's appointments (past + future)
    if (appDate.getTime() === today.getTime()) {
      this.todayAppointments.push(app);
    }
    // ✅ Only future dates go to upcoming
    else if (appDate.getTime() > today.getTime()) {
      const key = appDate.toDateString();
      if (!tempMap.has(key)) tempMap.set(key, []);
      tempMap.get(key)!.push(app);
    }
  });

  // ✅ sort today's appointments by time
  this.todayAppointments.sort((a, b) =>
    this.parseLocal(a.appointmentTime).getTime() -
    this.parseLocal(b.appointmentTime).getTime()
  );

  // ✅ sort upcoming appointments by time
  tempMap.forEach(apps => {
    apps.sort((a, b) =>
      this.parseLocal(a.appointmentTime).getTime() -
      this.parseLocal(b.appointmentTime).getTime()
    );
  });

  // ✅ sort upcoming dates
  this.upcomingGrouped = new Map(
    Array.from(tempMap.entries()).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    )
  );
}


  /* ================= STATUS ================= */
  updateCompletionStatus(app: any): void {
    this.httpService
      .updateCompletionStatus(app.id, app.completionstatus)
      .subscribe(() => this.loadAppointments());
  }

  /* ================= RESCHEDULE RULE ================= */
  canReschedule(app: any): boolean {
    if (!app.appointmentTime) return false;
    if (app.completionstatus === 'COMPLETED') return false;

    const appointmentTime = this.parseLocal(app.appointmentTime);
    const now = new Date();

    if (appointmentTime <= now) return false;

    const diffHours =
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // ✅ STRICT: must be MORE THAN 5 hours
    return diffHours > 2;
  }

  editAppointment(app: any): void {
    if (!this.canReschedule(app)) return;

    this.selectedAppointment = app;
    this.rescheduleAppointmentId = app.id;
    this.rescheduleTime = this.formatForInput(app.appointmentTime);
  }

  submitReschedule(): void {
    if (!this.selectedAppointment || !this.rescheduleTime) return;

    const selected = new Date(this.rescheduleTime);
    const now = new Date();

    const diff =
      (selected.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (selected <= now || diff <= 2) {
      alert('Reschedule must be more than 5 hours from now');
      return;
    }

    const formattedTime = this.rescheduleTime.replace('T', ' ') + ':00';

    this.httpService
      .doctorRescheduleAppointment(this.selectedAppointment.id, formattedTime)
      .subscribe(() => {
        this.rescheduleAppointmentId = null;
        this.selectedAppointment = null;
        this.loadAppointments();
      });
  }

  cancelReschedule(): void {
    this.rescheduleAppointmentId = null;
    this.selectedAppointment = null;
  }

  parseLocal(time: string): Date {
    return new Date(time.replace(' ', 'T'));
  }

  formatForInput(time: string): string {
    return time.substring(0, 16);
  }

  getLocalDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}
