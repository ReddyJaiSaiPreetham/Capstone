import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-receptionist-appointments',
  templateUrl: './receptionist-appointments.component.html',
  styleUrls: ['./receptionist-appointments.component.scss'],
  providers: [DatePipe]
})
export class ReceptionistAppointmentsComponent implements OnInit {

  // Form for editing/rescheduling appointments
  itemForm: FormGroup;

  // Default form model
  formModel: any = {};

  // Stores response messages
  responseMessage: any;

  // List of appointments
  appointmentList: any[] = [];

  // Flag to identify edit mode
  isAdded: boolean = false;

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) {
    // Initialize reactive form
    this.itemForm = this.formBuilder.group({
      id: [''],
      time: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAppointments();
  }

  // Fetch all appointments
  getAppointments() {
    this.httpService.getAllAppointments().subscribe((data: any) => {
      this.appointmentList = data;
      console.log(this.appointmentList);
    });
  }

  // Edit selected appointment
  editAppointment(val: any) {
    this.itemForm.patchValue({
      id: val.id,
      time: val.time
    });
    this.isAdded = true;
  }

  // Submit reschedule request
  onSubmit() {
    const formattedTime = this.datePipe.transform(
      this.itemForm.value.time,
      'yyyy-MM-dd HH:mm:ss'
    );

    this.httpService.reScheduleAppointment(
      this.itemForm.value.id,
      formattedTime
    ).subscribe((response: any) => {
      this.responseMessage = response;
      this.itemForm.reset();
      this.isAdded = false;
      this.getAppointments();
    });
  }
}
