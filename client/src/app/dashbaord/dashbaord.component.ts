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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.roleName = this.authService.getRole;

    // Safety check: if not logged in, redirect to login
    if (!this.authService.getLoginStatus) {
      this.router.navigate(['/login']);
    }
  }
}
``
