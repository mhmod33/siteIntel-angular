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
  // Hero headline word-by-word reveal
  heroLine1Words = ['القرار', 'الغلط', 'بيكلّف.'];
  heroLine2Words = ['القرار', 'الصح', 'بيكسب.'];
  visibleWords1 = signal<boolean[]>([false, false, false]);
  visibleWords2 = signal<boolean[]>([false, false, false]);
  isLine1Active = signal(true);
  isLine2Active = signal(false);

  // Counter values
  counters = signal<number[]>([0, 0, 0, 0]);
  counterTargets = [40000, 61, 98, 3];
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

  // Property pin positions
  pin1X = signal(20);
  pin1Y = signal(35);
  pin2X = signal(75);
  pin2Y = signal(25);
  pin3X = signal(45);
  pin3Y = signal(60);
  pin4X = signal(85);
  pin4Y = signal(55);
  pin5X = signal(15);
  pin5Y = signal(70);

  // Data line paths
  dataLine1Path = signal('');
  dataLine2Path = signal('');
  dataLine3Path = signal('');

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

  showScrollTop = signal(false);

  private countersStarted = false;
  private counterInterval: ReturnType<typeof setInterval> | null = null;
  private observer: IntersectionObserver | null = null;

  @ViewChild('landingScroll') landingScroll!: ElementRef<HTMLElement>;

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize data line paths connecting pins
    this.dataLine1Path.set(`M ${this.pin1X()} ${this.pin1Y()} Q 30 45 ${this.pin3X()} ${this.pin3Y()}`);
    this.dataLine2Path.set(`M ${this.pin2X()} ${this.pin2Y()} Q 60 40 ${this.pin4X()} ${this.pin4Y()}`);
    this.dataLine3Path.set(`M ${this.pin3X()} ${this.pin3Y()} Q 40 80 ${this.pin5X()} ${this.pin5Y()}`);

    // Hero headline word-by-word reveal
    this.startHeroWordReveal();
  }

  private startHeroWordReveal() {
    const stepMs = 500; // delay between each word
    const line1Start = 400; // when line 1 starts (ms after load)

    this.visibleWords1.set([false, false, false]);
    this.visibleWords2.set([false, false, false]);
    this.isLine1Active.set(true);
    this.isLine2Active.set(false);

    // Reveal Line 1 word-by-word
    this.heroLine1Words.forEach((_, i) => {
      setTimeout(() => {
        this.visibleWords1.update(arr => {
          const next = [...arr];
          next[i] = true;
          return next;
        });

        // Once Line 1 is fully revealed, transition cursor to Line 2 after a gap
        if (i === this.heroLine1Words.length - 1) {
          setTimeout(() => {
            this.isLine1Active.set(false);
            this.isLine2Active.set(true);

            // Reveal Line 2 word-by-word
            this.heroLine2Words.forEach((_, j) => {
              setTimeout(() => {
                this.visibleWords2.update(arr2 => {
                  const next2 = [...arr2];
                  next2[j] = true;
                  return next2;
                });

                // Once Line 2 is fully revealed, deactivate its blinking cursor after a brief delay
                if (j === this.heroLine2Words.length - 1) {
                  setTimeout(() => {
                    this.isLine2Active.set(false);
                  }, 1200);
                }
              }, j * stepMs);
            });
          }, stepMs);
        }
      }, line1Start + i * stepMs);
    });
  }

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

  onScroll(e: Event) {
    const el = e.target as HTMLElement;
    this.showScrollTop.set(el.scrollTop > 400);
  }

  scrollToTop() {
    this.landingScroll.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
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

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
