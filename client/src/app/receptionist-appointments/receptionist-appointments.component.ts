import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  minDateTime: string = '';

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
    const now = new Date();
    this.minDateTime = now.toISOString().slice(0, 16);
    this.getAppointments();
  }

  getAppointments(): void {
    this.httpService.getAllAppointments().subscribe((data: any[]) => {
      this.appointmentList = data;
      this.totalPages = Math.ceil(this.appointmentList.length / this.itemsPerPage);
      this.currentPage = 1;
    });
  }

  
  get paginatedAppointments(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.appointmentList.slice(startIndex, endIndex);
  }

  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  
  editAppointment(item: any): void {
    this.itemForm.patchValue({
      id: item.id,
      time: item.appointmentTime.substring(0, 16)
    });
    this.isAdded = true;
  }


  onSubmit(): void {

    if (this.itemForm.invalid) {
      return;
    }

    const rawTime = this.itemForm.value.time;
    const formattedTime = rawTime.replace('T', ' ') + ':00';

    this.httpService
      .reScheduleAppointment(this.itemForm.value.id, { time: formattedTime })
      .subscribe({
        next: () => {
          this.responseMessage = 'Appointment rescheduled successfully ✅';
          this.itemForm.reset();
          this.isAdded = false;
          this.getAppointments();
        },
        error: () => {
          alert('Failed to reschedule appointment');
        }
      });
  }

  
  formatTime(time: string): string {
    if (!time) return '';

    const clean = time.substring(0, 19);
    const [datePart, timePart] = clean.split('T');
    const [year, month, day] = datePart.split('-');
    const [hh, mm] = timePart.split(':');

    const hour = parseInt(hh, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${day}-${month}-${year} ${displayHour}:${mm} ${ampm}`;
  }
}