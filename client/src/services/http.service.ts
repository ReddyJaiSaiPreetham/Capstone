import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public serverName = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /* ===================== COMMON HEADERS ===================== */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.getToken()
    });
  }

  /**
   * ✅ Convert frontend datetime to backend LocalDateTime string
   * Accepts:
   *  - "2026-04-03T14:51" (from datetime-local) -> "2026-04-03T14:51:00"
   *  - "2026-04-03T14:51:00" -> unchanged
   *  - "2026-04-03 14:51:00" -> "2026-04-03T14:51:00"
   */
  private toLocalDateTimeString(value: string): string {
    if (!value) return value;

    // Convert space to 'T' if needed
    let v = value.includes(' ') ? value.replace(' ', 'T') : value;

    // If it's like "yyyy-MM-ddTHH:mm" append seconds
    if (v.length === 16) {
      v = v + ':00';
    }

    // If it includes milliseconds/zone, trim to seconds
    // e.g. "2026-04-03T14:51:00.000+00:00" -> "2026-04-03T14:51:00"
    if (v.length > 19) {
      v = v.substring(0, 19);
    }

    return v;
  }

  /* ===================== DOCTOR ===================== */

  updateDoctorAvailability(doctorId: any, availability: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      `${this.serverName}/api/doctor/availability?doctorId=${doctorId}&availability=${availability}`,
      {},
      { headers }
    );
  }

  getAppointmentByDoctor(id: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.serverName}/api/doctor/appointments?doctorId=${id}`,
      { headers }
    );
  }

  completeAppointment(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(
      `${this.serverName}/api/doctor/appointment/${id}/complete`,
      {},
      { headers }
    );
  }

  updateCompletionStatus(id: number, status: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(
      `${this.serverName}/api/doctor/appointment/${id}/completion-status`,
      { completionstatus: status },
      { headers }
    );
  }

  doctorRescheduleAppointment(id: number, time: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const fixedTime = this.toLocalDateTimeString(time);

    // Backend expects TimeDto -> { "time": "yyyy-MM-dd'T'HH:mm:ss" }
    return this.http.put(
      `${this.serverName}/api/doctor/appointment/${id}/reschedule`,
      { time: fixedTime },
      { headers }
    );
  }

  /* ===================== RECEPTIONIST ===================== */

  getAllAppointments(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.serverName}/api/receptionist/appointments`,
      { headers }
    );
  }

  getAllPatients(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.serverName}/api/receptionist/patients`,
      { headers }
    );
  }

  getDoctorsForReceptionist(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.serverName}/api/receptionist/doctors`,
      { headers }
    );
  }

  ScheduleAppointmentByReceptionist(details: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const fixedTime = this.toLocalDateTimeString(details.time);

    return this.http.post(
      `${this.serverName}/api/receptionist/appointment?patientId=${details.patientId}&doctorId=${details.doctorId}`,
      { time: fixedTime },
      { headers }
    );
  }

  reScheduleAppointment(appointmentId: any, formvalue: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const fixedTime = this.toLocalDateTimeString(formvalue.time);

    return this.http.put(
      `${this.serverName}/api/receptionist/appointment-reschedule/${appointmentId}`,
      { time: fixedTime },
      { headers }
    );
  }

  deleteAppointment(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(
      `${this.serverName}/api/receptionist/appointment/${id}`,
      { headers }
    );
  }

  /* ===================== PATIENT ===================== */

  getDoctors(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.serverName}/api/patient/doctors`,
      { headers }
    );
  }

  getAppointmentByPatient(id: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.serverName}/api/patient/appointments?patientId=${id}`,
      { headers }
    );
  }

  ScheduleAppointment(details: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const fixedTime = this.toLocalDateTimeString(details.time);

    return this.http.post(
      `${this.serverName}/api/patient/appointment?patientId=${details.patientId}&doctorId=${details.doctorId}`,
      { time: fixedTime },
      { headers }
    );
  }

  /* ===================== AUTH / CAPTCHA ===================== */

  // Captcha needs session cookie -> withCredentials
  getCaptcha(): Observable<any> {
    return this.http.get<any>(
      `${this.serverName}/api/captcha`,
      { withCredentials: true }
    );
  }

  // Login also needs same session for captcha validation -> withCredentials
  Login(details: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.serverName}/api/user/login`,
      details,
      { headers, withCredentials: true }
    );
  }

  registerPatient(details: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.serverName}/api/patient/register`,
      details,
      { headers }
    );
  }

  registerDoctors(details: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.serverName}/api/doctors/register`,
      details,
      { headers }
    );
  }

  registerReceptionist(details: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.serverName}/api/receptionist/register`,
      details,
      { headers }
    );
  }

  /* ===================== PROFILE ===================== */

  getProfile(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(
      `${this.serverName}/api/profile`,
      { headers }
    );
  }

  updateUsername(username: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(
      `${this.serverName}/api/profile/username`,
      { username },
      { headers }
    );
  }

  // ✅ Generate slots for next 10 days (9AM–9PM)
generateDoctorSlots(doctorId: number): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.post(
    `${this.serverName}/api/doctor/${doctorId}/generate-slots`,
    {},
    { headers }
  );
}

// ✅ Get slots for doctor on a date (YYYY-MM-DD)
getDoctorSlots(doctorId: number, date: string): Observable<any[]> {
  const headers = this.getAuthHeaders();
  return this.http.get<any[]>(
    `${this.serverName}/api/doctor/${doctorId}/slots?date=${date}`,
    { headers }
  );
}

// ✅ Toggle one slot
updateDoctorSlot(doctorId: number, time: string, available: boolean): Observable<any> {
  const headers = this.getAuthHeaders();
  // time must be ISO: "YYYY-MM-DDTHH:mm:ss"
  return this.http.put(
    `${this.serverName}/api/doctor/${doctorId}/slot?available=${available}`,
    { time },
    { headers }
  );
}


// ✅ Patient: get available slots for a doctor and date
getAvailableSlotsForDoctor(doctorId: number, date: string): Observable<any[]> {
  const headers = this.getAuthHeaders();
  return this.http.get<any[]>(
    `${this.serverName}/api/patient/doctor/${doctorId}/available-slots?date=${date}`,
    { headers }
  );
}
scheduleAppointmentWithSlot(patientId: number, doctorId: number, slotTime: any): Observable<any> {
  const headers = this.getAuthHeaders();

  // ✅ If slotTime was accidentally passed as object, extract the real value
  const safeTime = typeof slotTime === 'string' ? slotTime : slotTime?.time;

  return this.http.post(
    `${this.serverName}/api/patient/appointment?patientId=${patientId}&doctorId=${doctorId}`,
    { time: safeTime },
    { headers }   // ✅ backend now returns JSON {message:...}
  );
}
}