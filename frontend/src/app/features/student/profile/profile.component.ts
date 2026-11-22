import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, IconComponent],
  template: `
    <app-navbar />

    <main class="profile-page">
      <div class="container">
        <div class="profile-card card">
          <div class="avatar-banner">
            <div class="avatar-circle">
              {{ getInitials() }}
            </div>
          </div>

          <div class="profile-info text-center" *ngIf="user(); else notLoggedIn">
            <h2>{{ user()?.fullName || user()?.username }}</h2>
            <div class="role-badge-wrap">
              <span class="badge" [ngClass]="user()?.role === 'ADMIN' ? 'badge-rose' : 'badge-cerulean'">
                <app-icon [name]="user()?.role === 'ADMIN' ? 'shield' : 'user'" [size]="12" />
                {{ user()?.role }} ACCOUNT
              </span>
            </div>

            <div class="details-list">
              <div class="detail-row">
                <span class="d-label">Username</span>
                <span class="d-val">{{ user()?.username }}</span>
              </div>
              <div class="detail-row">
                <span class="d-label">Email Address</span>
                <span class="d-val">{{ user()?.email }}</span>
              </div>
              <div class="detail-row">
                <span class="d-label">User ID Identifier</span>
                <span class="d-val text-cerulean">#{{ user()?.userId }}</span>
              </div>
              <div class="detail-row">
                <span class="d-label">Security Tier</span>
                <span class="d-val text-success">Stateless JWT + BCrypt</span>
              </div>
            </div>

            <div class="action-buttons">
              <a [routerLink]="user()?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'" class="btn btn-outline btn-sm">
                <app-icon name="activity" [size]="14" />
                To Dashboard
              </a>
              <button class="btn btn-rose btn-sm" (click)="logout()">
                <app-icon name="log-out" [size]="14" />
                Sign Out
              </button>
            </div>
          </div>

          <ng-template #notLoggedIn>
            <div class="text-center py-4">
              <p>User profile session is not active.</p>
              <a routerLink="/login" class="btn btn-primary btn-sm">Sign In</a>
            </div>
          </ng-template>
        </div>
      </div>
    </main>

    <app-footer />
  `,
  styles: [`
    .profile-page {
      min-height: calc(100vh - 140px);
      padding: 48px 0 72px 0;
      background: #0A0A0A;
      display: flex;
      align-items: center;
    }
    .profile-card {
      max-width: 520px;
      margin: 0 auto;
      padding: 44px;
      border-radius: 20px;
    }
    .avatar-banner {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }
    .avatar-circle {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007BA7, #FF2D95);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      font-weight: 800;
      color: white;
      box-shadow: 0 0 30px rgba(0, 123, 167, 0.4);
    }
    .profile-info h2 {
      font-size: 1.65rem;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .role-badge-wrap { margin-bottom: 24px; }
    .details-list {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 28px;
      text-align: left;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.9rem;
    }
    .detail-row:last-child { border-bottom: none; }
    .d-label { color: rgba(255, 255, 255, 0.5); }
    .d-val { font-weight: 600; color: white; }
    .text-cerulean { color: #0099CC; font-family: 'Space Grotesk', monospace; }
    .text-success { color: #00E676; font-size: 0.85rem; }
    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .text-center { text-align: center; }
  `]
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.user;

  getInitials(): string {
    const name = this.user()?.fullName || this.user()?.username || 'U';
    return name.charAt(0).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}
