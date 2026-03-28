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
  //todo: complete missing code...
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

  // LOGIN METHOD
  onLogin(): void {

    if (this.itemForm.invalid) {
      return;
    }

    this.httpService.Login(this.itemForm.value).subscribe(
      (res: any) => {

        // Save JWT Token
        this.authService.saveToken(res.token);

        // Save Role
        this.authService.SetRole(res.role);

        //  Save UserId
        this.authService.saveUserId(res.userId.toString());

        //  Navigate to Dashboard
        this.router.navigate(['/dashboard']);

        //  Reload to refresh navbar & role-based UI
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

  //  GO TO REGISTRATION PAGE
  registration(): void {
    this.router.navigate(['/registration']);
  }
}

