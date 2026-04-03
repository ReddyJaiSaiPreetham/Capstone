import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

type SlotDto = { time: string; display: string };

@Component({
  selector: 'app-receptionist-schedule-appointments',
  templateUrl: './receptionist-schedule-appointments.component.html',
  styleUrls: ['./receptionist-schedule-appointments.component.scss']
})
export class ReceptionistScheduleAppointmentsComponent implements OnInit {

  itemForm: FormGroup;

  patientList: any[] = [];
  doctorList: any[] = [];

  responseMessage: string = '';
  errorMessage: string = '';

  // ✅ Date range: today -> +10 days
  selectedDate: string = '';
  minDate: string = '';
  maxDate: string = '';

  // ✅ Slots
  availableSlots: SlotDto[] = [];
  selectedSlotTime: string = '';
  loadingSlots: boolean = false;

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder
  ) {
    this.itemForm = this.formBuilder.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      time: ['', Validators.required] // filled when slot is selected
    });
  }

  ngOnInit(): void {
    this.setDateRange();
    this.loadPatients();
    this.loadDoctors();

    // when doctor changes -> fetch slots
    this.itemForm.get('doctorId')?.valueChanges.subscribe(() => {
      this.selectedSlotTime = '';
      this.itemForm.patchValue({ time: '' });
      this.fetchSlots();
    });
  }

  /* ===================== DATE RANGE ===================== */
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

  /* ===================== LOAD DROPDOWNS ===================== */
  loadPatients(): void {
    this.httpService.getAllPatients().subscribe({
      next: (data: any[]) => this.patientList = Array.isArray(data) ? data : [],
      error: () => this.patientList = []
    });
  }

  loadDoctors(): void {
    this.httpService.getDoctorsForReceptionist().subscribe({
      next: (doctors: any) => this.doctorList = Array.isArray(doctors) ? doctors : [],
      error: () => this.doctorList = []
    });
  }

  /* ===================== SLOTS ===================== */
  onDateChange(): void {
    this.selectedSlotTime = '';
    this.itemForm.patchValue({ time: '' });
    this.fetchSlots();
  }

  fetchSlots(): void {
    this.responseMessage = '';
    this.errorMessage = '';

    const doctorId = this.itemForm.value.doctorId;
    if (!doctorId || !this.selectedDate) {
      this.availableSlots = [];
      return;
    }

    this.loadingSlots = true;
    this.availableSlots = [];

    this.httpService.getReceptionistAvailableSlots(+doctorId, this.selectedDate).subscribe({
      next: (slots: any) => {
        // Expected: [{time:"YYYY-MM-DDTHH:mm:ss", display:"hh:mm a"}]
        this.availableSlots = Array.isArray(slots) ? slots : [];
        this.loadingSlots = false;
      },
      error: (err) => {
        console.error('Failed to fetch slots:', err);
        this.availableSlots = [];
        this.loadingSlots = false;

        const msg =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message || `Failed to fetch slots (HTTP ${err.status})`);

        this.errorMessage = msg;
      }
    });
  }

  selectSlot(slot: SlotDto): void {
    this.selectedSlotTime = slot.time;

    // set form control so form becomes valid
    this.itemForm.patchValue({ time: slot.time });
    this.itemForm.get('time')?.markAsTouched();
  }

  /* ===================== SUBMIT ===================== */
  onSubmit(): void {
    this.responseMessage = '';
    this.errorMessage = '';

    if (this.itemForm.invalid || !this.selectedSlotTime) {
      this.itemForm.markAllAsTouched();
      this.errorMessage = 'Please select Patient, Doctor, Date and a Slot.';
      return;
    }

    // ✅ slot.time already has seconds in backend response
    // still safe: http.service.ts will normalize
    const payload = {
      patientId: this.itemForm.value.patientId,
      doctorId: this.itemForm.value.doctorId,
      time: this.selectedSlotTime
    };

    this.httpService.ScheduleAppointmentByReceptionist(payload).subscribe({
      next: () => {
        this.responseMessage = 'Appointment scheduled successfully ✅';

        // reset only booking fields but keep lists
        this.itemForm.reset();
        this.selectedSlotTime = '';
        this.availableSlots = [];

        // keep date default today
        this.selectedDate = this.minDate;
      },
      error: (err) => {
        console.error('Failed to schedule appointment:', err);
        const msg =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message || `Failed to schedule appointment (HTTP ${err.status})`);
        this.errorMessage = msg;
      }
    });
  }
}