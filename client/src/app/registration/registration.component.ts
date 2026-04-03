import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html'
})
export class RegistrationComponent implements OnInit {

  itemForm!: FormGroup;

  showMessage: boolean = false;
  responseMessage: string = '';
  isError: boolean = false;

  constructor(
    public router: Router,
    private bookService: HttpService,
    private formBuilder: FormBuilder
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
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
        ]
      ],
      role: ['', Validators.required],

      // Doctor-only fields (validators set dynamically)
      specialty: [''],
      availability: ['']
    });

    this.onRoleChange();
  }

  onRoleChange(): void {
    this.itemForm.get('role')?.valueChanges.subscribe(role => {

      const specialtyControl = this.itemForm.get('specialty');
      const availabilityControl = this.itemForm.get('availability');

      if (role === 'DOCTOR') {
        specialtyControl?.setValidators([Validators.required]);
        availabilityControl?.setValidators([Validators.required]);
      } else {
        specialtyControl?.clearValidators();
        availabilityControl?.clearValidators();

        // clear values if not doctor
        specialtyControl?.setValue('');
        availabilityControl?.setValue('');
      }

      specialtyControl?.updateValueAndValidity();
      availabilityControl?.updateValueAndValidity();
    });
  }

  private showSuccess(msg: string): void {
    this.showMessage = true;
    this.isError = false;
    this.responseMessage = msg;
  }

  private showErrorMessage(err: any): void {
    this.showMessage = true;
    this.isError = true;

    // backend may return string like "Username already exists"
    const backendMsg = err?.error;

    if (err?.status === 400 && typeof backendMsg === 'string') {
      this.responseMessage = backendMsg;

      // ✅ field-level error for username
      if (backendMsg.toLowerCase().includes('username')) {
        this.itemForm.get('username')?.setErrors({ usernameExists: true });
      }
      return;
    }

    this.responseMessage = 'Registration failed. Please try again.';
  }

  onRegister(): void {

    // clear old message & field error before attempt
    this.showMessage = false;
    this.responseMessage = '';
    this.isError = false;

    // remove usernameExists error if present
    const usernameControl = this.itemForm.get('username');
    if (usernameControl?.errors?.['usernameExists']) {
      const errs = { ...usernameControl.errors };
      delete errs['usernameExists'];
      usernameControl.setErrors(Object.keys(errs).length ? errs : null);
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const data = { ...this.itemForm.value };

    // ✅ remove doctor-only fields if role is not DOCTOR
    if (data.role !== 'DOCTOR') {
      delete data.specialty;
      delete data.availability;
    }

    if (data.role === 'PATIENT') {
      this.bookService.registerPatient(data).subscribe({
        next: () => {
          this.showSuccess('Patient registered successfully ✅');
          this.itemForm.reset();
        },
        error: (err) => this.showErrorMessage(err)
      });
    }

    if (data.role === 'DOCTOR') {
      this.bookService.registerDoctors(data).subscribe({
        next: () => {
          this.showSuccess('Doctor registered successfully ✅');
          this.itemForm.reset();
        },
        error: (err) => this.showErrorMessage(err)
      });
    }

    if (data.role === 'RECEPTIONIST') {
      this.bookService.registerReceptionist(data).subscribe({
        next: () => {
          this.showSuccess('Receptionist registered successfully ✅');
          this.itemForm.reset();
        },
        error: (err) => this.showErrorMessage(err)
      });
    }
  }
}
