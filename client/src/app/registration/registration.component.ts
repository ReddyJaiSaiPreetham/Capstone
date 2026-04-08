import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit, OnDestroy {

  itemForm!: FormGroup;

  showMessage: boolean = false;
  responseMessage: string = '';
  isError: boolean = false;

  popupTitle: string = '';

  otpSent: boolean = false;
  otpRequested: boolean = false;
  sendingOtp: boolean = false;

  otpCountdown: number = 0;
  otpCooldown: number = 0;

  private otpTimer: any;
  private cooldownTimer: any;

  showPassword: boolean = false;
  showTermsModal: boolean = false;

  private subs: Subscription[] = [];

  constructor(
    public router: Router,
    private bookService: HttpService,
    private formBuilder: FormBuilder
  ) {}

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
      otp: [{ value: '', disabled: true }],
      terms: [false, Validators.requiredTrue],
      specialty: [''],
      availability: ['']
    });

    this.onRoleChange();
    this.onEmailChangeResetOtp();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.otpTimer) clearInterval(this.otpTimer);
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
  }

  onRoleChange(): void {
    const sub = this.itemForm.get('role')?.valueChanges.subscribe(role => {
      const specialtyControl = this.itemForm.get('specialty');
      const availabilityControl = this.itemForm.get('availability');

      if (role === 'DOCTOR') {
        specialtyControl?.setValidators([Validators.required]);
        availabilityControl?.setValidators([Validators.required]);
      } else {
        specialtyControl?.clearValidators();
        availabilityControl?.clearValidators();
        specialtyControl?.setValue('');
        availabilityControl?.setValue('');
      }

      specialtyControl?.updateValueAndValidity();
      availabilityControl?.updateValueAndValidity();
    });

    if (sub) this.subs.push(sub);
  }

  private onEmailChangeResetOtp(): void {
    const emailCtrl = this.itemForm.get('email');
    if (!emailCtrl) return;
    const sub = emailCtrl.valueChanges.subscribe(() => {
      this.resetOtpState();
    });
    this.subs.push(sub);
  }

  //  Send OTP
  sendOtp(): void {
    this.showMessage = false;
    this.responseMessage = '';
    this.isError = false;

    const emailCtrl = this.itemForm.get('email');

    if (!emailCtrl || emailCtrl.invalid) {
      emailCtrl?.markAsTouched();
      this.showErrorMessage({ error: 'Please enter a valid email before sending OTP.' });
      return;
    }

    if (this.otpCooldown > 0) {
      this.showErrorMessage({ error: `Please wait ${this.otpCooldown}s to resend OTP.` });
      return;
    }

    this.sendingOtp = true;
    this.otpRequested = true;

    const email = emailCtrl.value;

    this.bookService.sendEmailOtp(email).subscribe({
      next: (res: any) => {
        this.sendingOtp = false;
        this.otpSent = true;

        const otpCtrl = this.itemForm.get('otp');
        otpCtrl?.enable();
        otpCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{6}$')]);
        otpCtrl?.updateValueAndValidity();

        // OTP success — correct title "OTP Sent!"
        this.showSuccess('OTP Sent!', res?.message || 'OTP sent to your email. Check your inbox or spam.');

        this.startOtpCountdown(300);
        this.startOtpCooldown(30);
      },
      error: (err) => {
        this.sendingOtp = false;
        this.otpSent = false;
        this.showErrorMessage(err);
      }
    });
  }

  private startOtpCountdown(seconds: number): void {
    this.otpCountdown = seconds;
    if (this.otpTimer) clearInterval(this.otpTimer);
    this.otpTimer = setInterval(() => {
      this.otpCountdown--;
      if (this.otpCountdown <= 0) {
        clearInterval(this.otpTimer);
        this.otpTimer = null;
        this.otpSent = false;
        const otpCtrl = this.itemForm.get('otp');
        otpCtrl?.reset();
        otpCtrl?.disable();
      }
    }, 1000);
  }

  private startOtpCooldown(seconds: number): void {
    this.otpCooldown = seconds;
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      this.otpCooldown--;
      if (this.otpCooldown <= 0) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      }
    }, 1000);
  }

  // UPDATED: takes title as first param
  private showSuccess(title: string, msg: string): void {
    this.showMessage = true;
    this.isError = false;
    this.popupTitle = title;
    this.responseMessage = msg;
  }

  private showErrorMessage(err: any): void {
    this.showMessage = true;
    this.isError = true;
    this.popupTitle = 'Something Went Wrong';

    const backendMsg = err?.error;

    if (typeof backendMsg === 'string') {
      this.responseMessage = backendMsg;
      if (backendMsg.toLowerCase().includes('username')) {
        this.itemForm.get('username')?.setErrors({ usernameExists: true });
      }
      return;
    }

    this.responseMessage = 'Operation failed. Please try again.';
  }

  onRegister(): void {
    this.showMessage = false;
    this.responseMessage = '';
    this.isError = false;

    const usernameControl = this.itemForm.get('username');
    if (usernameControl?.errors?.['usernameExists']) {
      const errs = { ...usernameControl.errors };
      delete errs['usernameExists'];
      usernameControl.setErrors(Object.keys(errs).length ? errs : null);
    }

    if (!this.otpSent) {
      this.showErrorMessage({ error: 'Please send OTP first and then register.' });
      return;
    }

    const otpCtrl = this.itemForm.get('otp');
    if (!otpCtrl || otpCtrl.invalid) {
      otpCtrl?.markAsTouched();
      this.showErrorMessage({ error: 'Please enter a valid 6-digit OTP.' });
      return;
    }

    const termsCtrl = this.itemForm.get('terms');
    if (!termsCtrl || termsCtrl.invalid) {
      termsCtrl?.markAsTouched();
      this.showErrorMessage({ error: 'Please accept Terms & Conditions.' });
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const data = { ...this.itemForm.getRawValue() };
    const otp = data.otp;
    delete data.otp;
    delete data.terms;

    if (data.role !== 'DOCTOR') {
      delete data.specialty;
      delete data.availability;
    }

    if (data.role === 'PATIENT') {
      this.bookService.registerPatient(data, otp).subscribe({
        next: () => {
          this.showSuccess('Account Created!', 'Patient registered successfully. You can now sign in.');
          this.itemForm.reset();
          this.resetOtpState();
        },
        error: (err) => this.showErrorMessage(err)
      });
    }

    if (data.role === 'DOCTOR') {
      this.bookService.registerDoctors(data, otp).subscribe({
        next: () => {
          this.showSuccess('Account Created!', 'Doctor registered successfully. You can now sign in.');
          this.itemForm.reset();
          this.resetOtpState();
        },
        error: (err) => this.showErrorMessage(err)
      });
    }

    if (data.role === 'RECEPTIONIST') {
      this.bookService.registerReceptionist(data, otp).subscribe({
        next: () => {
          this.showSuccess('Account Created!', 'Receptionist registered successfully. You can now sign in.');
          this.itemForm.reset();
          this.resetOtpState();
        },
        error: (err) => this.showErrorMessage(err)
      });
    }
  }

  openTerms(): void { this.showTermsModal = true; }
  openPrivacy(): void { this.showTermsModal = true; }
  closeTerms(): void { this.showTermsModal = false; }

  private resetOtpState(): void {
    this.otpSent = false;
    this.otpRequested = false;
    this.otpCountdown = 0;
    this.otpCooldown = 0;

    if (this.otpTimer) { clearInterval(this.otpTimer); this.otpTimer = null; }
    if (this.cooldownTimer) { clearInterval(this.cooldownTimer); this.cooldownTimer = null; }

    const otpCtrl = this.itemForm.get('otp');
    otpCtrl?.reset();
    otpCtrl?.clearValidators();
    otpCtrl?.disable();
    otpCtrl?.updateValueAndValidity();
  }
}