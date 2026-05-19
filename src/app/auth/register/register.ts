import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent implements OnInit {
  name = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  error = signal('');
  loading = signal(false);
  pageLoaded = signal(false);

  hotZones = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    delay: Math.random() * 8,
    duration: 4 + Math.random() * 4,
  }));

  floatingLabels = [
    { text: 'JOIN', x: 20, y: 25, delay: 0 },
    { text: 'INTEL', x: 70, y: 30, delay: 2 },
    { text: 'AGENT', x: 45, y: 75, delay: 4 },
    { text: 'NEW', x: 85, y: 60, delay: 6 },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    setTimeout(() => this.pageLoaded.set(true), 80);
  }

  onSubmit() {
    this.error.set('');
    const name = this.name().trim();
    const email = this.email().trim();
    const password = this.password();
    const confirmPassword = this.confirmPassword();

    if (!name || !email || !password) {
      this.error.set('يرجى ملء جميع الحقول');
      return;
    }

    if (password !== confirmPassword) {
      this.error.set('كلمة المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      this.error.set('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    this.loading.set(true);
    this.auth.register(name, email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'خطأ في التسجيل');
      },
    });
  }
}
