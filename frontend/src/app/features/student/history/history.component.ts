import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { AttemptHistory } from '../../../core/models/models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, FooterComponent, IconComponent, LoadingComponent],
  template: `
    <app-navbar />

    <main class="history-page">
      <div class="container">
        <div class="page-header">
          <div class="page-tag">
            <app-icon name="clock" [size]="14" color="#0099CC" />
            <span>Telemetry Archive</span>
          </div>
          <h1>Attempt <span class="text-gradient">History</span></h1>
          <p>Review past assessment records, inspect solution reviews, and track performance changes.</p>
        </div>

        <div class="history-card card">
          <div class="toolbar">
            <div class="search-box">
              <app-icon name="search" [size]="16" color="rgba(255,255,255,0.4)" customClass="search-icon" />
              <input
                type="text"
                class="form-control search-input"
                placeholder="Search history by quiz title..."
                [(ngModel)]="searchQuery"
                (input)="filterHistory()"
              />
              @if (searchQuery) {
                <button class="clear-btn" (click)="searchQuery = ''; filterHistory()">
                  <app-icon name="x" [size]="14" />
                </button>
              }
            </div>
          </div>

          @if (loading()) {
            <app-loading label="Loading historical exam telemetry..." [height]="'260px'" />
          } @else if (filteredList().length > 0) {
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Assessment Title</th>
                    <th>Submitted At</th>
                    <th>Score Ratio</th>
                    <th>Percentage</th>
                    <th>Evaluation</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (h of filteredList(); track h.attemptId) {
                    <tr>
                      <td class="quiz-title-cell">
                        <strong>{{ h.quizTitle }}</strong>
                      </td>
                      <td>
                        <span class="time-cell">
                          <app-icon name="calendar" [size]="13" />
                          {{ h.submittedAt | date:'medium' }}
                        </span>
                      </td>
                      <td>
                        <span class="score-ratio-txt">{{ h.score }} / {{ h.totalMarks }}</span>
                      </td>
                      <td>
                        <span class="pct-pill" [class.txt-success]="h.passed" [class.txt-fail]="!h.passed">
                          {{ h.percentage | number:'1.0-1' }}%
                        </span>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="h.passed ? 'badge-success' : 'badge-error'">
                          {{ h.passed ? 'PASSED' : 'FAILED' }}
                        </span>
                      </td>
                      <td class="text-right">
                        <a [routerLink]="['/student/result', h.attemptId]" class="btn btn-sm btn-outline">
                          <app-icon name="file-text" [size]="13" />
                          Review
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-state text-center">
              <div class="empty-icon-wrap">
                <app-icon name="clock" [size]="36" color="rgba(255,255,255,0.3)" />
              </div>
              <h3>No Examination History Found</h3>
              <p>You haven't completed any assessments matching your query.</p>
              <a routerLink="/student/quizzes" class="btn btn-primary btn-sm mt-3">
                <app-icon name="play" [size]="14" />
                Browse Available Quizzes
              </a>
            </div>
          }
        </div>
      </div>
    </main>

    <app-footer />
  `,
  styles: [`
    .history-page {
      min-height: calc(100vh - 140px);
      padding: 36px 0 72px 0;
      background: #0A0A0A;
    }
    .page-header { margin-bottom: 32px; }
    .page-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #0099CC;
      background: rgba(0, 123, 167, 0.1);
      padding: 4px 14px;
      border-radius: 50px;
      border: 1px solid rgba(0, 123, 167, 0.25);
      margin-bottom: 12px;
    }
    .page-header h1 {
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 800;
      margin-bottom: 8px;
    }
    .page-header p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 1rem;
    }

    .history-card {
      padding: 28px;
      border-radius: 20px;
    }
    .toolbar {
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .search-box {
      position: relative;
      width: 100%;
      max-width: 380px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }
    .search-input {
      padding-left: 42px !important;
      padding-right: 36px !important;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.9rem;
    }
    .clear-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
    }
    .clear-btn:hover { color: white; }

    .table-responsive { overflow-x: auto; }
    .table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .table th {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.78rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .table td {
      padding: 18px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.92rem;
    }
    .table tr:hover td { background: rgba(255, 255, 255, 0.02); }

    .quiz-title-cell {
      color: white;
      font-weight: 600;
      font-size: 0.96rem;
    }
    .time-cell {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.84rem;
      color: rgba(255, 255, 255, 0.5);
    }
    .score-ratio-txt {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      color: white;
    }
    .pct-pill {
      font-family: 'Space Grotesk', monospace;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .txt-success { color: #00E676; }
    .txt-fail { color: #FF5AAE; }
    .text-right { text-align: right; }

    .empty-state {
      padding: 56px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .empty-icon-wrap {
      width: 64px; height: 64px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }
    .empty-state h3 { font-size: 1.25rem; color: white; margin: 0; }
    .empty-state p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.5); max-width: 360px; margin: 0; }
  `]
})
export class HistoryComponent implements OnInit {
  historyList: AttemptHistory[] = [];
  filteredList = signal<AttemptHistory[]>([]);
  searchQuery: string = '';
  loading = signal<boolean>(true);

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizService.getHistory().subscribe({
      next: (data) => {
        this.historyList = data || [];
        this.filteredList.set(this.historyList);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterHistory(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredList.set(this.historyList);
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredList.set(
      this.historyList.filter(h => h.quizTitle?.toLowerCase().includes(q))
    );
  }
}
