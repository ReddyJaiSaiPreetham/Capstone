import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
 
export class HttpService {

  // Stores base API URL
  public serverName = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // COMMON HEADER WITH JWT
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.getToken()
    });
  }

  // 1. UPDATE DOCTOR AVAILABILITY
  updateDoctorAvailability(doctorId: any, availability: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      `${this.serverName}/api/doctor/availability?doctorId=${doctorId}&availability=${availability}`,
      {},
      { headers }
    );
  }

  // 2. GET ALL APPOINTMENTS
  getAllAppointments(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.serverName}/api/receptionist/appointments`,
      { headers }
    );
  }

  // 3. GET APPOINTMENTS BY DOCTOR
  getAppointmentByDoctor(id: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.serverName}/api/doctor/appointments?doctorId=${id}`,
      { headers }
    );
  }

  // 4. GET APPOINTMENTS BY PATIENT
  getAppointmentByPatient(id: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.serverName}/api/patient/appointments?patientId=${id}`,
      { headers }
    );
  }

// 5. SCHEDULE APPOINTMENT (PATIENT)
// 5. SCHEDULE APPOINTMENT (PATIENT)
ScheduleAppointment(details: any): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.post(
    `${this.serverName}/api/patient/appointment?patientId=${details.patientId}&doctorId=${details.doctorId}`,
    { time: details.time },
    {
      headers,
      responseType: 'text' as 'json'   // ✅ CRITICAL FIX
    }
  );
}


// 6. SCHEDULE APPOINTMENT (RECEPTIONIST)
ScheduleAppointmentByReceptionist(details: any): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.post(
    `${this.serverName}/api/receptionist/appointment?patientId=${details.patientId}&doctorId=${details.doctorId}`,
    { time: details.time },
    { headers }
  );
}

  // 7. RESCHEDULE APPOINTMENT
  reScheduleAppointment(appointmentId: any, formvalue: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(
      `${this.serverName}/api/receptionist/appointment-reschedule/${appointmentId}`,
      { time: formvalue.time },
      { headers }
    );
  }

  // 8. GET DOCTORS LIST
  getDoctors(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.serverName}/api/patient/doctors`,
      { headers }
    );
  }

  // 9. LOGIN
  Login(details: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(
      `${this.serverName}/api/user/login`,
      details,
      { headers }
    );
  }

  // 10. REGISTER PATIENT
  registerPatient(details: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(
      `${this.serverName}/api/patient/register`,
      details,
      { headers }
    );
  }

  // 11. REGISTER DOCTOR
  registerDoctors(details: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(
      `${this.serverName}/api/doctors/register`,
      details,
      { headers }
    );
  }

  // 12. REGISTER RECEPTIONIST
  registerReceptionist(details: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(
      `${this.serverName}/api/receptionist/register`,
      details,
      { headers }
    );
  }
} 