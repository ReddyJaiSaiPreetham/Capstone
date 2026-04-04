import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  words = ['Smart Appointments', 'Doctor Bookings', 'Patient Care', 'Health Records'];
  wordIndex = 0;
  currentWord = this.words[0];

  slides = [
    { icon: '🩺', label: 'Book a Doctor Instantly' },
    { icon: '📋', label: 'Manage Patient Records' },
    { icon: '🏥', label: 'Trusted Healthcare Network' }
  ];
  activeSlide = 0;

  private wordTimer: any;
  private slideTimer: any;
  private observer?: IntersectionObserver;

  private isBrowser: boolean;

  constructor(
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // ✅ Start timers only in browser
    if (!this.isBrowser) return;

    this.wordTimer = setInterval(() => {
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
      this.currentWord = this.words[this.wordIndex];
    }, 2500);

    this.slideTimer = setInterval(() => {
      this.activeSlide = (this.activeSlide + 1) % this.slides.length;
    }, 3000);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // ✅ Safely observe elements inside this component only
    const host: HTMLElement = this.elRef.nativeElement;
    const revealEls = host.querySelectorAll('.reveal');

    if (!revealEls || revealEls.length === 0) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('visible');
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el) => this.observer!.observe(el));
  }

  ngOnDestroy(): void {
    // ✅ Clear timers safely
    if (this.wordTimer) clearInterval(this.wordTimer);
    if (this.slideTimer) clearInterval(this.slideTimer);

    // ✅ Disconnect observer safely
    if (this.observer) this.observer.disconnect();
  }

  scrollTo(sectionId: string): void {
    if (!this.isBrowser) return;

    const host: HTMLElement = this.elRef.nativeElement;
    const element = host.querySelector(`#${sectionId}`) as HTMLElement | null;

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}