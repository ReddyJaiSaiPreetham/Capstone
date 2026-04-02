import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  itemForm!: FormGroup;

  captcha: string = '';
  showError: boolean = false;
  errorMessage: string = '';

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.itemForm = this.formBuilder.group({

      username: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(20),
          Validators.pattern('^[A-Za-z_][A-Za-z0-9_]*$')
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
        ]
      ],
      captcha: ['', Validators.required]
    });

    this.loadCaptcha();
  }

  loadCaptcha(): void {
    this.httpService.getCaptcha().subscribe({
      next: (data: any) => {
        this.captcha = data.captcha;
        this.itemForm.get('captcha')?.reset();
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Unable to load captcha';
      }
    });
  }

  onLogin(): void {

    console.log('Form validity:', this.itemForm.valid);
    console.log('Form value:', this.itemForm.value);

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched(); // ✅ SHOW ERRORS
      return;
    }

    this.httpService.Login(this.itemForm.value).subscribe(
      (res: any) => {

        this.authService.saveToken(res.token);
        this.authService.SetRole(res.role);
        this.authService.saveUserId(res.userId.toString());

        this.router.navigate(['/dashboard']);
        setTimeout(() => window.location.reload(), 300);
      },
      error => {
        this.showError = true;
        this.errorMessage = 'Invalid username, password, or captcha';
        this.loadCaptcha();
      }
    );
  }
  registration(): void {
    this.router.navigate(['/registration']);
  }
}