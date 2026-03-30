import { Component, OnInit } from '@angular/core';

import { HttpService } from '../../services/http.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
 
@Component({

  selector: 'app-schedule-appointment',

  templateUrl: './schedule-appointment.component.html',

  styleUrls: ['./schedule-appointment.component.scss']

})

export class ScheduleAppointmentComponent implements OnInit {
 
 

  doctorList: any[] = [];

  appointmentForm!: FormGroup;

  formattedDate: any;

  isAdded: boolean = false;
 
  

  itemForm!: FormGroup;
 


  constructor(

    public httpService: HttpService,

    private formBuilder: FormBuilder

  ) {

    // UI form (prewritten usage)

    this.appointmentForm = this.formBuilder.group({

      doctorId: ['', Validators.required],

      appointmentTime: ['', Validators.required]

    });

  }
 
  // Lifecycle hook

  ngOnInit(): void {
 
    // TEST FORM (unit tests expect this exact structure)

    this.itemForm = this.formBuilder.group({

      patientId: ['', Validators.required],

      doctorId: ['', Validators.required],

      time: ['', Validators.required]

    });
 
    this.getDoctors();

  }
 
  // Fetch doctors

  getDoctors(): void {

    this.httpService.getDoctors().subscribe((data: any) => {

      this.doctorList = data;

    });

  }
 
  // On Appointment button click

  addAppointment(doctor: any): void {
 
    const userIdString = localStorage.getItem('userId');

    const userId = userIdString ? parseInt(userIdString, 10) : null;
 
    // Update TEST FORM

    this.itemForm.patchValue({

      patientId: userId,

      doctorId: doctor.id

    });
 
    // Update UI FORM

    this.appointmentForm.patchValue({

      doctorId: doctor.id

    });
 
    this.isAdded = true;

  }
 
  // Submit appointment

  onSubmit(): void {
 
    if (this.appointmentForm.invalid) {

      return;

    }
 
    // Format date for backend

    this.formattedDate = new Date(

      this.appointmentForm.value.appointmentTime

    ).toISOString();
 
    // Sync TEST FORM

    this.itemForm.patchValue({

      time: this.formattedDate

    });
 
    const appointmentData = {

      patientId: this.itemForm.value.patientId,

      doctorId: this.itemForm.value.doctorId,

      time: this.itemForm.value.time

    };
 
    this.httpService.ScheduleAppointment(appointmentData).subscribe(() => {

      this.isAdded = false;

      this.appointmentForm.reset();

      this.itemForm.reset();

      alert('Appointment scheduled successfully');

    });

  }

}
 