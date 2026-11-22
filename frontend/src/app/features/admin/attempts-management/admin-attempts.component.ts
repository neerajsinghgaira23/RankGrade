import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../shared/admin-layout.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { AdminAttempt, AttemptResult, Category } from '../../../core/models/models';

@Component({
  selector: 'app-admin-attempts',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent, IconComponent, LoadingComponent],
  template: `
    <app-admin-layout pageTitle="Examination Telemetry &amp; Logs">
      <div header-actions>
        <button class="btn btn-outline btn-sm" (click)="exportAttemptsCSV()" [disabled]="attempts.length === 0">
          <app-icon name="download" [size]="15" />
          Export CSV
        </button>
      </div>

      <!-- Overview Metric Badges -->
      <div class="metrics-strip">
        <div class="metric-pill">
          <span class="m-label">Total Logged Attempts:</span>
          <span class="m-val text-cerulean">{{ attempts.length }}</span>
        </div>
        <div class="metric-pill">
          <span class="m-label">Completed Evaluations:</span>
          <span class="m-val">{{ getCompletedCount() }}</span>
        </div>
        <div class="metric-pill">
          <span class="m-label">System Pass Rate:</span>
          <span class="m-val text-success">{{ getPassRate() }}%</span>
        </div>
        <div class="metric-pill">
          <span class="m-label">Average Score:</span>
          <span class="m-val text-rose">{{ getAverageScore() }}%</span>
        </div>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="toolbar-card card">
        <div class="search-input-wrap">
          <app-icon name="search" [size]="16" color="rgba(255,255,255,0.4)" customClass="search-icon" />
          <input
            type="text"
            class="form-control"
            placeholder="Search candidate name, username, or quiz..."
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
          />
        </div>

        <div class="filter-controls">
          <select class="form-control filter-select" [(ngModel)]="selectedCategory" (change)="applyFilters()">
            <option value="">All Categories</option>
            @for (cat of categories; track cat.id) {
              <option [value]="cat.name">{{ cat.name }}</option>
            }
          </select>

          <select class="form-control filter-select" [(ngModel)]="selectedStatus" (change)="applyFilters()">
            <option value="">All Statuses</option>
            <option value="EVALUATED">Evaluated</option>
            <option value="AUTO_SUBMITTED">Auto Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
          </select>

          <select class="form-control filter-select" [(ngModel)]="selectedOutcome" (change)="applyFilters()">
            <option value="">All Outcomes</option>
            <option value="PASSED">Passed Only</option>
            <option value="FAILED">Failed Only</option>
          </select>

          @if (searchQuery || selectedCategory || selectedStatus || selectedOutcome) {
            <button class="btn btn-outline btn-sm clear-btn" (click)="clearFilters()">
              <app-icon name="x" [size]="14" />
              Clear
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <app-loading label="Fetching persisted examination attempts from database..." [height]="'320px'" />
      } @else if (filteredAttempts.length > 0) {
        <div class="table-card card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Assessment &amp; Category</th>
                  <th>Timeline</th>
                  <th>Score &amp; Marks</th>
                  <th>Percentage</th>
                  <th>Outcome</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (a of filteredAttempts; track a.id) {
                  <tr>
                    <td>
                      <div class="candidate-cell">
                        <div class="candidate-avatar">{{ a.studentName.substring(0, 2).toUpperCase() }}</div>
                        <div class="candidate-meta">
                          <span class="candidate-name">{{ a.studentName }}</span>
                          <span class="candidate-sub">&#64;{{ a.studentUsername }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="quiz-cell">
                        <strong class="quiz-title">{{ a.quizTitle }}</strong>
                        <span class="badge badge-cerulean">{{ a.categoryName }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="timeline-cell">
                        <span class="time-sub">{{ a.submittedAt ? (a.submittedAt | date:'medium') : 'In Session' }}</span>
                        @if (a.timeTakenSeconds) {
                          <span class="duration-tag">
                            <app-icon name="clock" [size]="12" />
                            {{ formatDuration(a.timeTakenSeconds) }}
                          </span>
                        }
                      </div>
                    </td>
                    <td>
                      <div class="score-cell">
                        <span class="score-num">{{ a.scoreObtained }}</span>
                        <span class="score-den">/ {{ a.totalMarks }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="pct-pill" [class.passed]="a.passed" [class.failed]="!a.passed && a.status !== 'IN_PROGRESS'">
                        {{ a.percentage }}%
                      </div>
                    </td>
                    <td>
                      @if (a.status === 'IN_PROGRESS') {
                        <span class="badge badge-warning">IN PROGRESS</span>
                      } @else if (a.passed) {
                        <span class="badge badge-success">PASSED</span>
                      } @else {
                        <span class="badge badge-danger">FAILED</span>
                      }
                    </td>
                    <td class="text-right">
                      @if (a.status !== 'IN_PROGRESS') {
                        <button class="btn btn-outline btn-sm" (click)="inspectAttempt(a.id)">
                          <app-icon name="eye" [size]="14" />
                          Review
                        </button>
                      } @else {
                        <span class="live-active-tag">Active</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="empty-state card text-center py-5">
          <app-icon name="file-text" [size]="36" color="rgba(255,255,255,0.3)" />
          <h3>No attempts matched</h3>
          <p class="txt-muted">Try adjusting your filters or search terms.</p>
        </div>
      }

      <!-- Detailed Review Modal -->
      @if (inspectingAttempt) {
        <div class="modal-backdrop" (click)="inspectingAttempt = null">
          <div class="modal-card card review-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <div class="modal-tag">ATTEMPT #{{ inspectingAttempt.attemptId }} REVIEW</div>
                <h3>{{ inspectingAttempt.quizTitle }}</h3>
                <span class="modal-sub">
                  Candidate: {{ getStudentNameForAttempt(inspectingAttempt.attemptId) }} &bull;
                  Submitted: {{ inspectingAttempt.submittedAt | date:'medium' }}
                </span>
              </div>
              <button class="close-btn" (click)="inspectingAttempt = null">
                <app-icon name="x" [size]="18" />
              </button>
            </div>

            <!-- Score banner in modal -->
            <div class="review-banner" [class.passed]="inspectingAttempt.passed">
              <div class="rb-score">
                <span class="rb-label">Score Awarded</span>
                <span class="rb-val">{{ inspectingAttempt.scoreObtained }} / {{ inspectingAttempt.totalMarks }} ({{ inspectingAttempt.percentage }}%)</span>
              </div>
              <div class="rb-stats">
                <span class="rb-stat text-success">{{ inspectingAttempt.correctCount }} Correct</span>
                <span class="rb-stat text-rose">{{ inspectingAttempt.wrongCount }} Incorrect</span>
                <span class="rb-stat text-muted">{{ inspectingAttempt.unansweredCount }} Unanswered</span>
              </div>
            </div>

            <!-- Question Review List -->
            <div class="review-questions-list">
              @for (ans of inspectingAttempt.answers; let idx = $index; track ans.questionId) {
                <div class="review-q-card" [class.ans-correct]="ans.correct" [class.ans-wrong]="!ans.correct && ans.selectedOptionId">
                  <div class="rq-header">
                    <span class="rq-num">Question {{ idx + 1 }}</span>
                    <span class="rq-status" [class.text-success]="ans.correct" [class.text-rose]="!ans.correct">
                      {{ ans.correct ? '+' + ans.marksAwarded + ' Marks' : '0 Marks' }}
                    </span>
                  </div>
                  <p class="rq-text">{{ ans.questionText }}</p>

                  <div class="rq-options">
                    <div class="rq-opt-box student-choice" [class.is-correct]="ans.correct">
                      <span class="rq-opt-lbl">Student Selected:</span>
                      <span class="rq-opt-val">{{ ans.selectedOptionText || '(Unanswered)' }}</span>
                    </div>

                    @if (!ans.correct && ans.correctOptionText) {
                      <div class="rq-opt-box correct-key">
                        <span class="rq-opt-lbl">Correct Key:</span>
                        <span class="rq-opt-val">{{ ans.correctOptionText }}</span>
                      </div>
                    }
                  </div>

                  @if (ans.explanation) {
                    <div class="rq-expl">
                      <app-icon name="help-circle" [size]="13" color="#0099CC" />
                      <span>{{ ans.explanation }}</span>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="modal-footer">
              <button class="btn btn-outline btn-sm" (click)="inspectingAttempt = null">Close Review</button>
            </div>
          </div>
        </div>
      }
    </app-admin-layout>
  `,
  styles: [`
    .metrics-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric-pill {
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .m-label { font-size: 0.76rem; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
    .m-val { font-family: 'Space Grotesk', sans-serif; font-size: 1.6rem; font-weight: 800; color: white; }
    .text-cerulean { color: #0099CC; }
    .text-success { color: #00E676; }
    .text-rose { color: #FF2D95; }

    .toolbar-card {
      padding: 18px 24px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    .search-input-wrap {
      position: relative;
      flex: 1;
      min-width: 280px;
      max-width: 440px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }
    .search-input-wrap .form-control {
      padding-left: 42px !important;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .filter-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .filter-select {
      background: #181818;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.84rem;
      padding: 8px 12px;
      border-radius: 8px;
      min-width: 140px;
    }
    .clear-btn { gap: 6px; }

    .table-card { padding: 0; overflow: hidden; border-radius: 16px; }
    .table-responsive { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; text-align: left; }
    .table th {
      padding: 14px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.76rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      background: rgba(255, 255, 255, 0.015);
    }
    .table td {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.9rem;
    }
    .table tr:hover td { background: rgba(255, 255, 255, 0.02); }

    .candidate-cell { display: flex; align-items: center; gap: 12px; }
    .candidate-avatar {
      width: 34px; height: 34px;
      border-radius: 8px;
      background: linear-gradient(135deg, #007BA7, #FF2D95);
      color: white;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .candidate-meta { display: flex; flex-direction: column; gap: 2px; }
    .candidate-name { font-weight: 600; color: white; }
    .candidate-sub { font-size: 0.74rem; color: rgba(255, 255, 255, 0.4); }

    .quiz-cell { display: flex; flex-direction: column; gap: 4px; }
    .quiz-title { color: white; font-size: 0.92rem; }

    .timeline-cell { display: flex; flex-direction: column; gap: 3px; font-size: 0.8rem; color: rgba(255, 255, 255, 0.6); }
    .duration-tag { display: inline-flex; align-items: center; gap: 5px; font-size: 0.74rem; color: rgba(255, 255, 255, 0.45); }

    .score-cell { font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; }
    .score-num { font-weight: 700; color: white; }
    .score-den { color: rgba(255, 255, 255, 0.4); font-size: 0.82rem; margin-left: 2px; }

    .pct-pill {
      display: inline-block;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 0.86rem;
      padding: 3px 10px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
      color: white;
    }
    .pct-pill.passed { background: rgba(0, 230, 118, 0.12); color: #00E676; }
    .pct-pill.failed { background: rgba(255, 23, 68, 0.12); color: #FF1744; }

    .badge-success { background: rgba(0, 230, 118, 0.15); color: #00E676; border: 1px solid rgba(0, 230, 118, 0.3); }
    .badge-danger { background: rgba(255, 23, 68, 0.15); color: #FF1744; border: 1px solid rgba(255, 23, 68, 0.3); }
    .badge-warning { background: rgba(255, 179, 0, 0.15); color: #FFB300; border: 1px solid rgba(255, 179, 0, 0.3); }
    .badge-cerulean { background: rgba(0, 123, 167, 0.15); color: #0099CC; border: 1px solid rgba(0, 123, 167, 0.3); }

    .live-active-tag { font-size: 0.78rem; color: #FFB300; font-weight: 600; }
    .text-right { text-align: right; }
    .py-5 { padding: 48px 0; }
    .txt-muted { color: rgba(255, 255, 255, 0.5); }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
    }
    .review-modal {
      width: 100%; max-width: 760px;
      max-height: 90vh;
      display: flex; flex-direction: column;
      padding: 32px;
      background: #141414;
      border-radius: 20px;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .modal-tag { font-size: 0.72rem; font-weight: 800; color: #0099CC; letter-spacing: 0.06em; margin-bottom: 4px; }
    .modal-header h3 { font-size: 1.35rem; color: white; margin: 0 0 6px 0; }
    .modal-sub { font-size: 0.84rem; color: rgba(255, 255, 255, 0.5); }
    .close-btn { background: none; border: none; color: rgba(255, 255, 255, 0.5); cursor: pointer; }
    .close-btn:hover { color: white; }

    .review-banner {
      background: rgba(255, 23, 68, 0.08);
      border: 1px solid rgba(255, 23, 68, 0.25);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap; gap: 12px;
    }
    .review-banner.passed {
      background: rgba(0, 230, 118, 0.08);
      border-color: rgba(0, 230, 118, 0.25);
    }
    .rb-score { display: flex; flex-direction: column; gap: 2px; }
    .rb-label { font-size: 0.74rem; text-transform: uppercase; color: rgba(255, 255, 255, 0.6); font-weight: 700; }
    .rb-val { font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; font-weight: 800; color: white; }
    .rb-stats { display: flex; gap: 14px; font-size: 0.84rem; font-weight: 600; }

    .review-questions-list {
      flex: 1; overflow-y: auto;
      display: flex; flex-direction: column; gap: 16px;
      padding-right: 6px; margin-bottom: 20px;
    }
    .review-q-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      padding: 18px 20px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .review-q-card.ans-correct { border-color: rgba(0, 230, 118, 0.3); background: rgba(0, 230, 118, 0.03); }
    .review-q-card.ans-wrong { border-color: rgba(255, 23, 68, 0.3); background: rgba(255, 23, 68, 0.03); }

    .rq-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-weight: 700; }
    .rq-num { color: rgba(255, 255, 255, 0.6); text-transform: uppercase; }
    .rq-text { font-size: 0.95rem; color: white; margin: 0; line-height: 1.45; }

    .rq-options { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
    .rq-opt-box {
      padding: 10px 14px; border-radius: 8px; font-size: 0.86rem;
      display: flex; gap: 8px; align-items: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .rq-opt-box.student-choice.is-correct { background: rgba(0, 230, 118, 0.1); border-color: rgba(0, 230, 118, 0.3); color: #00E676; }
    .rq-opt-box.student-choice:not(.is-correct) { background: rgba(255, 23, 68, 0.1); border-color: rgba(255, 23, 68, 0.3); color: #FF5252; }
    .rq-opt-box.correct-key { background: rgba(0, 230, 118, 0.08); border-color: rgba(0, 230, 118, 0.25); color: #00E676; }
    .rq-opt-lbl { font-weight: 700; opacity: 0.75; }

    .rq-expl {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.8rem; color: #38bdf8;
      background: rgba(0, 123, 167, 0.08);
      border: 1px solid rgba(0, 123, 167, 0.2);
      border-radius: 6px; padding: 6px 10px;
    }
    .modal-footer { display: flex; justify-content: flex-end; }
  `]
})
export class AdminAttemptsComponent implements OnInit {
  attempts: AdminAttempt[] = [];
  filteredAttempts: AdminAttempt[] = [];
  categories: Category[] = [];
  loading = signal<boolean>(true);

  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedOutcome = '';

