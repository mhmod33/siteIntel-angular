import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  pageLoaded = signal(false);

  hotZones = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    delay: Math.random() * 8,
    duration: 4 + Math.random() * 4,
  }));

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    setTimeout(() => this.pageLoaded.set(true), 80);
    this.user.set(this.auth.currentUser());
    if (!this.user()) {
      this.auth.fetchUser().subscribe({
        next: (u) => this.user.set(u),
        error: () => this.router.navigate(['/login']),
      });
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'banned': return 'محظور';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#4caf50';
      case 'inactive': return '#ff9800';
      case 'banned': return '#e04040';
      default: return '#888';
    }
  }

  getRoleLabel(type: string): string {
    return type === 'admin' ? 'مدير النظام' : 'مستخدم';
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
