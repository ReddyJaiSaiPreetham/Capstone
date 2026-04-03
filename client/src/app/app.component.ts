import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  IsLoggin: boolean = false;
  roleName: string | null = null;

  username: string = '';          // ✅ used in HTML
  showProfile: boolean = false;   // ✅ used in HTML

  constructor(
    private authService: AuthService,
    private router: Router,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.IsLoggin = this.authService.getLoginStatus;
    this.roleName = this.authService.getRole;

    if (!this.IsLoggin) {
      this.router.navigateByUrl('/login');
      this.router.navigateByUrl('/home');
    }

    // ✅ Load logged-in user profile
    this.loadProfile();
  }

  // ✅ Fetch username from backend (/api/profile)
  loadProfile() {
    this.httpService.getProfile().subscribe({
      next: (res) => {
        this.username = res.username;
      },
      error: () => {
        console.error('Failed to load profile');
      }
    });
  }

  // ✅ Open profile modal
  // openProfile() {
  //   this.showProfile = true;
  // }

  // // ✅ Close profile modal
  // closeProfile() {
  //   this.showProfile = false;
  // }

  // ✅ Update username (JWT-safe)
  updateUsername() {
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

  // ✅ Logout (used in navbar)
  logout() {
    this.authService.logout();
    window.location.reload();
  }

 toggleProfile() {
  this.showProfile = !this.showProfile;

  if (this.showProfile) {
    document.body.classList.add('profile-open');
  } else {
    document.body.classList.remove('profile-open');
  }
}

}
