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
  formModel: any = {
    role: null,
    email: '',
    password: '',
    username: ''
  };
  showMessage: boolean = false;
  responseMessage: any;

  constructor(
    public router: Router,
    private bookService: HttpService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {

    this.itemForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
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
      }

      specialtyControl?.updateValueAndValidity();
      availabilityControl?.updateValueAndValidity();
    });
  }

  onRegister(): void {

    if (this.itemForm.invalid) {
      return;
    }

    const data = this.itemForm.value;

    if (data.role === 'PATIENT') {
      this.bookService.registerPatient(data).subscribe(() => {
        this.showMessage = true;
        this.responseMessage = 'Patient registered successfully';
        this.itemForm.reset();
      });
    }

    if (data.role === 'DOCTOR') {
      this.bookService.registerDoctors(data).subscribe(() => {
        this.showMessage = true;
        this.responseMessage = 'Doctor registered successfully';
        this.itemForm.reset();
      });
    }

    if (data.role === 'RECEPTIONIST') {
      this.bookService.registerReceptionist(data).subscribe(() => {
        this.showMessage = true;
        this.responseMessage = 'Receptionist registered successfully';
        this.itemForm.reset();
      });
    }
  }
}
