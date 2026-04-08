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
import { AdminDoctorsComponent } from './admin-doctors.component/admin-doctors.component';
import { AdminReceptionistsComponent } from './admin-receptionists/admin-receptionists.component';
import { AdminUsersComponent } from './admin-users.component/admin-users.component';
import { AuthGuard } from './guards/auth.guard';



const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'dashboard', component: DashbaordComponent, canActivate: [AuthGuard] }, 
  { path: 'patient-appointment', component: PatientAppointmentComponent, canActivate: [AuthGuard] }, 
  { path: 'schedule-appointment', component: ScheduleAppointmentComponent, canActivate: [AuthGuard] }, 
  { path: 'doctor-appointment', component: DoctorAppointmentComponent , canActivate: [AuthGuard]}, 
  { path: 'doctor-availability', component: DoctorAvailabilityComponent , canActivate: [AuthGuard]},
  { path: 'receptionist-appointments', component: ReceptionistAppointmentsComponent , canActivate: [AuthGuard]},
  { path: 'receptionist-schedule-appointments', component: ReceptionistScheduleAppointmentsComponent , canActivate: [AuthGuard]},
  { path: 'home' , component: HomeComponent},
  { path: 'patient-medical-records', component: PatientMedicalRecordsComponent, canActivate: [AuthGuard] },
  { path: 'doctor-medical-record', component: DoctorMedicalRecordComponent, canActivate: [AuthGuard] },
  { path: 'doctor-medical-record/:recordId', component: DoctorMedicalRecordComponent, canActivate: [AuthGuard] },
  { path: 'admin-doctors', component: AdminDoctorsComponent , canActivate: [AuthGuard]},
  { path: 'admin-receptionists', component: AdminReceptionistsComponent, canActivate: [AuthGuard] },
  { path: 'admin-users', component: AdminUsersComponent , canActivate: [AuthGuard]},

  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
