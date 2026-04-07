import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private isLoggedInFlag: boolean = false;

  constructor() {}

  // Save token received from login
  saveToken(token: string): void {
    this.token = token;
    this.isLoggedInFlag = true;
    localStorage.setItem('token', token);
  }

  // Save role
  SetRole(role: any): void {
    localStorage.setItem('role', role);
  }

  // Get role
  get getRole(): string | null {
    return localStorage.getItem('role');
  }

  // Save userId
  saveUserId(userid: string): void {
    localStorage.setItem('userId', userid);
  }

  // Read token
  getToken(): string | null {
    this.token = localStorage.getItem('token');
    return this.token;
  }

  // Existing getter (works)
  get getLoginStatus(): boolean {
    return !!localStorage.getItem('token');
  }

  // NEW: Simple method (useful in app.component.ts)
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');

  // Optional: clear any cached session-only data
  sessionStorage.clear();

  // Replace browser state
  history.replaceState(null, '', '/login');
}
}
