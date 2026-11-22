import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, IconComponent],
  template: `
    <nav class="navbar">
      <div class="nav-inner container">
        <a routerLink="/" class="nav-brand">
          <div class="brand-badge">
            <img src="assets/images/rankgrade-icon.png" alt="RankGrade Logo" class="brand-logo-img" />
          </div>
          <span class="brand-name">Rank<span class="brand-accent">Grade</span></span>
        </a>

        <div class="nav-links" [class.open]="menuOpen">
          @if (!auth.isLoggedIn()) {
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">
              Home
            </a>
            <a routerLink="/login" class="btn btn-outline btn-sm">
              <app-icon name="log-in" [size]="15" />
              Login
            </a>
            <a routerLink="/register" class="btn btn-primary btn-sm">
              <app-icon name="user" [size]="15" />
              Sign Up
            </a>
          }

          @if (auth.isStudent()) {
            <a routerLink="/student/dashboard" routerLinkActive="active" class="nav-link">
              <app-icon name="activity" [size]="16" />
              Dashboard
            </a>
            <a routerLink="/student/quizzes" routerLinkActive="active" class="nav-link">
              <app-icon name="book-open" [size]="16" />
              Quizzes
            </a>
            <a routerLink="/student/history" routerLinkActive="active" class="nav-link">
              <app-icon name="clock" [size]="16" />
              History
            </a>
            <a routerLink="/student/analytics" routerLinkActive="active" class="nav-link">
              <app-icon name="bar-chart" [size]="16" />
              Analytics
            </a>
            <div class="nav-user">
              <div class="user-avatar student">
                {{ userInitial() }}
              </div>
              <div class="user-meta">
                <span class="user-name">{{ auth.user()?.username }}</span>
                <span class="user-role">Student</span>
              </div>
              <button class="btn btn-ghost btn-sm" (click)="auth.logout()" title="Logout">
                <app-icon name="log-out" [size]="15" />
              </button>
            </div>
          }

          @if (auth.isAdmin()) {
            <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
              <app-icon name="activity" [size]="16" />
              Overview
            </a>
            <a routerLink="/admin/quizzes" routerLinkActive="active" class="nav-link">
              <app-icon name="book" [size]="16" />
              Quizzes
            </a>
            <a routerLink="/admin/students" routerLinkActive="active" class="nav-link">
              <app-icon name="users" [size]="16" />
              Students
            </a>
            <a routerLink="/admin/categories" routerLinkActive="active" class="nav-link">
              <app-icon name="layers" [size]="16" />
              Categories
            </a>
            <div class="nav-user">
              <div class="user-avatar admin">
                {{ userInitial() }}
              </div>
              <div class="user-meta">
                <span class="user-name">{{ auth.user()?.username }}</span>
                <span class="badge badge-rose badge-xs">Admin</span>
              </div>
              <button class="btn btn-ghost btn-sm" (click)="auth.logout()" title="Logout">
                <app-icon name="log-out" [size]="15" />
              </button>
            </div>
          }
        </div>

        <button class="menu-toggle show-mobile" (click)="menuOpen = !menuOpen" aria-label="Toggle Navigation">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10,10,10,0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.4rem;
      font-weight: 800;
      color: white;
    }
    .brand-badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 123, 167, 0.2);
      transition: all 0.3s ease;
    }
    .nav-brand:hover .brand-badge {
      border-color: rgba(0, 123, 167, 0.5);
      transform: scale(1.05);
      box-shadow: 0 4px 20px rgba(0, 123, 167, 0.35);
    }
    .brand-logo-img {
      width: 28px;
      height: 28px;
      object-fit: contain;
      filter: drop-shadow(0 2px 6px rgba(0, 123, 167, 0.4));
    }
    .brand-accent { color: #FF2D95; }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 500;
      padding: 8px 14px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .nav-link:hover, .nav-link.active {
      color: white;
      background: rgba(255,255,255,0.06);
    }
    .nav-link.active {
      color: #0099CC;
      background: rgba(0, 123, 167, 0.12);
      border: 1px solid rgba(0, 123, 167, 0.25);
    }
    .nav-user {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: 12px;
      padding-left: 14px;
      border-left: 1px solid rgba(255,255,255,0.1);
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007BA7, #0099CC);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.88rem;
      color: white;
      box-shadow: 0 0 12px rgba(0, 123, 167, 0.3);
    }
    .user-avatar.admin {
      background: linear-gradient(135deg, #CC0070, #FF2D95);
      box-shadow: 0 0 12px rgba(255, 45, 149, 0.3);
    }
    .user-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .user-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
      line-height: 1.1;
    }
    .user-role {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-xs {
      font-size: 0.65rem;
      padding: 2px 6px;
    }
    .menu-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }
    .menu-toggle span {
      display: block;
      width: 24px;
      height: 2px;
      background: rgba(255,255,255,0.8);
      border-radius: 2px;
      transition: all 0.3s;
    }
    @media (max-width: 768px) {
      .menu-toggle { display: flex; }
      .nav-links {
        display: none;
        position: absolute;
        top: 70px;
        left: 0;
        right: 0;
        background: rgba(17,17,17,0.98);
        border-bottom: 1px solid rgba(255,255,255,0.08);
        flex-direction: column;
        padding: 20px;
        gap: 12px;
      }
      .nav-links.open { display: flex; }
      .nav-user { flex-direction: column; border: none; margin: 0; padding: 0; }
    }
  `]
})
export class NavbarComponent {
  menuOpen = false;

  userInitial = computed(() => {
    const name = this.auth.user()?.fullName || this.auth.user()?.username || 'U';
    return name.charAt(0).toUpperCase();
  });

  constructor(public auth: AuthService) {}
}
