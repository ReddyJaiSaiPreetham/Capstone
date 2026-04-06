import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-admin-receptionists',
  templateUrl: './admin-receptionists.component.html',
  styleUrls: ['./admin-receptionists.component.scss']
})
export class AdminReceptionistsComponent implements OnInit {

  receptionists: any[] = [];
  filtered: any[] = [];

  searchText: string = '';
  loading: boolean = false;

  message: string = '';
  isError: boolean = false;

  currentPage: number = 1;
  pageSize: number = 10;

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.loadReceptionists();
  }

  loadReceptionists(): void {
    this.loading = true;
    this.message = '';
    this.isError = false;

    this.httpService.getReceptionistsForAdmin().subscribe({
      next: (data: any[]) => {
        this.receptionists = Array.isArray(data) ? data : [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Load receptionists failed:', err);
        this.receptionists = [];
        this.filtered = [];
        this.loading = false;
        this.isError = true;
        this.message =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message || 'Failed to load receptionists');
      }
    });
  }

  applyFilter(): void {
    const q = (this.searchText || '').toLowerCase().trim();

    this.filtered = this.receptionists.filter(r => {
      const name = (r.username || '').toLowerCase();
      const email = (r.email || '').toLowerCase();
      const role = (r.role || '').toLowerCase();
      const status = (r.active === true ? 'active' : 'inactive');
      return name.includes(q) || email.includes(q) || role.includes(q) || status.includes(q);
    });

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

  toggleActive(user: any): void {
    if (!user?.id) return;

    this.message = '';
    this.isError = false;

    if (user.active === true) {
      const ok = confirm(`Deactivate receptionist "${user.username}"?`);
      if (!ok) return;
    }

    const req$ = (user.active === true)
      ? this.httpService.deactivateUserByAdmin(user.id)
      : this.httpService.activateUserByAdmin(user.id);

    req$.subscribe({
      next: (res: any) => {
        user.active = !(user.active === true);

        this.message = res?.message
          ? res.message + ' ✅'
          : (user.active ? 'Receptionist activated ✅' : 'Receptionist deactivated ✅');

        this.applyFilter();
        setTimeout(() => (this.message = ''), 2500);
      },
      error: (err) => {
        console.error('Toggle receptionist failed:', err);
        this.isError = true;
        this.message =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message || 'Failed to update status');
      }
    });
  }

  badgeClass(active: boolean): string {
    return active ? 'badge-active' : 'badge-inactive';
  }

  statusLabel(active: boolean): string {
    return active ? 'ACTIVE' : 'INACTIVE';
  }

  isMobileMenuOpen: boolean = false;

    toggleMobileMenu(): void {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }
}