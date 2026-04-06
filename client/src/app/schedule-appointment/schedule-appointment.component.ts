import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

type SlotDto = { time: string; display: string };

@Component({
  selector: 'app-schedule-appointment',
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.scss']
})
export class ScheduleAppointmentComponent implements OnInit {

  doctorList: any[] = [];
  filteredDoctorList: any[] = [];   // table will use this
  searchText: string = '';          // single search input

  // Pagination
  currentPage: number = 1;
  pageSize: number = 6;           // you can change to 10
  totalPages: number = 0;

  // This will contain only the doctors shown in the table for current page
  pagedDoctorList: any[] = [];


  selectedDoctor: any = null;
  selectedDate: string = '';

  minDate: string = '';
  maxDate: string = '';

  // :white_check_mark: Backend returns slot objects: [{time, display}]
  availableSlots: SlotDto[] = [];
  // :white_check_mark: Store ONLY ISO time string for booking
  selectedSlotTime: string = '';

  successMessage: string = '';
  errorMessage: string = '';
  loadingSlots: boolean = false;



  constructor(public httpService: HttpService) {}

  ngOnInit(): void {
    this.setDateRange();
    this.getDoctors();
  }

  /* ================== DATE RANGE (10 DAYS) ================== */
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

  /* ================== DOCTORS ================== */

  getDoctors(): void {
  this.httpService.getDoctors().subscribe({
    next: (data: any) => {
      this.doctorList = Array.isArray(data) ? data : [];
      this.filteredDoctorList = [...this.doctorList];

      this.currentPage = 1;       // reset
      this.updatePagination();    // update paged list
    },
    error: () => {
      this.doctorList = [];
      this.filteredDoctorList = [];
      this.pagedDoctorList = [];
      this.totalPages = 0;
      this.currentPage = 1;
    }
  });
}

/* ================== FILTER FUNCTION DOCTOR ================== */
  filterDoctors(): void {
  const q = this.searchText.trim().toLowerCase();

  if (!q) {
    this.filteredDoctorList = [...this.doctorList];
  } else {
    this.filteredDoctorList = this.doctorList.filter(doc => {
      const name = (doc.username || '').toLowerCase();
      const spec = (doc.specialty || '').toLowerCase();
      return name.includes(q) || spec.includes(q);
    });
  }

  this.currentPage = 1;      // reset to page 1 after search
  this.updatePagination();   // show first page results
}

/* ================== FILTER FUNCTION DOCTOR ================== */

updatePagination(): void {
  const list = this.filteredDoctorList || [];
  this.totalPages = Math.ceil(list.length / this.pageSize) || 1;

  // :white_check_mark: ensure current page is within range
  if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
  if (this.currentPage < 1) this.currentPage = 1;

  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  this.pagedDoctorList = list.slice(start, end);
}

goToPage(page: number): void {
  this.currentPage = page;
  this.updatePagination();
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.updatePagination();
  }
}

prevPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.updatePagination();
  }
}


  /* ================== SELECT DOCTOR ================== */
  addAppointment(doctor: any): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.selectedSlotTime = '';
    this.availableSlots = [];

    this.selectedDoctor = doctor;
    this.fetchAvailableSlots();
  }

  onDateChange(): void {
    this.selectedSlotTime = '';
    this.fetchAvailableSlots();
  }

  fetchAvailableSlots(clearSuccess: boolean = false): void {
  if (!this.selectedDoctor || !this.selectedDate) return;

  this.loadingSlots = true;
  this.errorMessage = '';

  // :white_check_mark: Clear success ONLY when user changes doctor/date (not after booking)
  if (clearSuccess) {
    this.successMessage = '';
  }

  this.httpService.getAvailableSlotsForDoctor(this.selectedDoctor.id, this.selectedDate).subscribe({
    next: (slots: any) => {
      this.availableSlots = Array.isArray(slots) ? slots : [];
      this.loadingSlots = false;
    },
    error: (err) => {
      console.error('Slots fetch failed:', err);
      this.availableSlots = [];
      this.loadingSlots = false;
      this.errorMessage = 'Failed to fetch slots. Please try again.';
    }
  });
}

  /* ================== SLOT SELECT ================== */
  selectSlot(slot: SlotDto): void {
    // :white_check_mark: store only ISO string, not whole object
    this.selectedSlotTime = slot.time;
  }

  /* ================== BOOK SLOT ================== */
  bookSlot(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.selectedDoctor) {
      this.errorMessage = 'Please select a doctor';
      return;
    }

    if (!this.selectedSlotTime) {
      this.errorMessage = 'Please select a time slot';
      return;
    }

    const userIdString = localStorage.getItem('userId');
    const patientId = userIdString ? parseInt(userIdString, 10) : null;

    if (!patientId) {
      this.errorMessage = 'Patient not logged in';
      return;
    }

    // :white_check_mark: Ensure seconds exist: "YYYY-MM-DDTHH:mm:ss"
    const slotForBackend =
      this.selectedSlotTime.length === 16 ? this.selectedSlotTime + ':00' : this.selectedSlotTime;

    this.httpService
      .scheduleAppointmentWithSlot(patientId, this.selectedDoctor.id, slotForBackend)
      .subscribe({
        next: (res: any) => {
          // backend returns {message:"Appointment Scheduled"} OR plain string
          this.successMessage = (res?.message || res || 'Appointment Scheduled') + ' ✅'

;
          this.selectedSlotTime = '';
          this.fetchAvailableSlots(); // remove booked slot
        },
        error: (err) => {
          console.error('Booking failed:', err);

          const backendMsg =
            typeof err?.error === 'string'
              ? err.error
              : (err?.error?.message || err?.message);

          this.errorMessage = backendMsg
            ? backendMsg
            : `Failed to schedule appointment (HTTP ${err?.status || 'unknown'})`;
        }
      });
  }

  closeBooking(): void {
    this.selectedDoctor = null;
    this.availableSlots = [];
    this.selectedSlotTime = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  /* ================== Helper (fallback display for old string slots) ================== */
  private formatToIST(slot: string): string {
    // slot like "2026-04-03T11:00" or "2026-04-03T11:00:00"
    const cleaned = slot.replace(' ', 'T');
    const parts = cleaned.split('T');
    if (parts.length !== 2) return slot;

    const timePart = parts[1];
    const hour = Number(timePart.split(':')[0]);

    if (Number.isNaN(hour)) return slot;

    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${String(displayHour).padStart(2, '0')}:00 ${ampm}`;
  }

  isMobileMenuOpen: boolean = false;

    toggleMobileMenu(): void {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

  
  closeMobileMenu(): void {
      this.isMobileMenuOpen = false;
    }

}