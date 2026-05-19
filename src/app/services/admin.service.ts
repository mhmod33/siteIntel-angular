import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './auth.service';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  user_type: 'admin' | 'user';
  user_status: 'active' | 'inactive' | 'banned';
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  user_type?: 'admin' | 'user';
  user_status?: 'active' | 'inactive' | 'banned';
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API}/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.API}/users/${id}`);
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(`${this.API}/users`, payload);
  }

  updateUser(id: number, payload: UpdateUserPayload): Observable<User> {
    return this.http.put<User>(`${this.API}/users/${id}`, payload);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API}/users/${id}`);
  }
}
