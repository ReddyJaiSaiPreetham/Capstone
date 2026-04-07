import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

type SlotDto = { time: string; display: string; available: boolean; raw?: any };

@Component({
  selector: 'app-doctor-appointment',
  templateUrl: './doctor-appointment.component.html',
  styleUrls: ['./doctor-appointment.component.scss']
})
export class DoctorAppointmentComponent implements OnInit {

  allAppointments: any[] = [];

  todayAppointments: any[] = [];
  upcomingGrouped: Map<string, any[]> = new Map();

  pastGrouped: Map<string, any[]> = new Map();
  showPast: boolean = true;
  pastDaysLimit: number = 30;

  selectedDate: string = '';

  rescheduleAppointmentId: number | null = null;
  selectedAppointment: any = null;

  // Slot based reschedule
  rescheduleDate: string = '';
  minRescheduleDate: string = '';
  maxRescheduleDate: string = '';

  availableSlotsAll: SlotDto[] = [];  
  rawSlotsCount: number = 0;           
  selectedSlotTime: string = '';
  loadingSlots: boolean = false;

  // UI
  loading: boolean = false;
  errorMessage: string = '';

  constructor(public httpService: HttpService, private router: Router) {}

  ngOnInit(): void {
    
  if (!localStorage.getItem('token')) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    this.setRescheduleDateRange();
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

    const pastLimitDate = new Date(todayStart);
    pastLimitDate.setDate(pastLimitDate.getDate() - this.pastDaysLimit);

    list.forEach(app => {
      if (!app.appointmentTime) return;
      const dateObj = this.parseLocal(app.appointmentTime);

      if (dateObj >= todayStart && dateObj <= todayEnd) {
        this.todayAppointments.push(app);
        return;
      }

      if (dateObj > todayEnd) {
        const key = dateObj.toDateString();
        if (!upcomingMap.has(key)) upcomingMap.set(key, []);
        upcomingMap.get(key)!.push(app);
        return;
      }

      if (dateObj >= pastLimitDate) {
        const key = dateObj.toDateString();
        if (!pastMap.has(key)) pastMap.set(key, []);
        pastMap.get(key)!.push(app);
      }
    });

    this.todayAppointments.sort((a, b) =>
      this.parseLocal(a.appointmentTime).getTime() - this.parseLocal(b.appointmentTime).getTime()
    );

    upcomingMap.forEach(apps => {
      apps.sort((a, b) =>
        this.parseLocal(a.appointmentTime).getTime() - this.parseLocal(b.appointmentTime).getTime()
      );
    });

    pastMap.forEach(apps => {
      apps.sort((a, b) =>
        this.parseLocal(b.appointmentTime).getTime() - this.parseLocal(a.appointmentTime).getTime()
      );
    });

    this.upcomingGrouped = new Map(
      Array.from(upcomingMap.entries()).sort((a, b) =>
        new Date(a[0]).getTime() - new Date(b[0]).getTime()
      )
    );

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
    this.httpService.updateCompletionStatus(app.id, app.completionstatus).subscribe({
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
        patientId,
        doctorId,
        appointmentId: app?.id
      }
    });
  }

  /* ================= RESCHEDULE RULE ================= */
  canReschedule(app: any): boolean {
    if (!app?.appointmentTime) return false;
    if (app.completionstatus === 'COMPLETED') return false;

    const appointmentTime = this.parseLocal(app.appointmentTime);
    const now = new Date();
    if (appointmentTime <= now) return false;

    const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 2;
  }

  /* ================= SLOT-BASED RESCHEDULE ================= */

  private setRescheduleDateRange(): void {
    const today = new Date();
    this.minRescheduleDate = this.toDateOnly(today);

    const max = new Date();
    max.setDate(max.getDate() + 10);
    this.maxRescheduleDate = this.toDateOnly(max);
  }

  private toDateOnly(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  editAppointment(app: any): void {
    if (!this.canReschedule(app)) return;

    this.selectedAppointment = app;
    this.rescheduleAppointmentId = app.id;

    const d = this.parseLocal(app.appointmentTime);
    this.rescheduleDate = this.toDateOnly(d);

    this.selectedSlotTime = '';
    this.availableSlotsAll = [];
    this.rawSlotsCount = 0;

    this.fetchAvailableSlots();
  }

  onRescheduleDateChange(): void {
    this.selectedSlotTime = '';
    this.fetchAvailableSlots();
  }

  fetchAvailableSlots(): void {
    const doctorId = Number(localStorage.getItem('userId'));
    if (!doctorId || !this.rescheduleDate) return;

    this.loadingSlots = true;
    this.availableSlotsAll = [];
    this.rawSlotsCount = 0;

    this.httpService.getDoctorSlots(doctorId, this.rescheduleDate).subscribe({
      next: (slots: any) => {
        const arr = Array.isArray(slots) ? slots : [];
        this.rawSlotsCount = arr.length;

        // Normalize robustly (detect datetime even with unknown key names)
        this.availableSlotsAll = arr
          .map((s: any) => this.normalizeSlotRobust(s))
          .filter(s => !!s.time);

        this.loadingSlots = false;
      },
      error: (err) => {
        console.error('Slots fetch failed:', err);
        this.availableSlotsAll = [];
        this.rawSlotsCount = 0;
        this.loadingSlots = false;
      }
    });
  }

  // Derived getters for UI
  get availableSlots(): SlotDto[] {
    return this.availableSlotsAll.filter(s => s.available);
  }
  get hasAnySlotsReturned(): boolean {
    // IMPORTANT: use RAW count so message is accurate even if mapping fails
    return this.rawSlotsCount > 0;
  }
  get hasAvailableSlots(): boolean {
    return this.availableSlotsAll.some(s => s.available);
  }
  get mappingFailed(): boolean {
    // raw slots exist but none could be normalized
    return this.rawSlotsCount > 0 && this.availableSlotsAll.length === 0;
  }

  selectSlot(slot: SlotDto): void {
    if (!slot.available) return;
    this.selectedSlotTime = slot.time;
  }

  submitReschedule(): void {
    if (!this.selectedAppointment || !this.selectedSlotTime) return;

    const selected = new Date(this.selectedSlotTime);
    const now = new Date();
    const diffHours = (selected.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (selected <= now || diffHours <= 2) {
      alert('Reschedule must be more than 2 hours from now');
      return;
    }

    const slotForBackend =
      this.selectedSlotTime.length === 16 ? this.selectedSlotTime + ':00' : this.selectedSlotTime;

    this.httpService.doctorRescheduleAppointment(this.selectedAppointment.id, slotForBackend).subscribe({
      next: () => {
        this.rescheduleAppointmentId = null;
        this.selectedAppointment = null;
        this.selectedSlotTime = '';
        this.availableSlotsAll = [];
        this.rawSlotsCount = 0;
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
    this.selectedSlotTime = '';
    this.availableSlotsAll = [];
    this.rawSlotsCount = 0;
  }

  /* ================= ROBUST SLOT NORMALIZATION ================= */

  private normalizeSlotRobust(s: any): SlotDto {
    // If API returns strings
    if (typeof s === 'string') {
      const t = this.ensureSeconds(s);
      return { time: t, display: this.formatSlotDisplay(t), available: true, raw: s };
    }

   
    let time =
      s?.time || s?.slotTime || s?.startTime || s?.dateTime || s?.appointmentTime || s?.value || '';

    if (!time) {
      time = this.findAnyIsoDateTime(s) || '';
    }

    const t = this.ensureSeconds(time);
    if (!t) return { time: '', display: '', available: false, raw: s };

    const display =
      s?.display || s?.label || s?.slotLabel || this.formatSlotDisplay(t);

    
    const hasFlag =
      ('available' in (s || {})) || ('isAvailable' in (s || {})) || ('status' in (s || {})) || ('booked' in (s || {}));

    const available = hasFlag
      ? (s?.available === true ||
         s?.isAvailable === true ||
         s?.status === 'AVAILABLE' ||
         s?.status === 'FREE' ||
         s?.booked === false ||
         s?.isBooked === false)
      : true;

    return { time: t, display, available: !!available, raw: s };
  }

  private findAnyIsoDateTime(obj: any): string | null {
    if (!obj) return null;

    if (typeof obj === 'string') {
      if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(obj)) return obj;
      return null;
    }

    // arrays
    if (Array.isArray(obj)) {
      for (const it of obj) {
        const res = this.findAnyIsoDateTime(it);
        if (res) return res;
      }
      return null;
    }

    // objects
    if (typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        const res = this.findAnyIsoDateTime(obj[k]);
        if (res) return res;
      }
    }

    return null;
  }

  private ensureSeconds(t: string): string {
    if (!t) return '';
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}$/.test(t)) return t.replace(' ', 'T');
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}$/.test(t)) return (t.replace(' ', 'T') + ':00');
    return t.replace(' ', 'T');
  }

  private formatSlotDisplay(time: string): string {
    if (!time) return '';
    const clean = time.substring(0, 19).replace('T', ' ');
    const parts = clean.split(' ');
    if (parts.length !== 2) return time;

    const [hhStr, mmStr] = parts[1].split(':');
    const hh = Number(hhStr);
    const mm = Number(mmStr);

    const ampm = hh >= 12 ? 'PM' : 'AM';
    const displayHour = hh % 12 === 0 ? 12 : hh % 12;

    return `${displayHour}:${String(mm).padStart(2, '0')} ${ampm}`;
  }

  /* ================= HELPERS ================= */
  parseLocal(time: string | Date): Date {
    if (time instanceof Date) return time;

    const clean = (time || '').substring(0, 19).replace('T', ' ');
    const [datePart, timePart] = clean.split(' ');
    if (!datePart || !timePart) return new Date(time);

    const [year, month, day] = datePart.split('-').map(Number);
    const [hour = 0, minute = 0, second = 0] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute, second);
  }

  get upcomingCount(): number {
    let count = 0;
    this.upcomingGrouped.forEach(apps => (count += apps.length));
    return count;
  }

  get completedTodayCount(): number {
    return this.todayAppointments.filter(a => a.completionstatus === 'COMPLETED').length;
  }

  get pendingTodayCount(): number {
    return this.todayAppointments.filter(a => a.completionstatus !== 'COMPLETED').length;
  }
}