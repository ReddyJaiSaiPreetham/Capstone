import { Component, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  private isBrowser: boolean;

  constructor(
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  toggleMobileMenu(): void {
    if (!this.isBrowser) return;
    const host: HTMLElement = this.elRef.nativeElement;
    const nav = host.querySelector('.top-nav');
    if (nav) nav.classList.toggle('nav-open');
  }

  scrollTo(sectionId: string): void {
    if (!this.isBrowser) return;
    const host: HTMLElement = this.elRef.nativeElement;
    const element = host.querySelector(`#${sectionId}`) as HTMLElement | null;
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    const nav = host.querySelector('.top-nav');
    if (nav) nav.classList.remove('nav-open');
  }

}