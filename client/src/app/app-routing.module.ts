import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { AppComponent } from './app.component';
import { DashbaordComponent } from './dashbaord/dashbaord.component';
import { PatientAppointmentComponent } from './patient-appointment/patient-appointment.component';
import { ScheduleAppointmentComponent } from './schedule-appointment/schedule-appointment.component';
import { DoctorAppointmentComponent } from './doctor-appointment/doctor-appointment.component';
import { DoctorAvailabilityComponent } from './doctor-availability/doctor-availability.component';
import { ReceptionistAppointmentsComponent } from './receptionist-appointments/receptionist-appointments.component';
import { ReceptionistScheduleAppointmentsComponent } from './receptionist-schedule-appointments/receptionist-schedule-appointments.component';
import { HomeComponent } from './home/home.component';
import { PatientMedicalRecordsComponent } from './patient-medical-records/patient-medical-records.component';
import { DoctorMedicalRecordComponent } from './doctor-medical-record/doctor-medical-record.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'dashboard', component: DashbaordComponent }, 
  { path: 'patient-appointment', component: PatientAppointmentComponent }, 
  { path: 'schedule-appointment', component: ScheduleAppointmentComponent }, 
  { path: 'doctor-appointment', component: DoctorAppointmentComponent }, 
  { path: 'doctor-availability', component: DoctorAvailabilityComponent },
  { path: 'receptionist-appointments', component: ReceptionistAppointmentsComponent },
  { path: 'receptionist-schedule-appointments', component: ReceptionistScheduleAppointmentsComponent },
  { path: 'home' , component: HomeComponent},
  { path: 'patient-medical-records', component: PatientMedicalRecordsComponent },
  { path: 'doctor-medical-record', component: DoctorMedicalRecordComponent },
  { path: 'doctor-medical-record/:recordId', component: DoctorMedicalRecordComponent },
  
  // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  // { path: '**', redirectTo: '/dashboard', pathMatch: 'full' },

  // { path: '', redirectTo: '/login', pathMatch: 'full' },
  // { path: '**', redirectTo: '/login', pathMatch: 'full' },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
