import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  words       = ['Smart Appointments', 'Doctor Bookings', 'Patient Care', 'Health Records'];
  wordIndex   = 0;
  currentWord = this.words[0];

  slides = [
    { icon: ':stethoscope:', label: 'Book a Doctor Instantly'   },
    { icon: ':clipboard:', label: 'Manage Patient Records'     },
    { icon: ':hospital:', label: 'Trusted Healthcare Network' }
  ];
  activeSlide = 0;

  private wordTimer!:  ReturnType<typeof setInterval>;
  private slideTimer!: ReturnType<typeof setInterval>;
  private observer!:   IntersectionObserver;

  ngOnInit(): void {
    this.wordTimer = setInterval(() => {
      this.wordIndex   = (this.wordIndex + 1) % this.words.length;
      this.currentWord = this.words[this.wordIndex];
    }, 2500);

    this.slideTimer = setInterval(() => {
      this.activeSlide = (this.activeSlide + 1) % this.slides.length;
    }, 3000);
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => this.observer.observe(el));
  }

  ngOnDestroy(): void {
    clearInterval(this.wordTimer);
    clearInterval(this.slideTimer);
    this.observer?.disconnect();
  }
}