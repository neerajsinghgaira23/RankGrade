import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, ApiResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/api/auth';

  // Signals for reactive auth state
  private _user = signal<AuthResponse | null>(this.loadUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isStudent = computed(() => this._user()?.role === 'STUDENT');

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { username: string; email: string; password: string; fullName?: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API}/register`, data).pipe(
      tap(res => this.storeSession(res.data))
    );
  }

  login(data: { usernameOrEmail: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API}/login`, data).pipe(
      tap(res => this.storeSession(res.data))
    );
  }

  logout(): void {
    localStorage.removeItem('rg_token');
    localStorage.removeItem('rg_user');
    this._user.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('rg_token');
  }

  private storeSession(auth: AuthResponse): void {
    localStorage.setItem('rg_token', auth.token);
    localStorage.setItem('rg_user', JSON.stringify(auth));
    this._user.set(auth);
  }

  private loadUser(): AuthResponse | null {
    const stored = localStorage.getItem('rg_user');
    return stored ? JSON.parse(stored) : null;
  }
}