  inspectingAttempt: AttemptResult | null = null;

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.quizService.getCategories().subscribe({
      next: (cats) => { this.categories = cats || []; }
    });

    this.quizService.adminGetAllAttempts().subscribe({
      next: (data) => {
        this.attempts = data || [];
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilters(): void {
    let list = [...this.attempts];

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(a =>
        a.studentName.toLowerCase().includes(q) ||
        a.studentUsername.toLowerCase().includes(q) ||
        a.quizTitle.toLowerCase().includes(q)
      );
    }

    if (this.selectedCategory) {
      list = list.filter(a => a.categoryName === this.selectedCategory);
    }

    if (this.selectedStatus) {
      list = list.filter(a => a.status === this.selectedStatus);
    }

    if (this.selectedOutcome === 'PASSED') {
      list = list.filter(a => a.passed === true);
    } else if (this.selectedOutcome === 'FAILED') {
      list = list.filter(a => a.passed === false && a.status !== 'IN_PROGRESS');
    }

    this.filteredAttempts = list;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.selectedOutcome = '';
    this.applyFilters();
  }

  getCompletedCount(): number {
    return this.attempts.filter(a => a.status !== 'IN_PROGRESS').length;
  }

  getPassRate(): number {
    const completed = this.attempts.filter(a => a.status !== 'IN_PROGRESS');
    if (completed.length === 0) return 0;
    const passed = completed.filter(a => a.passed).length;
    return Math.round((passed / completed.length) * 1000) / 10;
  }

  getAverageScore(): number {
    const completed = this.attempts.filter(a => a.status !== 'IN_PROGRESS');
    if (completed.length === 0) return 0;
    const total = completed.reduce((acc, a) => acc + (a.percentage || 0), 0);
    return Math.round((total / completed.length) * 10) / 10;
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  inspectAttempt(attemptId: number): void {
    this.quizService.adminGetAttemptDetail(attemptId).subscribe({
      next: (res) => {
        this.inspectingAttempt = res;
      },
      error: () => alert('Failed to fetch attempt details.')
    });
  }

  getStudentNameForAttempt(attemptId: number): string {
    const att = this.attempts.find(a => a.id === attemptId);
    return att ? att.studentName : 'Candidate';
  }

  exportAttemptsCSV(): void {
    if (this.filteredAttempts.length === 0) return;
    const headers = ['Attempt ID', 'Candidate Name', 'Username', 'Email', 'Assessment', 'Category', 'Submitted At', 'Score', 'Total Marks', 'Percentage', 'Outcome', 'Status'];
    const rows = this.filteredAttempts.map(a => [
      a.id,
      `"${(a.studentName || '').replace(/"/g, '""')}"`,
      `"${a.studentUsername}"`,
      `"${a.studentEmail}"`,
      `"${(a.quizTitle || '').replace(/"/g, '""')}"`,
      `"${a.categoryName}"`,
      a.submittedAt || '',
      a.scoreObtained,
      a.totalMarks,
      `${a.percentage}%`,
      a.passed ? 'PASSED' : (a.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'FAILED'),
      a.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rankgrade_attempts_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
