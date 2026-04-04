import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {

  roleName: string | null = null;
  username: string = '';
  greeting: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // ✅ Route protection (works for both getter or method)
    const isLoggedIn = typeof (this.authService as any).getLoginStatus === 'function'
      ? (this.authService as any).getLoginStatus()
      : (this.authService as any).getLoginStatus;

    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    // ✅ Get role (works for both getter or method)
    this.roleName = typeof (this.authService as any).getRole === 'function'
      ? (this.authService as any).getRole()
      : (this.authService as any).getRole;

    // ✅ Get username from JWT (sub claim)
    this.username = this.getUsernameFromToken();

    // ✅ Greeting based on local time
    this.greeting = this.getGreetingByTime();
  }

  private getUsernameFromToken(): string {
    const token = localStorage.getItem('token');
    if (!token) return 'User';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || 'User';
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
}