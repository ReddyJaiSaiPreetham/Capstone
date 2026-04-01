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
export class LoginComponent implements OnInit{
  itemForm!: FormGroup;
  formModel: any = {};
  showError: boolean = false;
  errorMessage: any;

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.itemForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {

    if (this.itemForm.invalid) {
      return;
    }

    this.httpService.Login(this.itemForm.value).subscribe(
      (res: any) => {

        this.authService.saveToken(res.token);
        this.authService.SetRole(res.role);
        this.authService.saveUserId(res.userId.toString());
        this.router.navigate(['/dashboard']);
        setTimeout(() => {
          window.location.reload();
        }, 300);
      },
      error => {
        this.showError = true;
        this.errorMessage = 'Invalid username or password';
      }
    );
  }

  
  registration(): void {
    this.router.navigate(['/registration']);
  }
}

