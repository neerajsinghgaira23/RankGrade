import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../shared/admin-layout.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz } from '../../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminLayoutComponent, IconComponent, LoadingComponent],
  template: `
    <app-admin-layout pageTitle="Operations Console">
      <div header-actions>
        <a routerLink="/admin/quizzes" class="btn btn-primary btn-sm">
          <app-icon name="plus" [size]="15" />
          Create Assessment
        </a>
        <button class="btn btn-outline btn-sm" (click)="exportSummaryCSV()" [disabled]="quizzes.length === 0">
          <app-icon name="download" [size]="15" />
          Export CSV
        </button>
      </div>

      <!-- Welcome Banner -->
      <div class="admin-welcome-banner card">
        <div class="banner-left">
          <div class="banner-badge">
            <img src="assets/images/rankgrade-icon.png" alt="RankGrade" style="width: 16px; height: 16px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(255, 45, 149, 0.4));" />
            <span>Administrative Telemetry &amp; Controls</span>
          </div>
          <h1>System Operations <span class="text-gradient">Console</span></h1>
          <p>Author academic assessments, regulate passing standards, monitor candidate attempts, and review institutional analytics.</p>
        </div>
        <div class="banner-stats-summary">
          <div class="summary-chip">
            <span class="chip-val text-cerulean">{{ stats?.totalQuizzes ?? quizzes.length }}</span>
            <span class="chip-lbl">Total Quizzes</span>
          </div>
          <div class="summary-chip">
            <span class="chip-val text-success">{{ stats?.publishedQuizzes ?? 0 }}</span>
            <span class="chip-lbl">Live to Students</span>
          </div>
          <div class="summary-chip">
            <span class="chip-val text-rose">{{ stats?.totalAttempts ?? 0 }}</span>
            <span class="chip-lbl">Submissions</span>
          </div>
        </div>
      </div>

      @if (loading()) {
        <app-loading label="Synchronizing database records and administrative statistics..." [height]="'340px'" />
      } @else {
        <!-- 8 Real-Data KPI Cards -->
        <div class="kpi-grid">
          <!-- 1. Total Quizzes -->
          <div class="kpi-card card">
            <div class="kpi-icon cerulean">
              <app-icon name="book" [size]="20" color="#0099CC" />
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Total Quizzes</span>
              <span class="kpi-num">{{ stats?.totalQuizzes ?? quizzes.length }}</span>
              <span class="kpi-sub">In curriculum repository</span>
            </div>
          </div>

          <!-- 2. Live & Published -->
          <div class="kpi-card card">
            <div class="kpi-icon green">
              <app-icon name="check-circle" [size]="20" color="#00E676" />
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Live Published</span>
              <span class="kpi-num text-success">{{ stats?.publishedQuizzes ?? 0 }}</span>
              <span class="kpi-sub">Available for student testing</span>
            </div>
          </div>

          <!-- 3. Draft Modules -->
          <div class="kpi-card card">
            <div class="kpi-icon amber">
              <app-icon name="edit" [size]="20" color="#FFB300" />
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Draft Quizzes</span>
              <span class="kpi-num text-warning">{{ stats?.draftQuizzes ?? 0 }}</span>
              <span class="kpi-sub">Unpublished authoring</span>
            </div>
          </div>

          <!-- 4. Registered Candidates -->
          <div class="kpi-card card">
            <div class="kpi-icon cerulean-alt">
              <app-icon name="users" [size]="20" color="#007BA7" />
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Registered Learners</span>
              <span class="kpi-num text-cerulean">{{ stats?.totalStudents ?? 0 }}</span>
              <span class="kpi-sub">Enrolled candidates</span>
            </div>
          </div>

          <!-- 5. Total Attempts -->
          <div class="kpi-card card">
            <div class="kpi-icon rose">
              <app-icon name="activity" [size]="20" color="#FF2D95" />
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Total Submissions</span>
              <span class="kpi-num text-rose">{{ stats?.totalAttempts ?? 0 }}</span>
              <span class="kpi-sub">Student exam sessions</span>
            </div>
          </div>

          <!-- 6. Completed Attempts -->
          <div class="kpi-card card">
            <div class="kpi-icon green">
              <app-icon name="award" [size]="20" color="#00E676" />
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Completed Exams</span>
              <span class="kpi-num text-success">{{ stats?.completedAttempts ?? 0 }}</span>
              <span class="kpi-sub">Evaluated in MySQL</span>
            </div>
          </div>

          <!-- 7. Overall Pass Rate -->
          <div class="kpi-card card">
            <div class="kpi-icon cerulean">
              <app-icon name="target" [size]="20" color="#0099CC" />
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Overall Pass Rate</span>
              <span class="kpi-num text-cerulean">{{ stats?.overallPassRate ?? 0 }}%</span>
              <span class="kpi-sub">Passing threshold met</span>
            </div>
          </div>

          <!-- 8. Average Quiz Score -->
          <div class="kpi-card card">
            <div class="kpi-icon rose">
              <app-icon name="trending-up" [size]="20" color="#FF2D95" />
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Average Score</span>
              <span class="kpi-num text-rose">{{ stats?.averageScore ?? 0 }}%</span>
              <span class="kpi-sub">Cohort mean score</span>
            </div>
          </div>
        </div>

        <!-- Operations Hub Navigation -->
        <div class="hub-grid">
          <a routerLink="/admin/quizzes" class="hub-card card">
            <div class="hub-icon cerulean">
              <app-icon name="file-text" [size]="22" color="#0099CC" />
            </div>
            <div class="hub-content">
              <h3>Quiz Management</h3>
              <p>Author, edit, publish, or draft curriculum assessment items.</p>
            </div>
            <app-icon name="arrow-right" [size]="16" customClass="hub-arrow" />
          </a>

          <a routerLink="/admin/categories" class="hub-card card">
            <div class="hub-icon rose">
              <app-icon name="layers" [size]="22" color="#FF2D95" />
            </div>
            <div class="hub-content">
              <h3>Taxonomy Categories</h3>
              <p>Structure curriculum domains into topics and track quiz distribution.</p>
            </div>
            <app-icon name="arrow-right" [size]="16" customClass="hub-arrow" />
          </a>

          <a routerLink="/admin/students" class="hub-card card">
            <div class="hub-icon green">
              <app-icon name="users" [size]="22" color="#00E676" />
            </div>
            <div class="hub-content">
              <h3>Student Registry</h3>
              <p>Inspect registered candidate profiles, attempts, and manage account status.</p>
            </div>
            <app-icon name="arrow-right" [size]="16" customClass="hub-arrow" />
          </a>

          <a routerLink="/admin/attempts" class="hub-card card">
            <div class="hub-icon amber">
              <app-icon name="award" [size]="22" color="#FFB300" />
            </div>
            <div class="hub-content">
              <h3>Attempts &amp; Results</h3>
              <p>Filter examination logs, review student submissions, and export CSV reports.</p>
            </div>
            <app-icon name="arrow-right" [size]="16" customClass="hub-arrow" />
          </a>

          <a routerLink="/admin/analytics" class="hub-card card">
            <div class="hub-icon cerulean-alt">
              <app-icon name="pie-chart" [size]="22" color="#007BA7" />
            </div>
            <div class="hub-content">
              <h3>Analytics &amp; Diagnostics</h3>
              <p>Visualize pass/fail ratio, score bands, and topic competency charts.</p>
            </div>
            <app-icon name="arrow-right" [size]="16" customClass="hub-arrow" />
          </a>
        </div>

        <!-- Recent Attempts Table (Real-Time Telemetry) -->
        <div class="section-card card mb-4">
          <div class="section-header">
            <div class="sh-left">
              <app-icon name="activity" [size]="18" color="#FF2D95" />
              <h2>Recent Student Examination Submissions</h2>
            </div>
            <a routerLink="/admin/attempts" class="view-all-link">
              View All Logs
              <app-icon name="arrow-right" [size]="14" />
            </a>
          </div>

          @if (stats?.recentAttempts && stats.recentAttempts.length > 0) {
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Assessment Title</th>
                    <th>Score &amp; Marks</th>
                    <th>Percentage</th>
                    <th>Outcome</th>
                    <th>Submission Timestamp</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (a of stats.recentAttempts; track a.id) {
                    <tr>
                      <td>
                        <strong class="candidate-txt">{{ a.studentName }}</strong>
                      </td>
                      <td>
                        <span class="quiz-txt">{{ a.quizTitle }}</span>
                      </td>
                      <td>
                        <span class="marks-txt">{{ a.score }}</span>
                        <span class="marks-sub">/ {{ a.totalMarks }}</span>
                      </td>
                      <td>
                        <span class="score-pill" [class.pass-pill]="a.passed" [class.fail-pill]="!a.passed && a.status !== 'IN_PROGRESS'">
                          {{ a.percentage }}%
                        </span>
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
                      <td>
                        <span class="time-txt">
                          <app-icon name="clock" [size]="12" />
                          {{ a.submittedAt ? (a.submittedAt | date:'medium') : 'Active Session' }}
                        </span>
                      </td>
                      <td class="text-right">
                        <a routerLink="/admin/attempts" class="btn btn-outline btn-xs">
                          Inspect
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-state py-4 text-center">
              <p class="txt-muted">No student examination submissions logged yet.</p>
            </div>
          }
        </div>

        <!-- Curriculum Inventory Table -->
        <div class="section-card card">
          <div class="section-header">
            <div class="sh-left">
              <app-icon name="book-open" [size]="18" color="#0099CC" />
              <h2>Curriculum Assessment Inventory</h2>
            </div>
            <a routerLink="/admin/quizzes" class="view-all-link">
              Manage Quizzes
              <app-icon name="arrow-right" [size]="14" />
            </a>
          </div>

          @if (quizzes.length > 0) {
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Assessment Title</th>
                    <th>Category</th>
                    <th>Question Count</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th class="text-right">Manage Items</th>
                  </tr>
                </thead>
                <tbody>
                  @for (q of quizzes.slice(0, 5); track q.id) {
                    <tr>
                      <td>
                        <strong class="quiz-title-txt">{{ q.title }}</strong>
                      </td>
                      <td>
                        <span class="badge badge-cerulean">{{ q.categoryName || 'General' }}</span>
                      </td>
                      <td>
                        <span class="q-count-pill">{{ q.questionCount }} Items</span>
                      </td>
                      <td>
                        <span class="time-cell">
                          <app-icon name="clock" [size]="13" />
                          {{ q.timeLimitMinutes }} Mins
                        </span>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="q.status === 'PUBLISHED' ? 'badge-success' : (q.status === 'DRAFT' ? 'badge-warning' : 'badge-gray')">
                          {{ q.status }}
                        </span>
                      </td>
                      <td class="text-right">
                        <a [routerLink]="['/admin/quizzes', q.id, 'questions']" class="btn btn-sm btn-outline">
                          <app-icon name="edit" [size]="13" />
                          Questions ({{ q.questionCount }})
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="text-center py-4">
              <p class="txt-muted">No assessment modules found in repository.</p>
            </div>
          }
        </div>
      }
    </app-admin-layout>
  `,
  styles: [`
    .admin-welcome-banner {
      padding: 32px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;
      background: linear-gradient(135deg, rgba(255, 45, 149, 0.08), rgba(0, 123, 167, 0.08));
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
    }
    .banner-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #FF5AAE;
      background: rgba(255, 45, 149, 0.12);
      border: 1px solid rgba(255, 45, 149, 0.3);
      padding: 4px 12px;
      border-radius: 50px;
      margin-bottom: 10px;
    }
    .banner-left h1 {
      font-size: clamp(1.8rem, 3.5vw, 2.3rem);
      font-weight: 800;
      margin-bottom: 8px;
    }
    .banner-left p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.94rem;
      max-width: 620px;
      margin: 0;
      line-height: 1.5;
    }
    .banner-stats-summary {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .summary-chip {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 12px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      min-width: 110px;
    }
    .chip-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: white;
    }
    .chip-lbl {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.45);
      text-transform: uppercase;
      font-weight: 700;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .kpi-card {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-radius: 14px;
    }
    .kpi-icon {
      width: 46px; height: 46px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .kpi-icon.cerulean { background: rgba(0, 123, 167, 0.15); border: 1px solid rgba(0, 123, 167, 0.3); }
    .kpi-icon.green { background: rgba(0, 230, 118, 0.15); border: 1px solid rgba(0, 230, 118, 0.3); }
    .kpi-icon.amber { background: rgba(255, 179, 0, 0.15); border: 1px solid rgba(255, 179, 0, 0.3); }
    .kpi-icon.cerulean-alt { background: rgba(0, 153, 204, 0.15); border: 1px solid rgba(0, 153, 204, 0.3); }
    .kpi-icon.rose { background: rgba(255, 45, 149, 0.15); border: 1px solid rgba(255, 45, 149, 0.3); }

    .kpi-content { display: flex; flex-direction: column; gap: 2px; }
    .kpi-label { font-size: 0.74rem; text-transform: uppercase; font-weight: 700; color: rgba(255, 255, 255, 0.5); letter-spacing: 0.05em; }
    .kpi-num { font-family: 'Space Grotesk', sans-serif; font-size: 1.55rem; font-weight: 800; color: white; line-height: 1.15; }
    .kpi-sub { font-size: 0.7rem; color: rgba(255, 255, 255, 0.4); }

    .text-success { color: #00E676; }
    .text-warning { color: #FFB300; }
    .text-cerulean { color: #0099CC; }
    .text-rose { color: #FF2D95; }

    /* Hub Grid */
    .hub-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .hub-card {
      padding: 22px;
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      transition: all 0.2s ease;
      border-radius: 14px;
    }
    .hub-card:hover {
      border-color: rgba(0, 123, 167, 0.5);
      transform: translateY(-2px);
    }
    .hub-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .hub-icon.cerulean { background: rgba(0, 123, 167, 0.15); border: 1px solid rgba(0, 123, 167, 0.3); }
    .hub-icon.rose { background: rgba(255, 45, 149, 0.15); border: 1px solid rgba(255, 45, 149, 0.3); }
    .hub-icon.green { background: rgba(0, 230, 118, 0.15); border: 1px solid rgba(0, 230, 118, 0.3); }
    .hub-icon.amber { background: rgba(255, 179, 0, 0.15); border: 1px solid rgba(255, 179, 0, 0.3); }
    .hub-icon.cerulean-alt { background: rgba(0, 153, 204, 0.15); border: 1px solid rgba(0, 153, 204, 0.3); }

    .hub-content { flex: 1; min-width: 0; }
    .hub-content h3 { font-size: 0.98rem; color: white; margin: 0 0 3px 0; }
    .hub-content p { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); margin: 0; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hub-arrow { color: rgba(255, 255, 255, 0.4); }
    .hub-card:hover .hub-arrow { color: #0099CC; }

    /* Section Cards & Tables */
    .section-card { padding: 24px; border-radius: 16px; }
    .mb-4 { margin-bottom: 24px; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .sh-left { display: flex; align-items: center; gap: 8px; }
    .sh-left h2 { font-size: 1.15rem; color: white; margin: 0; }
    .view-all-link {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.84rem; font-weight: 600; color: #0099CC;
      text-decoration: none;
    }

    .table-responsive { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; }
    .table th {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.76rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .table td { padding: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
    .table tr:hover td { background: rgba(255, 255, 255, 0.02); }

    .candidate-txt { color: white; font-weight: 600; }
    .quiz-txt { color: rgba(255, 255, 255, 0.85); }
    .marks-txt { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: white; }
    .marks-sub { font-size: 0.74rem; color: rgba(255, 255, 255, 0.4); }

    .score-pill {
      display: inline-block;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.82rem;
      background: rgba(255, 255, 255, 0.06);
      color: white;
    }
    .score-pill.pass-pill { background: rgba(0, 230, 118, 0.12); color: #00E676; }
    .score-pill.fail-pill { background: rgba(255, 23, 68, 0.12); color: #FF1744; }

    .time-txt { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); display: inline-flex; align-items: center; gap: 5px; }

    .badge-success { background: rgba(0, 230, 118, 0.15); color: #00E676; border: 1px solid rgba(0, 230, 118, 0.3); }
    .badge-danger { background: rgba(255, 23, 68, 0.15); color: #FF1744; border: 1px solid rgba(255, 23, 68, 0.3); }
    .badge-warning { background: rgba(255, 179, 0, 0.15); color: #FFB300; border: 1px solid rgba(255, 179, 0, 0.3); }
    .badge-cerulean { background: rgba(0, 123, 167, 0.15); color: #0099CC; border: 1px solid rgba(0, 123, 167, 0.3); }
    .badge-gray { background: rgba(255, 255, 255, 0.06); color: rgba(255, 255, 255, 0.7); }

    .btn-xs { padding: 4px 10px; font-size: 0.78rem; text-decoration: none; }
    .text-right { text-align: right; }
    .time-cell { display: inline-flex; align-items: center; gap: 6px; font-size: 0.84rem; color: rgba(255, 255, 255, 0.6); }
    .txt-muted { color: rgba(255, 255, 255, 0.5); }
    .py-4 { padding: 32px 0; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  quizzes: Quiz[] = [];
  stats: any = null;
  loading = signal<boolean>(true);

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    let loaded = 0;
    const check = () => {
      loaded++;
      if (loaded >= 2) this.loading.set(false);
    };

    this.quizService.adminGetAllQuizzes().subscribe({
      next: (data) => {
        this.quizzes = data || [];
        check();
      },
      error: () => check()
    });

    this.quizService.adminGetStats().subscribe({
      next: (st) => {
        this.stats = st;
        check();
      },
      error: () => check()
    });
  }

  exportSummaryCSV(): void {
    if (!this.quizzes || this.quizzes.length === 0) return;
    const header = ['ID', 'Title', 'Category', 'Question Count', 'Time Limit (Mins)', 'Total Marks', 'Status'];
    const rows = this.quizzes.map(q => [
      q.id,
      `"${(q.title || '').replace(/"/g, '""')}"`,
      `"${(q.categoryName || '').replace(/"/g, '""')}"`,
      q.questionCount,
      q.timeLimitMinutes,
      q.totalMarks,
      q.status
    ]);
    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rankgrade_quizzes_summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
