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
  greeting: string = '';   // :white_check_mark: NEW

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // :white_check_mark: Route protection
    if (!this.authService.getLoginStatus) {
      this.router.navigate(['/login']);
      return;
    }

    // :white_check_mark: Get role
    this.roleName = this.authService.getRole;

    // :white_check_mark: Get username from JWT
    this.username = this.getUsernameFromToken();

    // :white_check_mark: Set greeting based on local time
    this.greeting = this.getGreetingByTime();
  }

  /** :white_check_mark: Extract username from JWT (sub claim) */
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

  /** :white_check_mark: Determine greeting using local time */
  private getGreetingByTime(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  }
}