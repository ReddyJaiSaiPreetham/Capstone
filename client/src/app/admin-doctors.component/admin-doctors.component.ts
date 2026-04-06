import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service'; // adjust path if needed

@Component({
  selector: 'app-admin-doctors',
  templateUrl: './admin-doctors.component.html',
  styleUrls: ['./admin-doctors.component.scss']
})
export class AdminDoctorsComponent implements OnInit {

  doctors: any[] = [];
  filtered: any[] = [];

  searchText: string = '';
  loading: boolean = false;

  message: string = '';
  isError: boolean = false;

  // pagination (simple)
  currentPage = 1;
  pageSize = 10;

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.message = '';
    this.isError = false;

    this.httpService.getDoctorsForAdmin().subscribe({
      next: (data: any[]) => {
        this.doctors = Array.isArray(data) ? data : [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Load doctors failed:', err);
        this.doctors = [];
        this.filtered = [];
        this.loading = false;
        this.isError = true;
        this.message =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message || 'Failed to load doctors');
      }
    });
  }

  applyFilter(): void {
    const q = (this.searchText || '').toLowerCase().trim();

    this.filtered = this.doctors.filter(d => {
      const name = (d.username || '').toLowerCase();
      const email = (d.email || '').toLowerCase();
      const role = (d.role || '').toLowerCase();
      const status = (d.active === true ? 'active' : 'inactive');
      return name.includes(q) || email.includes(q) || role.includes(q) || status.includes(q);
    });

    // reset page when filtering
    this.currentPage = 1;
  }

  get paginated(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  prev(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  next(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  toggleActive(doctor: any): void {
    if (!doctor?.id) return;

    this.message = '';
    this.isError = false;

    // confirm before deactivating
    if (doctor.active === true) {
      const ok = confirm(`Deactivate doctor "${doctor.username}"?`);
      if (!ok) return;
    }

    const req$ = (doctor.active === true)
      ? this.httpService.deactivateUserByAdmin(doctor.id)
      : this.httpService.activateUserByAdmin(doctor.id);

    req$.subscribe({
      next: (res: any) => {
        // update local state immediately
        doctor.active = !(doctor.active === true);

        this.message = res?.message
          ? res.message + ' ✅'
          : (doctor.active ? 'Doctor activated ✅' : 'Doctor deactivated ✅');

        // keep filter results updated
        this.applyFilter();

        setTimeout(() => (this.message = ''), 2500);
      },
      error: (err) => {
        console.error('Toggle active failed:', err);
        this.isError = true;
        this.message =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message || 'Failed to update user status');
      }
    });
  }

  badgeClass(active: boolean): string {
    return active ? 'badge-inactive' : 'badge-inactive';
  }

  statusLabel(active: boolean): string {
    return active ? 'ACTIVE' : 'INACTIVE';
  }

  
isMobileMenuOpen: boolean = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

}