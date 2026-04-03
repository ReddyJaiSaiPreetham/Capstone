import { ApplicationInitStatus, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistrationComponent } from './registration/registration.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpService } from '../services/http.service';
import { DashbaordComponent } from './dashbaord/dashbaord.component';
import { PatientAppointmentComponent } from './patient-appointment/patient-appointment.component';

import { ScheduleAppointmentComponent } from './schedule-appointment/schedule-appointment.component';

import { DoctorAppointmentComponent } from './doctor-appointment/doctor-appointment.component';
import { DoctorAvailabilityComponent } from './doctor-availability/doctor-availability.component';
import { ReceptionistAppointmentsComponent } from './receptionist-appointments/receptionist-appointments.component';
import { ReceptionistScheduleAppointmentsComponent } from './receptionist-schedule-appointments/receptionist-schedule-appointments.component';
import { HomeComponent } from './home/home.component';
import { DoctorMedicalRecordComponent } from './doctor-medical-record/doctor-medical-record.component';
import { PatientMedicalRecordsComponent } from './patient-medical-records/patient-medical-records.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    DashbaordComponent,
    PatientAppointmentComponent,
    ScheduleAppointmentComponent,
    DoctorAvailabilityComponent,
    DoctorAppointmentComponent,
    ReceptionistAppointmentsComponent,
    ReceptionistScheduleAppointmentsComponent,
    HomeComponent,
    DoctorMedicalRecordComponent,
    PatientMedicalRecordsComponent,

    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [HttpService, HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
