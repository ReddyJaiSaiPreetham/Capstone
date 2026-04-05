import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  // ✅ NEW: past (previous) appointments
  pastGrouped: Map<string, any[]> = new Map();
  showPast: boolean = true;
  pastDaysLimit: number = 30; // ✅ show last 30 days only (set to 365 or remove limit logic if you want all)

  // Date search
  selectedDate: string = '';

  // Reschedule state
  rescheduleAppointmentId: number | null = null;
  selectedAppointment: any = null;
  rescheduleTime: string = '';
  minDateTime: string = '';

  // UI
  loading: boolean = false;
  errorMessage: string = '';

  constructor(public httpService: HttpService, private router: Router) {}

  ngOnInit(): void {
    this.minDateTime = this.getLocalDateTime();
    this.loadAppointments();
  }

  /* ================= LOAD ================= */
  loadAppointments(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.loading = true;
    this.errorMessage = '';

    this.httpService.getAppointmentByDoctor(+userId).subscribe({
      next: (data: any) => {
        this.allAppointments = Array.isArray(data) ? data : [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Load doctor appointments failed:', err);
        this.allAppointments = [];
        this.todayAppointments = [];
        this.upcomingGrouped = new Map();
        this.pastGrouped = new Map();
        this.loading = false;
        this.errorMessage = 'Failed to load appointments';
      }
    });
  }

  /* ================= SEARCH ================= */
  private selectedDateToLocalDateString(value: string): string {
    const parts = value.split('-').map(Number);
    if (parts.length !== 3) return new Date(value).toDateString();
    const [y, m, d] = parts;
    return new Date(y, m - 1, d).toDateString();
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
    const upcomingMap = new Map<string, any[]>();
    const pastMap = new Map<string, any[]>();

    // ✅ past limit (last N days)
    const pastLimitDate = new Date(todayStart);
    pastLimitDate.setDate(pastLimitDate.getDate() - this.pastDaysLimit);

    list.forEach(app => {
      if (!app.appointmentTime) return;

      const dateObj = this.parseLocal(app.appointmentTime);

      // ✅ Today
      if (dateObj >= todayStart && dateObj <= todayEnd) {
        this.todayAppointments.push(app);
        return;
      }

      // ✅ Upcoming
      if (dateObj > todayEnd) {
        const key = dateObj.toDateString();
        if (!upcomingMap.has(key)) upcomingMap.set(key, []);
        upcomingMap.get(key)!.push(app);
        return;
      }

      // ✅ Past
      // If you want ALL past (no limit), remove the if check below and always add
      if (dateObj >= pastLimitDate) {
        const key = dateObj.toDateString();
        if (!pastMap.has(key)) pastMap.set(key, []);
        pastMap.get(key)!.push(app);
      }
    });

    // ✅ Sort Today by time ascending
    this.todayAppointments.sort((a, b) =>
      this.parseLocal(a.appointmentTime).getTime() -
      this.parseLocal(b.appointmentTime).getTime()
    );

    // ✅ Sort Upcoming each day by time ascending
    upcomingMap.forEach(apps => {
      apps.sort((a, b) =>
        this.parseLocal(a.appointmentTime).getTime() -
        this.parseLocal(b.appointmentTime).getTime()
      );
    });

    // ✅ Sort Past each day by time descending (latest first)
    pastMap.forEach(apps => {
      apps.sort((a, b) =>
        this.parseLocal(b.appointmentTime).getTime() -
        this.parseLocal(a.appointmentTime).getTime()
      );
    });

    // ✅ Upcoming days ascending (nearest future first)
    this.upcomingGrouped = new Map(
      Array.from(upcomingMap.entries()).sort((a, b) =>
        new Date(a[0]).getTime() - new Date(b[0]).getTime()
      )
    );

    // ✅ Past days descending (most recent past first)
    this.pastGrouped = new Map(
      Array.from(pastMap.entries()).sort((a, b) =>
        new Date(b[0]).getTime() - new Date(a[0]).getTime()
      )
    );
  }

  togglePast(): void {
    this.showPast = !this.showPast;
  }

  /* ================= STATUS ================= */
  updateCompletionStatus(app: any): void {
    this.httpService
      .updateCompletionStatus(app.id, app.completionstatus)
      .subscribe({
        next: () => this.loadAppointments(),
        error: (err) => {
          console.error('Update completion failed:', err);
          alert('Failed to update status');
        }
      });
  }

  /* ================= PRESCRIPTION ================= */
  openPrescription(app: any): void {
    if (app?.completionstatus !== 'COMPLETED') {
      alert('Please mark appointment as COMPLETED before adding prescription');
      return;
    }

    const patientId = app?.patient?.id;
    if (!patientId) {
      alert('Patient ID not found');
      return;
    }

    const doctorId = localStorage.getItem('userId');

    this.router.navigate(['/doctor-medical-record'], {
      queryParams: {
        patientId: patientId,
        doctorId: doctorId,
        appointmentId: app?.id
      }
    });
  }

  /* ================= RESCHEDULE RULE ================= */
  canReschedule(app: any): boolean {
    if (!app.appointmentTime) return false;
    if (app.completionstatus === 'COMPLETED') return false;

    const appointmentTime = this.parseLocal(app.appointmentTime);
    const now = new Date();

    if (appointmentTime <= now) return false;

    const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

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

    const diffHours = (selected.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (selected <= now || diffHours <= 5) {
      alert('Reschedule must be more than 5 hours from now');
      return;
    }

    const formattedTime = this.rescheduleTime + ':00';

    this.httpService
      .doctorRescheduleAppointment(this.selectedAppointment.id, formattedTime)
      .subscribe({
        next: () => {
          this.rescheduleAppointmentId = null;
          this.selectedAppointment = null;
          this.rescheduleTime = '';
          this.loadAppointments();
        },
        error: (err) => {
          console.error('Reschedule failed:', err);
          alert('Failed to reschedule appointment');
        }
      });
  }

  cancelReschedule(): void {
    this.rescheduleAppointmentId = null;
    this.selectedAppointment = null;
    this.rescheduleTime = '';
  }

  /* ================= HELPERS ================= */

  parseLocal(time: string | Date): Date {
    if (time instanceof Date) return time;

    const clean = time.substring(0, 19).replace('T', ' ');
    const [datePart, timePart] = clean.split(' ');

    if (!datePart || !timePart) return new Date(time);

    const [year, month, day] = datePart.split('-').map(Number);
    const [hour = 0, minute = 0, second = 0] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute, second);
  }

  formatForInput(time: string | Date): string {
    const d = this.parseLocal(time);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  getLocalDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}