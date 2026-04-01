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
    this.getAppointments();
  }

  getAppointments(): void {
    this.httpService.getAllAppointments().subscribe((data: any[]) => {
      this.appointmentList = data;
    });
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
    if (!time) {
      return '';
    }

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