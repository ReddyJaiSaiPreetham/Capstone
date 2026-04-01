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
  responseMessage: string = '';
  isAdded: boolean = false;

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder
  ) {
    this.itemForm = this.formBuilder.group({
      doctorId: [''],
      availability: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      alert('Doctor not logged in');
      return;
    }

    const doctorId = parseInt(userId, 10);
    const availability = this.itemForm.value.availability;

    this.httpService
      .updateDoctorAvailability(doctorId, availability)
      .subscribe({
        next: () => {
          this.responseMessage = 'Doctor availability updated successfully ✅';
          this.isAdded = true;
          this.itemForm.reset();
        },
        error: () => {
          alert('Failed to update availability');
        }
      });
  }
}
``