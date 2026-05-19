import {
  Component, signal, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, HostListener
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  // Counter values
  counters = signal<number[]>([0, 0, 0, 0]);
  counterTargets = [40000, 12, 98, 3];
  counterLabels = ['صفقة محللة', 'منطقة في مصر', 'دقة التحليل', 'متوسط وقت الإجابة'];
  counterPrefixes = ['+', '', '', ''];
  counterSuffixes = ['', '', '%', ' ثواني'];

  // Section visibility
  section2Visible = signal(false);
  section3Visible = signal(false);
  section4Visible = signal(false);
  section5Visible = signal(false);
  section6Visible = signal(false);

  // Problem statements reveal
  problemLine1 = signal(false);
  problemLine2 = signal(false);
  problemLine3 = signal(false);

  // Parallax for background
  parallaxX = signal(0);
  parallaxY = signal(0);

  // Hot zones for the hero grid background
  hotZones = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
  }));

  floatingLabels = [
    { text: 'التجمع', x: 15, y: 20, delay: 0 },
    { text: 'زايد', x: 75, y: 30, delay: 3 },
    { text: 'العاصمة', x: 40, y: 75, delay: 5 },
    { text: 'المعادي', x: 85, y: 65, delay: 7 },
  ];

  private countersStarted = false;
  private counterInterval: ReturnType<typeof setInterval> | null = null;
  private observer: IntersectionObserver | null = null;

  @ViewChild('landingScroll') landingScroll!: ElementRef<HTMLElement>;

  constructor(private router: Router) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    if (this.counterInterval) clearInterval(this.counterInterval);
    if (this.observer) this.observer.disconnect();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const x = (e.clientX / window.innerWidth - 0.5) * 8;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    this.parallaxX.set(x);
    this.parallaxY.set(y);
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('data-section');
        if (entry.isIntersecting) {
          switch (id) {
            case '2':
              this.section2Visible.set(true);
              this.revealProblemLines();
              break;
            case '3':
              this.section3Visible.set(true);
              break;
            case '4':
              this.section4Visible.set(true);
              this.startCounters();
              break;
            case '5':
              this.section5Visible.set(true);
              break;
            case '6':
              this.section6Visible.set(true);
              break;
          }
        }
      });
    }, { threshold: 0.3, root: this.landingScroll?.nativeElement || null });

    setTimeout(() => {
      const sections = this.landingScroll.nativeElement.querySelectorAll('[data-section]');
      sections.forEach(s => this.observer!.observe(s));
    }, 100);
  }

  private revealProblemLines() {
    setTimeout(() => this.problemLine1.set(true), 200);
    setTimeout(() => this.problemLine2.set(true), 1200);
    setTimeout(() => this.problemLine3.set(true), 2200);
  }

  private startCounters() {
    if (this.countersStarted) return;
    this.countersStarted = true;

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    this.counterInterval = setInterval(() => {
      step++;
      const progress = this.easeOutCubic(step / steps);
      this.counters.set(
        this.counterTargets.map(target => Math.round(target * progress))
      );
      if (step >= steps) {
        if (this.counterInterval) clearInterval(this.counterInterval);
        this.counters.set([...this.counterTargets]);
      }
    }, interval);
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  navigateToChat() {
    this.router.navigate(['/chat']);
  }

  formatCounter(index: number): string {
    const val = this.counters()[index];
    const prefix = this.counterPrefixes[index];
    const suffix = this.counterSuffixes[index];
    if (index === 0) {
      return prefix + val.toLocaleString('en-US');
    }
    return prefix + val + suffix;
  }
}
