import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (overlay) {
      <div class="loading-overlay">
        <div class="spinner-container">
          <div class="dual-ring"></div>
          <span class="loading-label">{{ label || 'Loading RankGrade telemetry...' }}</span>
        </div>
      </div>
    } @else {
      <div class="loading-inline" [style.min-height]="height || '160px'">
        <div class="dual-ring"></div>
        <span class="loading-label">{{ label || 'Loading data...' }}</span>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .loading-inline {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      width: 100%;
    }
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 32px 48px;
      border-radius: 20px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 123, 167, 0.2);
    }
    .dual-ring {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(0, 123, 167, 0.2);
      border-top-color: #007BA7;
      border-right-color: #FF2D95;
      border-radius: 50%;
      animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.7);
      letter-spacing: 0.3px;
    }
  `]
})
export class LoadingComponent {
  @Input() overlay = false;
  @Input() label = '';
  @Input() height = '';
}
