import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <footer class="app-footer">
      <div class="container footer-content">
        <div class="footer-brand">
          <div class="logo">
            <img src="assets/images/rankgrade-logo-dark.png" alt="RankGrade Logo" class="footer-logo-img" />
          </div>
          <p class="tagline">
            Next-Generation Online Quiz and Performance Telemetry Platform for Computer-Based Assessment.
          </p>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <span class="group-title">Navigation</span>
            <a routerLink="/">
              <app-icon name="chevron-right" [size]="14" />
              Home
            </a>
            <a routerLink="/student/quizzes">
              <app-icon name="chevron-right" [size]="14" />
              Quiz Catalog
            </a>
            <a routerLink="/student/dashboard">
              <app-icon name="chevron-right" [size]="14" />
              Student Portal
            </a>
          </div>

          <div class="link-group">
            <span class="group-title">Platform Engine</span>
            <span>
              <app-icon name="clock" [size]="14" color="#0099CC" />
              Synchronized Timers
            </span>
            <span>
              <app-icon name="bar-chart" [size]="14" color="#FF2D95" />
              Longitudinal Analytics
            </span>
            <span>
              <app-icon name="target" [size]="14" color="#00E676" />
              Instant Solution Keys
            </span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <p>© 2026 RankGrade. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: #080808;
      border-top: 1px solid rgba(255, 255, 255, 0.07);
      padding-top: 54px;
      margin-top: auto;
    }
    .footer-content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 36px;
      padding-bottom: 40px;
    }
    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 360px;
    }
    .footer-brand .logo {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .footer-logo-img {
      height: 48px;
      width: auto;
      max-width: 220px;
      object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(0, 123, 167, 0.25));
    }
    .footer-brand .tagline {
      color: rgba(255, 255, 255, 0.55);
      font-size: 0.88rem;
      line-height: 1.6;
    }
    .footer-links {
      display: flex;
      gap: 48px;
      flex-wrap: wrap;
    }
    .link-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .group-title {
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 4px;
    }
    .link-group a, .link-group span {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.55);
      text-decoration: none;
      transition: color 0.2s, transform 0.2s;
    }
    .link-group a:hover {
      color: #0099CC;
      transform: translateX(3px);
    }
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 18px 0;
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.82rem;
    }
    .footer-bottom-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
  `]
})
export class FooterComponent {}
