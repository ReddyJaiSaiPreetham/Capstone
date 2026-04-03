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
      this.allAppointments = Array.isArray(data) ? data : [];
      this.applyFilter();
    });
  }

  /* ================= SEARCH ================= */
  private selectedDateToLocalDateString(value: string): string {
    // value like "2026-04-02"
    const parts = value.split('-').map(Number);
    if (parts.length !== 3) return new Date(value).toDateString();
    const [y, m, d] = parts;
    return new Date(y, m - 1, d).toDateString(); // ✅ local day safely
  }

  applyFilter(): void {
    let list = [...this.allAppointments];

    if (this.selectedDate) {
      const selected = this.selectedDateToLocalDateString(this.selectedDate);

      list = list.filter(app => {
        if (!app.appointmentTime) return false;
        return this.parseLocal(app.appointmentTime).toDateString() === selected;
      });
    }

    this.splitAppointments(list);
  }

  clearFilter(): void {
    this.selectedDate = '';
    this.splitAppointments(this.allAppointments);
  }

  /* ================= GROUP + SORT ================= */
  splitAppointments(list: any[]): void {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    this.todayAppointments = [];
    const tempMap = new Map<string, any[]>();

    list.forEach(app => {
      if (!app.appointmentTime) return;

      const dateObj = this.parseLocal(app.appointmentTime);

      // Today bucket
      if (dateObj >= todayStart && dateObj <= todayEnd) {
        this.todayAppointments.push(app);
      }
      // Upcoming bucket
      else if (dateObj > todayEnd) {
        const key = dateObj.toDateString();
        if (!tempMap.has(key)) tempMap.set(key, []);
        tempMap.get(key)!.push(app);
      }
    });

    // Sort Today by time
    this.todayAppointments.sort((a, b) =>
      this.parseLocal(a.appointmentTime).getTime() -
      this.parseLocal(b.appointmentTime).getTime()
    );

    // Sort each day card by time
    tempMap.forEach(apps => {
      apps.sort((a, b) =>
        this.parseLocal(a.appointmentTime).getTime() -
        this.parseLocal(b.appointmentTime).getTime()
      );
    });

    // Sort day cards by date
    this.upcomingGrouped = new Map(
      Array.from(tempMap.entries()).sort((a, b) =>
        new Date(a[0]).getTime() - new Date(b[0]).getTime()
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

    // STRICT: must be MORE THAN 5 hours
    return diffHours > 5;
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

    const diffHours =
      (selected.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (selected <= now || diffHours <= 5) {
      alert('Reschedule must be more than 5 hours from now');
      return;
    }

    // ✅ ISO format for LocalDateTime -> "YYYY-MM-DDTHH:mm:ss"
    const formattedTime = this.rescheduleTime + ':00';

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

  /* ================= HELPERS ================= */

  // Convert backend LocalDateTime string -> JS Date in LOCAL time
  parseLocal(time: string | Date): Date {
    if (time instanceof Date) return time;

    // supports:
    // "2026-04-03T16:56:00"
    // "2026-04-03 16:56:00"
    const clean = time.substring(0, 19).replace('T', ' ');
    const [datePart, timePart] = clean.split(' ');

    if (!datePart || !timePart) return new Date(time);

    const [year, month, day] = datePart.split('-').map(Number);
    const [hour = 0, minute = 0, second = 0] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute, second);
  }

  // datetime-local expects "YYYY-MM-DDTHH:mm"
  formatForInput(time: string | Date): string {
    const d = this.parseLocal(time);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // min for datetime-local in local time
  getLocalDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}