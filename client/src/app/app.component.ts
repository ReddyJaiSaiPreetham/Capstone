import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  IsLoggin: boolean = false;
  roleName: string | null = null;

  username: string = '';
  showProfile: boolean = false;
  showNavbar: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private httpService: HttpService
  ) {

    this.router.events.subscribe((event) => {

      
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url;
        this.showNavbar = url !== '/home';
      }

      
      if (event instanceof NavigationStart) {
        const trigger = event.navigationTrigger; 

        if (trigger === 'popstate' && event.url === '/home') {
          this.authService.logout();

          this.IsLoggin = false;
          this.roleName = null;

          this.showProfile = false;
          document.body.classList.remove('profile-open');
        }
      }
    });
  }

  ngOnInit(): void {

    window.addEventListener('pageshow', (event: PageTransitionEvent) => {
      if ((event as any).persisted) {
        const url = this.router.url || '/';
        if (!this.authService.getLoginStatus && this.isProtectedUrl(url)) {
          this.router.navigate(['/login'], { replaceUrl: true });
        }
      }
    });

    this.IsLoggin = this.authService.getLoginStatus;
    this.roleName = this.authService.getRole;

    if (this.IsLoggin) {
      this.loadProfile();
    }
  }

  private isProtectedUrl(url: string): boolean {
    const clean = (url || '').split('?')[0]; 
    const publicRoutes = ['/home', '/login', '/registration', '/'];

    return !publicRoutes.includes(clean);
  }

  loadProfile(): void {
    this.httpService.getProfile().subscribe({
      next: (res) => {
        this.username = res?.username || '';
      },
      error: () => {
        console.error('Failed to load profile');
      }
    });
  }

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
    document.body.classList.remove('profile-open');

    this.router.navigate(['/login'], { replaceUrl: true });
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile;

    if (this.showProfile) {
      document.body.classList.add('profile-open');
    } else {
      document.body.classList.remove('profile-open');
    }
  }
}