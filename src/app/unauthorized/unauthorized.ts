import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}
