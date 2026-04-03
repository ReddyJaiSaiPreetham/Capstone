import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-patient-medical-records',
  templateUrl: './patient-medical-records.component.html',
  styleUrls: ['./patient-medical-records.component.scss']
})
export class PatientMedicalRecordsComponent implements OnInit {

  records: any[] = [];
  selectedRecord: any = null;

  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userIdString = localStorage.getItem('userId');
    const patientId = userIdString ? parseInt(userIdString, 10) : null;

    if (!patientId) {
      this.loading = false;
      this.errorMessage = 'Patient not logged in';
      return;
    }

    this.httpService.getPatientMedicalRecords(patientId).subscribe({
      next: (data: any[]) => {
        this.records = Array.isArray(data) ? data : [];
        // sort latest first (if recordDate exists)
        this.records.sort((a, b) => {
          const da = a?.recordDate ? new Date(a.recordDate).getTime() : 0;
          const db = b?.recordDate ? new Date(b.recordDate).getTime() : 0;
          return db - da;
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Load records failed:', err);
        this.records = [];
        this.loading = false;
        this.errorMessage =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message || 'Failed to load medical records');
      }
    });
  }

  viewRecord(record: any): void {
    this.selectedRecord = record;
  }

  closeView(): void {
    this.selectedRecord = null;
  }

  downloadPdf(recordId: number): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.httpService.downloadPrescriptionPdf(recordId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `prescription_${recordId}.pdf`;
        a.click();

        window.URL.revokeObjectURL(url);
        this.successMessage = 'Prescription PDF downloaded ✅';
      },
      error: (err) => {
        console.error('PDF download failed:', err);
        this.errorMessage =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message || 'Failed to download PDF');
      }
    });
  }

  // nice display formatting
  formatDateTime(dt: string): string {
    if (!dt) return '';
    const clean = dt.substring(0, 19).replace('T', ' ');
    const [datePart, timePart] = clean.split(' ');
    if (!datePart || !timePart) return dt;

    const [y, m, d] = datePart.split('-');
    const [hh, mm] = timePart.split(':');

    const hour = parseInt(hh, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${d}-${m}-${y} ${displayHour}:${mm} ${ampm}`;
  }
}