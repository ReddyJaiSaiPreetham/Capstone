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

  // ✅ nice display formatting + timezone-safe (IST)
formatDateTime(dt: string): string {
  if (!dt) return '';

  // Take only "yyyy-MM-ddTHH:mm:ss"
  const base = dt.substring(0, 19);

  // If backend didn't send timezone, treat it as UTC (append Z)
  // This fixes the exact "17:09 shows 11:39" issue.
  const hasTZ = /[zZ]|([+\-]\d{2}:\d{2})$/.test(dt);
  const iso = hasTZ ? dt : `${base}Z`;

  const d = new Date(iso);

  // Format as IST (Asia/Kolkata)
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).formatToParts(d);

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  const dd = get('day');
  const mm = get('month');
  const yy = get('year');
  const hh = get('hour');
  const min = get('minute');
  const ap = get('dayPeriod').toUpperCase();

  return `${dd}-${mm}-${yy} ${hh}:${min} ${ap}`;
}

  isMobileMenuOpen: boolean = false;

    toggleMobileMenu(): void {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

  
closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

}