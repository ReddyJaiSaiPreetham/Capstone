import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

type SlotDto = { time: string; display: string }; // from backend: {time, display}

@Component({
  selector: 'app-receptionist-appointments',
  templateUrl: './receptionist-appointments.component.html',
  styleUrls: ['./receptionist-appointments.component.scss']
})
export class ReceptionistAppointmentsComponent implements OnInit {

  itemForm: FormGroup;

  responseMessage: string = '';
  appointmentList: any[] = [];
  isAdded: boolean = false;

  searchText: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  // ✅ Slot reschedule state
  selectedAppointment: any = null;
  selectedDate: string = '';
  minDate: string = '';
  maxDate: string = '';
  availableSlots: SlotDto[] = [];
  selectedSlotTime: string = '';
  loadingSlots: boolean = false;

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder
  ) {
    this.itemForm = this.formBuilder.group({
      id: ['', Validators.required],
      time: ['', Validators.required] // will be set when user picks a slot
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
      this.totalPages = Math.ceil(this.appointmentList.length / this.itemsPerPage);
      this.currentPage = 1;
    });
  }

  /* ===================== PAGINATION + SEARCH ===================== */
  get paginatedAppointments(): any[] {

    const search = (this.searchText || '').toLowerCase();

    const filtered = this.appointmentList.filter(item => {
      const p = (item.patient?.username || '').toLowerCase();
      const d = (item.doctor?.username || '').toLowerCase();
      return p.includes(search) || d.includes(search);
    });

    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));

    // ✅ keep page in range
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return filtered.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  /* ===================== RESCHEDULE (SLOT BASED) ===================== */

  editAppointment(item: any): void {
    this.responseMessage = '';
    this.isAdded = true;

    this.selectedAppointment = item;
    this.selectedSlotTime = '';
    this.availableSlots = [];

    // default date = appointment date (if exists), else today
    if (item?.appointmentTime) {
      const d = this.parseLocal(item.appointmentTime);
      this.selectedDate = this.toDateOnly(d);
    } else {
      this.selectedDate = this.minDate;
    }

    // patch id
    this.itemForm.patchValue({ id: item.id, time: '' });

    // load available slots for that doctor
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
        // expected: [{time, display}]
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

    // ✅ set form control for validators
    this.itemForm.patchValue({ time: slot.time });
    this.itemForm.get('time')?.markAsTouched();
  }

  onSubmit(): void {
    if (!this.selectedAppointment) return;

    if (this.itemForm.invalid || !this.selectedSlotTime) {
      this.itemForm.markAllAsTouched();
      return;
    }

    // ✅ backend expects "YYYY-MM-DDTHH:mm:ss"
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

  // supports "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DD HH:mm:ss"
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
}