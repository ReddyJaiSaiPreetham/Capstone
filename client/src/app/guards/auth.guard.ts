import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('token');

    // If no token -> block navigation
    if (!token) {
      return this.router.createUrlTree(['/login']);
    }

    // Optional: If you have token-expiry check, apply it here

    return true;
  }
}