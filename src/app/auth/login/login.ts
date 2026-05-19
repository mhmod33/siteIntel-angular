import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  email = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);
  pageLoaded = signal(false);
  passwordVisible = signal(false);

  hotZones = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    delay: Math.random() * 8,
    duration: 4 + Math.random() * 4,
  }));

  floatingLabels = [
    { text: 'SECURE', x: 15, y: 20, delay: 0 },
    { text: 'INTEL', x: 75, y: 30, delay: 2 },
    { text: 'ACCESS', x: 50, y: 75, delay: 4 },
    { text: 'AUTH', x: 85, y: 65, delay: 6 },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    setTimeout(() => this.pageLoaded.set(true), 80);
  }

  togglePasswordVisibility() {
    this.passwordVisible.update(v => !v);
  }

  onSubmit() {
    this.error.set('');
    const email = this.email().trim();
    const password = this.password();

    if (!email || !password) {
      this.error.set('يرجى ملء جميع الحقول');
      return;
    }

    this.loading.set(true);
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'خطأ في تسجيل الدخول');
      },
    });
  }
}
