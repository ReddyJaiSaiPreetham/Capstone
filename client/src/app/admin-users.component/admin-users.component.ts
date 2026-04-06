import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {

  users: any[] = [];
  filtered: any[] = [];

  searchText: string = '';
  loading: boolean = false;

  currentPage: number = 1;
  pageSize: number = 10;

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;

    this.httpService.getPatientsForAdmin().subscribe({
      next: (data: any[]) => {
        this.users = Array.isArray(data) ? data : [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Load patients failed:', err);
        this.users = [];
        this.filtered = [];
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const q = (this.searchText || '').toLowerCase().trim();

    this.filtered = this.users.filter(u => {
      const name = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
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
  
  isMobileMenuOpen: boolean = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}