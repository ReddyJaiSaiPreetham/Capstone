import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

type SlotStatus = 'AVAILABLE' | 'BLOCKED' | 'BOOKED';

interface ApiSlot {
  slotStart: string;               // "2026-04-03T09:00:00"
  status: SlotStatus;              // AVAILABLE/BLOCKED/BOOKED
  bookedPatientName?: string | null;
  bookedAppointmentId?: number | null;
}

interface UiSlot {
  label: string;                   // "09:00 AM"
  time: string;                    // "YYYY-MM-DDTHH:mm:ss"
  status: SlotStatus;
  bookedPatientName?: string | null;
  bookedAppointmentId?: number | null;
  loading?: boolean;
}

@Component({
  selector: 'app-doctor-availability',
  templateUrl: './doctor-availability.component.html',
  styleUrls: ['./doctor-availability.component.scss']
})
export class DoctorAvailabilityComponent implements OnInit {

  doctorId!: number;

  selectedDate: string = '';
  minDate: string = '';
  maxDate: string = '';

  slots: UiSlot[] = [];

  showMessage = false;
  isError = false;
  responseMessage = '';

  isPageLoading = false;

  constructor(public httpService: HttpService) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.showMsg(true, 'Doctor not logged in');
      return;
    }

    this.doctorId = parseInt(userId, 10);

    // date range: today -> today+10
    const today = new Date();
    this.minDate = this.toDateOnly(today);

    const max = new Date();
    max.setDate(max.getDate() + 10);
    this.maxDate = this.toDateOnly(max);

    this.selectedDate = this.minDate;

    // Build UI slots first (so UI always shows)
    this.buildSlots();

    // Generate slots in DB then fetch for selected date
    this.generateSlotsAndLoad();
  }

  private toDateOnly(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private showMsg(error: boolean, msg: string) {
    this.showMessage = true;
    this.isError = error;
    this.responseMessage = msg;
    setTimeout(() => (this.showMessage = false), 2500);
  }

  private formatLabel(hour: number): string {
    const isPM = hour >= 12;
    const display = hour % 12 === 0 ? 12 : hour % 12;
    const hh = String(display).padStart(2, '0');
    return `${hh}:00 ${isPM ? 'PM' : 'AM'}`;
  }

  private buildSlots(): void {
    this.slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      const hh = String(hour).padStart(2, '0');
      this.slots.push({
        label: this.formatLabel(hour),
        time: `${this.selectedDate}T${hh}:00:00`,
        status: 'BLOCKED' // default until backend response
      });
    }
  }

  generateSlotsAndLoad(): void {
    this.isPageLoading = true;

    this.httpService.generateDoctorSlots(this.doctorId).subscribe({
      next: () => this.loadSlotsForDate(),
      error: () => this.loadSlotsForDate() // if already generated, still load
    });
  }

  onDateChange(): void {
    this.buildSlots();
    this.loadSlotsForDate();
  }

  loadSlotsForDate(): void {
    this.isPageLoading = true;

    this.httpService.getDoctorSlots(this.doctorId, this.selectedDate).subscribe({
      next: (apiSlots: ApiSlot[]) => {
        const map = new Map<string, ApiSlot>();

        (apiSlots || []).forEach(s => {
          // Ensure key matches format "YYYY-MM-DDTHH:mm:ss"
          const key = (s.slotStart || '').length > 19 ? s.slotStart.substring(0, 19) : s.slotStart;
          map.set(key, s);
        });

        // Merge backend statuses into UI slots
        this.slots = this.slots.map(ui => {
          const found = map.get(ui.time);
          if (!found) return ui;

          return {
            ...ui,
            status: found.status,
            bookedPatientName: found.bookedPatientName ?? null,
            bookedAppointmentId: found.bookedAppointmentId ?? null
          };
        });

        this.isPageLoading = false;
      },
      error: (err) => {
        console.error('Slot load error:', err);
        this.isPageLoading = false;
        this.showMsg(true, 'Failed to load slots');
      }
    });
  }

  // ✅ Toggle only if not BOOKED
  toggleSlot(slot: UiSlot): void {
    if (slot.status === 'BOOKED') {
      this.showMsg(true, 'Booked slot cannot be modified');
      return;
    }

    slot.loading = true;

    // AVAILABLE <-> BLOCKED
    const makeAvailable = slot.status !== 'AVAILABLE';

    this.httpService.updateDoctorSlot(this.doctorId, slot.time, makeAvailable).subscribe({
      next: () => {
        slot.status = makeAvailable ? 'AVAILABLE' : 'BLOCKED';
        slot.loading = false;
        this.showMsg(false, `Slot ${makeAvailable ? 'Enabled' : 'Blocked'} ✅`);
      },
      error: (err) => {
        console.error('Slot update error:', err);
        slot.loading = false;
        this.showMsg(true, 'Failed to update slot');
      }
    });
  }
}