import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

type SlotDto = { time: string; display: string };

@Component({
  selector: 'app-receptionist-appointments',
  templateUrl: './receptionist-appointments.component.html',
  styleUrls: ['./receptionist-appointments.component.scss']
})
export class ReceptionistAppointmentsComponent implements OnInit {

  itemForm: FormGroup;

  responseMessage: string = '';
  appointmentList: any[] = [];
  filteredAppointments: any[] = [];

  isAdded: boolean = false; // reschedule form visible

  searchText: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // ✅ Slot reschedule state
  selectedAppointment: any = null;
  selectedDate: string = '';
  minDate: string = '';
  maxDate: string = '';
  availableSlots: SlotDto[] = [];
  selectedSlotTime: string = '';
  loadingSlots: boolean = false;

  // ✅ NEW: Today / Upcoming / Past sections
  todayAppointments: any[] = [];
  upcomingGrouped: Map<string, any[]> = new Map();
  pastGrouped: Map<string, any[]> = new Map();

  // ✅ Default hidden
  showToday: boolean = true;
  showUpcoming: boolean = false;
  showPast: boolean = false;

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder
  ) {
    this.itemForm = this.formBuilder.group({
      id: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.setDateRange();
    this.getAppointments();
  }

  /* ===================== DATE RANGE (today -> +10 days) ===================== */
  private setDateRange(): void {
    const today = new Date();
    this.minDate = this.toDateOnly(today);

    const max = new Date();
    max.setDate(max.getDate() + 10);
    this.maxDate = this.toDateOnly(max);

    this.selectedDate = this.minDate;
  }

  private toDateOnly(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /* ===================== LOAD APPOINTMENTS ===================== */
  getAppointments(): void {
    this.httpService.getAllAppointments().subscribe((data: any[]) => {
      this.appointmentList = Array.isArray(data) ? data : [];
      this.applySearch(); // ✅ builds filtered + today/upcoming/past
    });
  }

  /* ===================== SEARCH (AUTO SHOW SECTIONS) ===================== */
  onSearchChange(): void {
    // When user searches, automatically show all sections
    const hasSearch = (this.searchText || '').trim().length > 0;
    if (hasSearch) {
      this.showToday = true;
      this.showUpcoming = true;
      this.showPast = true;
    }
    this.currentPage = 1;
    this.applySearch();
  }

  private applySearch(): void {
    const search = (this.searchText || '').toLowerCase().trim();

    this.filteredAppointments = this.appointmentList.filter(item => {
      const p = (item.patient?.username || '').toLowerCase();
      const pe = (item.patient?.email || '').toLowerCase();
      const d = (item.doctor?.username || '').toLowerCase();
      const de = (item.doctor?.email || '').toLowerCase();
      return p.includes(search) || pe.includes(search) || d.includes(search) || de.includes(search);
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredAppointments.length / this.itemsPerPage));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;

    // ✅ Build Today/Upcoming/Past based on filtered list
    this.splitAppointments(this.filteredAppointments);
  }

  /* ===================== PAGINATION ===================== */
  get paginatedAppointments(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAppointments.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  /* ===================== TODAY / UPCOMING / PAST SPLIT ===================== */
  private splitAppointments(list: any[]): void {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    this.todayAppointments = [];
    const upcomingMap = new Map<string, any[]>();
    const pastMap = new Map<string, any[]>();

    list.forEach(app => {
      if (!app?.appointmentTime) return;

      const dt = this.parseLocal(app.appointmentTime);

      // Today
      if (dt >= todayStart && dt <= todayEnd) {
        this.todayAppointments.push(app);
        return;
      }

      // Upcoming
      if (dt > todayEnd) {
        const key = dt.toDateString();
        if (!upcomingMap.has(key)) upcomingMap.set(key, []);
        upcomingMap.get(key)!.push(app);
        return;
      }

      // Past
      if (dt < todayStart) {
        const key = dt.toDateString();
        if (!pastMap.has(key)) pastMap.set(key, []);
        pastMap.get(key)!.push(app);
      }
    });

    // Sort Today ascending time
    this.todayAppointments.sort((a, b) =>
      this.parseLocal(a.appointmentTime).getTime() - this.parseLocal(b.appointmentTime).getTime()
    );

    // Sort Upcoming within each day ascending
    upcomingMap.forEach(arr => {
      arr.sort((a, b) =>
        this.parseLocal(a.appointmentTime).getTime() - this.parseLocal(b.appointmentTime).getTime()
      );
    });

    // Sort Past within each day descending (latest first)
    pastMap.forEach(arr => {
      arr.sort((a, b) =>
        this.parseLocal(b.appointmentTime).getTime() - this.parseLocal(a.appointmentTime).getTime()
      );
    });

    // Upcoming days ascending
    this.upcomingGrouped = new Map(
      Array.from(upcomingMap.entries()).sort((a, b) =>
        new Date(a[0]).getTime() - new Date(b[0]).getTime()
      )
    );

    // Past days descending
    this.pastGrouped = new Map(
      Array.from(pastMap.entries()).sort((a, b) =>
        new Date(b[0]).getTime() - new Date(a[0]).getTime()
      )
    );
  }

  toggleToday(): void { this.showToday = !this.showToday; }
  toggleUpcoming(): void { this.showUpcoming = !this.showUpcoming; }
  togglePast(): void { this.showPast = !this.showPast; }

  /* ===================== RESCHEDULE (SLOT BASED) ===================== */
  editAppointment(item: any): void {
    this.responseMessage = '';
    this.isAdded = true;

    this.selectedAppointment = item;
    this.selectedSlotTime = '';
    this.availableSlots = [];

    if (item?.appointmentTime) {
      const d = this.parseLocal(item.appointmentTime);
      this.selectedDate = this.toDateOnly(d);
    } else {
      this.selectedDate = this.minDate;
    }

    this.itemForm.patchValue({ id: item.id, time: '' });
    this.fetchAvailableSlots();
  }

  onRescheduleDateChange(): void {
    this.selectedSlotTime = '';
    this.itemForm.patchValue({ time: '' });
    this.fetchAvailableSlots();
  }

  fetchAvailableSlots(): void {
    if (!this.selectedAppointment?.doctor?.id || !this.selectedDate) return;

    this.loadingSlots = true;
    this.availableSlots = [];

    const doctorId = this.selectedAppointment.doctor.id;

    this.httpService.getReceptionistAvailableSlots(doctorId, this.selectedDate).subscribe({
      next: (slots: any) => {
        this.availableSlots = Array.isArray(slots) ? slots : [];
        this.loadingSlots = false;
      },
      error: (err) => {
        console.error('Receptionist slots fetch failed:', err);
        this.availableSlots = [];
        this.loadingSlots = false;
        this.responseMessage = 'Failed to fetch available slots';
      }
    });
  }

  selectSlot(slot: SlotDto): void {
    this.selectedSlotTime = slot.time;
    this.itemForm.patchValue({ time: slot.time });
    this.itemForm.get('time')?.markAsTouched();
  }

  onSubmit(): void {
    if (!this.selectedAppointment) return;

    if (this.itemForm.invalid || !this.selectedSlotTime) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const slotForBackend =
      this.selectedSlotTime.length === 16 ? this.selectedSlotTime + ':00' : this.selectedSlotTime;

    this.httpService
      .reScheduleAppointment(this.itemForm.value.id, { time: slotForBackend })
      .subscribe({
        next: () => {
          this.responseMessage = 'Appointment rescheduled successfully ✅';
          this.itemForm.reset();
          this.isAdded = false;
          this.selectedAppointment = null;
          this.selectedSlotTime = '';
          this.availableSlots = [];
          this.getAppointments();
        },
        error: (err) => {
          console.error('Reschedule failed:', err);
          this.responseMessage =
            typeof err?.error === 'string'
              ? err.error
              : (err?.error?.message || 'Failed to reschedule appointment');
        }
      });
  }

  cancelReschedule(): void {
    this.isAdded = false;
    this.itemForm.reset();
    this.selectedAppointment = null;
    this.selectedSlotTime = '';
    this.availableSlots = [];
  }

  /* ===================== DISPLAY TIME ===================== */
  formatTime(time: string): string {
    if (!time) return '';
    const d = this.parseLocal(time);

    const pad = (n: number) => String(n).padStart(2, '0');

    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();

    const hour = d.getHours();
    const minute = pad(d.getMinutes());

    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${day}-${month}-${year} ${displayHour}:${minute} ${ampm}`;
  }

  private parseLocal(time: string): Date {
    const clean = (time || '').substring(0, 19).replace('T', ' ');
    const [datePart, timePart] = clean.split(' ');
    if (!datePart || !timePart) return new Date(time);

    const [y, m, d] = datePart.split('-').map(Number);
    const [hh = 0, mm = 0, ss = 0] = timePart.split(':').map(Number);

    return new Date(y, m - 1, d, hh, mm, ss);
  }

  /* ===================== DELETE ===================== */
  deleteAppointment(id: number): void {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    this.httpService.deleteAppointment(id).subscribe({
      next: () => {
        this.responseMessage = 'Appointment deleted successfully ✅';
        this.getAppointments();
      },
      error: () => {
        alert('Failed to delete appointment');
      }
    });
  }

  isMobileMenuOpen: boolean = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}