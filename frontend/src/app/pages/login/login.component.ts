import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);

  username = 'admin';
  password = 'admin123';
  hidePassword = signal(true);
  loading = signal(false);
  private returnUrl = '/dashboard';

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  fillDemo(user: string, pass: string) {
    this.username = user;
    this.password = pass;
  }

  login() {
    if (!this.username.trim() || !this.password) {
      this.notify.error('Please enter username and password');
      return;
    }

    this.loading.set(true);
    this.auth.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notify.success(`Welcome back, ${res.fullName || res.username || 'User'}!`);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.notify.error(err.error?.error || 'Invalid username or password');
      }
    });
  }
}
