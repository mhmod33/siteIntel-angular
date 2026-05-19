import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'admin' | 'user';
  user_status: 'active' | 'inactive' | 'banned';
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;
  currentUser = signal<User | null>(null);
  isLoggedIn = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.isLoggedIn.set(true);
      this.fetchUser().subscribe();
    }
  }

  get token(): string | null {
    return localStorage.getItem('auth_token');
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, { name, email, password }).pipe(
      tap(res => this.handleAuth(res)),
      catchError(err => throwError(() => err))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => this.handleAuth(res)),
      catchError(err => throwError(() => err))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API}/logout`, {}).pipe(
      tap(() => this.clearAuth()),
      catchError(err => {
        this.clearAuth();
        return throwError(() => err);
      })
    );
  }

  fetchUser(): Observable<User> {
    return this.http.get<User>(`${this.API}/user`).pipe(
      tap(user => this.currentUser.set(user)),
      catchError(err => {
        this.clearAuth();
        return throwError(() => err);
      })
    );
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem('auth_token', res.token);
    this.currentUser.set(res.user);
    this.isLoggedIn.set(true);
  }

  private clearAuth() {
    localStorage.removeItem('auth_token');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}
