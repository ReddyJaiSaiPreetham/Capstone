import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {

  roleName: string | null = null;
  username: string = '';
  greeting: string = '';

  showProfile: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {

    
    if (!this.authService.getLoginStatus) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.roleName = this.authService.getRole;
    this.username = this.getUsernameFromToken();
    this.greeting = this.getGreetingByTime();
  }

  private getUsernameFromToken(): string {
    const token = localStorage.getItem('token');
    if (!token) return 'User';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.sub || 'User';
    } catch {
      return 'User';
    }
  }

  private getGreetingByTime(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  }

  // Toggle profile dropdown
  toggleProfile(): void {
    this.showProfile = !this.showProfile;
  }

  // Update username via backend
  updateUsername(): void {
    this.httpService.updateUsername(this.username).subscribe({
      next: () => {
        alert('Username updated successfully. Please login again.');
        this.logout();
      },
      error: () => {
        alert('Failed to update username');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.showProfile = false;
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
