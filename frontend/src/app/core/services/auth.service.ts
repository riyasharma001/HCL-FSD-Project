import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'ordercraft_token';
  private readonly USER_KEY = 'ordercraft_user';
  private readonly ROLE_KEY = 'ordercraft_role';
  private readonly NAME_KEY = 'ordercraft_name';

  readonly token = signal<string | null>(this.getStored(this.TOKEN_KEY));
  readonly currentUser = signal<string | null>(this.getStored(this.USER_KEY));
  readonly role = signal<string | null>(this.getStored(this.ROLE_KEY));
  readonly fullName = signal<string | null>(this.getStored(this.NAME_KEY));

  readonly isAuthenticated = computed(() => !!this.token());

  private getStored(key: string): string | null {
    return localStorage.getItem(key);
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/login', credentials).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          this.token.set(res.token);
        }
        const username = res.username || credentials.username;
        const role = res.role || 'USER';
        const fullName = res.fullName || username;

        localStorage.setItem(this.USER_KEY, username);
        localStorage.setItem(this.ROLE_KEY, role);
        localStorage.setItem(this.NAME_KEY, fullName);

        this.currentUser.set(username);
        this.role.set(role);
        this.fullName.set(fullName);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.NAME_KEY);

    this.token.set(null);
    this.currentUser.set(null);
    this.role.set(null);
    this.fullName.set(null);

    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.role() === 'ADMIN';
  }
}
