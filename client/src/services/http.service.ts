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
   *  - "2026-04-03T14:51" -> "2026-04-03T14:51:00"
   *  - "2026-04-03T14:51:00" -> unchanged
   *  - "2026-04-03 14:51:00" -> "2026-04-03T14:51:00"
   *  - "2026-04-03T14:51:00.000+00:00" -> "2026-04-03T14:51:00"
   */
  private toLocalDateTimeString(value: any): string {
    if (!value) return value;

    // If accidentally passed object {time, display}, extract time
    const raw = typeof value === 'string' ? value : value?.time;
    if (!raw) return value;

    // Convert space to 'T' if needed
    let v = raw.includes(' ') ? raw.replace(' ', 'T') : raw;

    // If it's like "yyyy-MM-ddTHH:mm" append seconds
    if (v.length === 16) {
      v = v + ':00';
    }

    // If it includes milliseconds/zone, trim to seconds
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

    return this.http.put(
      `${this.serverName}/api/doctor/appointment/${id}/reschedule`,
      { time: fixedTime },
      { headers }
    );
  }

  /* ===================== DOCTOR SLOTS ===================== */

  generateDoctorSlots(doctorId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      `${this.serverName}/api/doctor/${doctorId}/generate-slots`,
      {},
      { headers }
    );
  }

  getDoctorSlots(doctorId: number, date: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.serverName}/api/doctor/${doctorId}/slots?date=${date}`,
      { headers }
    );
  }

  updateDoctorSlot(doctorId: number, time: any, available: boolean): Observable<any> {
    const headers = this.getAuthHeaders();
    const fixedTime = this.toLocalDateTimeString(time);

    return this.http.put(
      `${this.serverName}/api/doctor/${doctorId}/slot?available=${available}`,
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

  // ✅ Receptionist: slot-based schedule appointment
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

  /* ✅✅ NEW: RECEPTIONIST SLOT APIs (ADD THESE) ✅✅ */

  // ✅ 1) Receptionist: Get AVAILABLE slots for booking UI (returns [{time, display}])
  getReceptionistAvailableSlots(doctorId: number, date: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.serverName}/api/receptionist/doctor/${doctorId}/available-slots?date=${date}`,
      { headers }
    );
  }

  // ✅ 2) Receptionist: Get ALL slots to view why locked (AVAILABLE/BLOCKED/BOOKED)
  getReceptionistDoctorSlots(doctorId: number, date: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.serverName}/api/receptionist/doctor/${doctorId}/slots?date=${date}`,
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

  // ✅ Patient: get available slots for a doctor + date
  getAvailableSlotsForDoctor(doctorId: number, date: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(
      `${this.serverName}/api/patient/doctor/${doctorId}/available-slots?date=${date}`,
      { headers }
    );
  }

  // ✅ Patient: schedule using slot (safeTime handles string or {time, display})
  scheduleAppointmentWithSlot(patientId: number, doctorId: number, slotTime: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const safeTime = this.toLocalDateTimeString(slotTime);

    return this.http.post(
      `${this.serverName}/api/patient/appointment?patientId=${patientId}&doctorId=${doctorId}`,
      { time: safeTime },
      { headers }
    );
  }

  /* ===================== AUTH / CAPTCHA ===================== */

  getCaptcha(): Observable<any> {
    return this.http.get<any>(
      `${this.serverName}/api/captcha`,
      { withCredentials: true }
    );
  }

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
  /* ===================== MEDICAL RECORDS (PRESCRIPTION) ===================== */

// ✅ Doctor creates a medical record (diagnosis, treatment, prescriptionItems[])
createMedicalRecord(patientId: number, doctorId: number, recordBody: any): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.post(
    `${this.serverName}/api/doctor/medicalrecords?patientId=${patientId}&doctorId=${doctorId}`,
    recordBody,
    { headers }
  );
}

// ✅ Doctor updates an existing medical record
updateMedicalRecord(recordId: number, doctorId: number, recordBody: any): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.put(
    `${this.serverName}/api/doctor/medicalrecords/${recordId}?doctorId=${doctorId}`,
    recordBody,
    { headers }
  );
}

// ✅ Doctor fetch record by ID (useful for edit screen)
getMedicalRecordByIdForDoctor(recordId: number): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.get(
    `${this.serverName}/api/doctor/medicalrecords/${recordId}`,
    { headers }
  );
}

// ✅ Patient gets all medical records (timeline list)
getPatientMedicalRecords(patientId: number): Observable<any[]> {
  const headers = this.getAuthHeaders();
  return this.http.get<any[]>(
    `${this.serverName}/api/patient/medicalrecords?patientId=${patientId}`,
    { headers }
  );
}

// ✅ Patient gets single medical record details
getPatientMedicalRecordById(recordId: number): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.get(
    `${this.serverName}/api/patient/medicalrecords/${recordId}`,
    { headers }
  );
}

// ✅ Patient downloads prescription PDF (IMPORTANT: responseType = blob)
downloadPrescriptionPdf(recordId: number): Observable<Blob> {
  const headers = this.getAuthHeaders();
  return this.http.get(
    `${this.serverName}/api/patient/medicalrecords/${recordId}/pdf`,
    { headers, responseType: 'blob' }
  );
}
}