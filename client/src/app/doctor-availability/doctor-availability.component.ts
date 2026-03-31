import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-doctor-availability',
  templateUrl: './doctor-availability.component.html',
  styleUrls: ['./doctor-availability.component.scss']
})
export class DoctorAvailabilityComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = {};
  responseMessage: any;
  isAdded: boolean = false;

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder
  ) {
    // DO NOT change structure (test dependent)
    this.itemForm = this.formBuilder.group({
      doctorId: ['', Validators.required],
      availability: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // ✅ Fix: Set doctorId initially so form becomes valid
    const userId = localStorage.getItem('userId');

    if (userId) {
      const doctorId = parseInt(userId, 10);

      this.itemForm.patchValue({
        doctorId: doctorId
      });
    }
  }

  onSubmit(): void {
    const userId = localStorage.getItem('userId');

    if (userId) {
      const doctorId = parseInt(userId, 10);

      // Keep this (test safe)
      this.itemForm.controls['doctorId'].setValue(doctorId);

      this.httpService
        .updateDoctorAvailability(doctorId, this.itemForm.value.availability)
        .subscribe(() => {
          this.responseMessage = 'Doctor availability updated successfully';
          this.isAdded = true;

          // Reset only availability, keep doctorId
          this.itemForm.patchValue({
            availability: ''
          });
        });
    }
  }
}
