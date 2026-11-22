import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="admin-shell" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Mobile Backdrop -->
      @if (mobileOpen()) {
        <div class="mobile-backdrop" (click)="mobileOpen.set(false)"></div>
      }

      <!-- Admin Sidebar -->
      <aside class="admin-sidebar" [class.mobile-open]="mobileOpen()">
        <div class="sidebar-top">
          <a routerLink="/" class="sidebar-brand">
            <div class="brand-glyph">
              <img src="assets/images/rankgrade-icon.png" alt="RankGrade Logo" class="admin-sidebar-logo" />
            </div>
            <div class="brand-text">
              <span class="brand-name">Rank<span class="highlight">Grade</span></span>
              <span class="brand-badge">ADMIN CONSOLE</span>
            </div>
          </a>

          <button class="collapse-toggle desktop-only" (click)="toggleSidebar()" title="Toggle Sidebar">
            <app-icon [name]="sidebarCollapsed() ? 'chevron-right' : 'chevron-left'" [size]="14" />
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">CORE OPERATIONS</div>

          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item" (click)="mobileOpen.set(false)">
            <span class="nav-icon"><app-icon name="activity" [size]="18" /></span>
            <span class="nav-label">Overview</span>
          </a>

          <a routerLink="/admin/quizzes" routerLinkActive="active" class="nav-item" (click)="mobileOpen.set(false)">
            <span class="nav-icon"><app-icon name="book-open" [size]="18" /></span>
            <span class="nav-label">Quiz Management</span>
          </a>

          <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item" (click)="mobileOpen.set(false)">
            <span class="nav-icon"><app-icon name="layers" [size]="18" /></span>
            <span class="nav-label">Categories</span>
          </a>

          <a routerLink="/admin/students" routerLinkActive="active" class="nav-item" (click)="mobileOpen.set(false)">
            <span class="nav-icon"><app-icon name="users" [size]="18" /></span>
            <span class="nav-label">Student Registry</span>
          </a>

          <div class="nav-section-title">EXAMINATION TELEMETRY</div>

          <a routerLink="/admin/attempts" routerLinkActive="active" class="nav-item" (click)="mobileOpen.set(false)">
            <span class="nav-icon"><app-icon name="file-text" [size]="18" /></span>
            <span class="nav-label">Attempts &amp; Results</span>
          </a>

          <a routerLink="/admin/analytics" routerLinkActive="active" class="nav-item" (click)="mobileOpen.set(false)">
            <span class="nav-icon"><app-icon name="pie-chart" [size]="18" /></span>
            <span class="nav-label">Analytics &amp; Reports</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/student/dashboard" class="switch-link" title="Preview Student Experience">
            <app-icon name="arrow-right" [size]="14" color="#0099CC" />
            <span class="nav-label">Student Portal View</span>
          </a>

          <div class="admin-profile-card">
            <div class="admin-avatar">
              {{ getInitials() }}
            </div>
            <div class="admin-info">
              <span class="admin-name">{{ currentUserName() }}</span>
              <span class="admin-role">ROOT ADMIN</span>
            </div>
            <button class="logout-btn" (click)="logout()" title="Sign Out">
              <app-icon name="log-out" [size]="16" color="rgba(255,255,255,0.6)" />
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Canvas -->
      <div class="admin-main">
        <!-- Top App Bar -->
        <header class="admin-topbar">
          <div class="topbar-left">
            <button class="mobile-menu-btn mobile-only" (click)="mobileOpen.set(true)">
              <app-icon name="menu" [size]="20" />
            </button>
            <div class="breadcrumbs">
              <span class="crumb-root">RankGrade Console</span>
              <span class="crumb-separator">/</span>
              <span class="crumb-current">{{ pageTitle }}</span>
            </div>
          </div>

          <div class="topbar-right">
            <div class="system-status-indicator">
              <span class="pulse-indicator"></span>
              <span class="status-txt">System Nominal</span>
            </div>
            <ng-content select="[header-actions]"></ng-content>
          </div>
        </header>

        <!-- Page Canvas Content -->
        <div class="admin-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      min-height: 100vh;
      background: #0A0A0A;
      color: #EDEDED;
      font-family: 'Inter', -apple-system, sans-serif;
    }

    /* ─── Sidebar ────────────────────────────────────────── */
    .admin-sidebar {
      width: 260px;
      background: #111111;
      border-right: 1px solid rgba(255, 255, 255, 0.07);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 100;
    }

    .sidebar-collapsed .admin-sidebar {
      width: 76px;
    }
    .sidebar-collapsed .brand-text,
    .sidebar-collapsed .nav-label,
    .sidebar-collapsed .nav-section-title,
    .sidebar-collapsed .switch-link span,
    .sidebar-collapsed .admin-info {
      display: none;
    }
    .sidebar-collapsed .admin-profile-card {
      justify-content: center;
      padding: 10px 0;
    }

    .sidebar-top {
      padding: 22px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: white;
    }

    .brand-glyph {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 16px rgba(0, 123, 167, 0.25);
      transition: all 0.3s ease;
    }
    .sidebar-brand:hover .brand-glyph {
      border-color: rgba(255, 45, 149, 0.4);
      transform: scale(1.05);
      box-shadow: 0 4px 20px rgba(255, 45, 149, 0.35);
    }
    .admin-sidebar-logo {
      width: 28px;
      height: 28px;
      object-fit: contain;
      filter: drop-shadow(0 2px 6px rgba(0, 123, 167, 0.4));
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .highlight { color: #FF2D95; }

    .brand-badge {
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #0099CC;
      text-transform: uppercase;
    }

    .collapse-toggle {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition: all 0.15s;
    }
    .collapse-toggle:hover {
      background: rgba(255, 255, 255, 0.09);
      color: white;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 0.68rem;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 14px 10px 6px 10px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.65);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.15s ease;
      border: 1px solid transparent;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.04);
      color: white;
    }

    .nav-item.active {
      background: rgba(0, 123, 167, 0.14);
      border-color: rgba(0, 123, 167, 0.35);
      color: #38bdf8;
      font-weight: 600;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      flex-shrink: 0;
    }

    .sidebar-footer {
      padding: 16px 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .switch-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(0, 123, 167, 0.08);
      border: 1px solid rgba(0, 123, 167, 0.2);
      color: #38bdf8;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.15s;
    }
    .switch-link:hover {
      background: rgba(0, 123, 167, 0.16);
    }

    .admin-profile-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 4px;
    }

    .admin-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #007BA7, #FF2D95);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.82rem;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
    }

    .admin-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .admin-name {
      font-size: 0.86rem;
      font-weight: 700;
      color: white;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .admin-role {
      font-size: 0.65rem;
      font-weight: 800;
      color: #FF5AAE;
      letter-spacing: 0.05em;
    }

    .logout-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .logout-btn:hover {
      background: rgba(255, 23, 68, 0.15);
    }

    /* ─── Main Content Canvas ────────────────────────────── */
    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .admin-topbar {
      height: 70px;
      background: #111111;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(12px);
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
    }
    .crumb-root { color: rgba(255, 255, 255, 0.45); }
    .crumb-separator { color: rgba(255, 255, 255, 0.2); }
    .crumb-current { color: white; font-weight: 700; }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .system-status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 12px;
      border-radius: 50px;
      background: rgba(0, 230, 118, 0.08);
      border: 1px solid rgba(0, 230, 118, 0.25);
    }

    .pulse-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #00E676;
      box-shadow: 0 0 10px #00E676;
    }

    .status-txt {
      font-size: 0.76rem;
      font-weight: 700;
      color: #00E676;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .admin-body {
      flex: 1;
      padding: 32px;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
    }

    .mobile-only { display: none; }
    .desktop-only { display: flex; }

    @media (max-width: 992px) {
      .desktop-only { display: none; }
      .mobile-only { display: flex; }

      .admin-sidebar {
        position: fixed;
        left: -280px;
        top: 0;
        bottom: 0;
        width: 270px !important;
        transition: transform 0.25s ease;
      }
      .admin-sidebar.mobile-open {
        transform: translateX(280px);
      }
      .mobile-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        z-index: 90;
      }
      .admin-topbar { padding: 0 16px; }
      .admin-body { padding: 20px 16px; }
      .system-status-indicator { display: none; }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  @Input() pageTitle = 'Dashboard';

  sidebarCollapsed = signal<boolean>(false);
  mobileOpen = signal<boolean>(false);
  currentUserName = signal<string>('Administrator');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.currentUserName.set(user.fullName || user.username || 'Administrator');
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  getInitials(): string {
    const name = this.currentUserName();
    return name ? name.substring(0, 2).toUpperCase() : 'AD';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
