import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutComponent } from '../shared/admin-layout.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { AdminAnalytics } from '../../../core/models/models';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, AdminLayoutComponent, IconComponent, LoadingComponent],
  template: `
    <app-admin-layout pageTitle="Institutional Learning Analytics">
      <div header-actions>
        <button class="btn btn-outline btn-sm" (click)="loadData()">
          <app-icon name="refresh-cw" [size]="14" />
          Refresh Metrics
        </button>
      </div>

      @if (loading()) {
        <app-loading label="Calculating institutional performance benchmarks..." [height]="'360px'" />
      } @else if (analytics(); as a) {
        <!-- Telemetry KPI Summary -->
        <div class="metrics-grid">
          <div class="metric-card card">
            <div class="m-icon-box cerulean">
              <app-icon name="activity" [size]="22" color="#0099CC" />
            </div>
            <div class="m-body">
              <span class="m-val text-cerulean">{{ a.totalAttempts }}</span>
              <span class="m-lbl">Total Attempts</span>
              <span class="m-sub">{{ a.completedAttempts }} finalized in MySQL</span>
            </div>
          </div>

          <div class="metric-card card">
            <div class="m-icon-box green">
              <app-icon name="check-circle" [size]="22" color="#00E676" />
            </div>
            <div class="m-body">
              <span class="m-val text-success">{{ a.overallPassRate }}%</span>
              <span class="m-lbl">Overall Pass Rate</span>
              <span class="m-sub">{{ a.passCount }} pass / {{ a.failCount }} fail</span>
            </div>
          </div>

          <div class="metric-card card">
            <div class="m-icon-box rose">
              <app-icon name="trending-up" [size]="22" color="#FF2D95" />
            </div>
            <div class="m-body">
              <span class="m-val text-rose">{{ a.averageScore }}%</span>
              <span class="m-lbl">Cohort Average Score</span>
              <span class="m-sub">Mean calculated across attempts</span>
            </div>
          </div>

          <div class="metric-card card">
            <div class="m-icon-box cerulean-alt">
              <app-icon name="layers" [size]="22" color="#007BA7" />
            </div>
            <div class="m-body">
              <span class="m-val">{{ a.categoryStats.length }}</span>
              <span class="m-lbl">Curriculum Domains</span>
              <span class="m-sub">Active taxonomy categories</span>
            </div>
          </div>
        </div>

        @if (a.completedAttempts > 0) {
          <!-- Charts Section -->
          <div class="charts-grid">
            <!-- Score Distribution Bar Chart -->
            <div class="chart-card card">
              <div class="chart-header">
                <div class="ch-info">
                  <h3>Score Distribution Bands</h3>
                  <p>Frequency distribution of student scores across percentage buckets</p>
                </div>
                <span class="chart-badge">
                  <app-icon name="bar-chart" [size]="14" color="#0099CC" />
                  Cohort Bands
                </span>
              </div>
              <div class="chart-container">
                <canvas #barChart></canvas>
              </div>
            </div>

            <!-- Pass vs Fail Doughnut Chart -->
            <div class="chart-card card">
              <div class="chart-header">
                <div class="ch-info">
                  <h3>Pass vs. Fail Ratio</h3>
                  <p>Overall evaluation outcome breakdown</p>
                </div>
                <span class="chart-badge">
                  <app-icon name="target" [size]="14" color="#00E676" />
                  Outcomes
                </span>
              </div>
              <div class="chart-container doughnut-wrap">
                <canvas #doughnutChart></canvas>
              </div>
            </div>
          </div>

          <!-- Category Breakdown Table -->
          <div class="breakdown-card card mb-4">
            <div class="card-header-bar">
              <div class="ch-title">
                <app-icon name="layers" [size]="18" color="#0099CC" />
                <h3>Curriculum Domain Competency Breakdown</h3>
              </div>
              <span class="ch-sub">Aggregated student attempt telemetry by category</span>
            </div>

            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Domain Category</th>
                    <th>Attempts</th>
                    <th>Average Score</th>
                    <th>Pass Rate</th>
                    <th>Competency Benchmark</th>
                  </tr>
                </thead>
                <tbody>
                  @for (cat of a.categoryStats; track cat.categoryName) {
                    <tr>
                      <td>
                        <strong class="domain-title">{{ cat.categoryName }}</strong>
                      </td>
                      <td>
                        <span class="badge badge-gray">{{ cat.attemptCount }} Attempts</span>
                      </td>
                      <td>
                        <span class="score-txt">{{ cat.averageScore }}%</span>
                      </td>
                      <td>
                        <div class="prog-wrapper">
                          <div class="prog-bar-bg">
                            <div class="prog-bar-fill" [style.width.%]="cat.passRate"></div>
                          </div>
                          <span class="prog-rate" [class.text-success]="cat.passRate >= 50" [class.text-rose]="cat.passRate < 50">
                            {{ cat.passRate }}%
                          </span>
                        </div>
                      </td>
                      <td>
                        @if (cat.passRate >= 70) {
                          <span class="badge badge-success">HIGH MASTERY</span>
                        } @else if (cat.passRate >= 40) {
                          <span class="badge badge-warning">MODERATE</span>
                        } @else {
                          <span class="badge badge-danger">NEEDS INTERVENTION</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quiz-by-Quiz Ranking Table -->
          <div class="breakdown-card card">
            <div class="card-header-bar">
              <div class="ch-title">
                <app-icon name="book-open" [size]="18" color="#FF2D95" />
                <h3>Assessment Module Diagnostics &amp; Difficulty</h3>
              </div>
              <span class="ch-sub">Evaluation metrics ranked by student participation</span>
            </div>

            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Assessment Title</th>
                    <th>Participation Count</th>
                    <th>Average Score</th>
                    <th>Pass Rate</th>
                    <th>Difficulty Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  @for (q of a.quizStats; track q.quizTitle) {
                    <tr>
                      <td>
                        <strong class="domain-title">{{ q.quizTitle }}</strong>
                      </td>
                      <td>
                        <span class="badge badge-cerulean">{{ q.attemptCount }} Candidates</span>
                      </td>
                      <td>
                        <span class="score-txt">{{ q.averageScore }}%</span>
                      </td>
                      <td>
                        <span class="prog-rate" [class.text-success]="q.passRate >= 50" [class.text-rose]="q.passRate < 50">
                          {{ q.passRate }}%
                        </span>
                      </td>
                      <td>
                        @if (q.averageScore < 40) {
                          <span class="badge badge-danger">CHALLENGING</span>
                        } @else if (q.averageScore <= 70) {
                          <span class="badge badge-warning">BALANCED</span>
                        } @else {
                          <span class="badge badge-success">ACCESSIBLE</span>
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
            <app-icon name="pie-chart" [size]="40" color="rgba(255,255,255,0.3)" />
            <h3>No Finalized Examination Attempts</h3>
            <p class="txt-muted">Telemetry charts will populate once students submit quiz examinations.</p>
          </div>
        }
      }
    </app-admin-layout>
  `,
  styles: [`
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .metric-card {
      padding: 22px 24px;
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .m-icon-box {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .m-icon-box.cerulean { background: rgba(0, 123, 167, 0.15); border: 1px solid rgba(0, 123, 167, 0.3); }
    .m-icon-box.rose { background: rgba(255, 45, 149, 0.15); border: 1px solid rgba(255, 45, 149, 0.3); }
    .m-icon-box.green { background: rgba(0, 230, 118, 0.15); border: 1px solid rgba(0, 230, 118, 0.3); }
    .m-icon-box.cerulean-alt { background: rgba(0, 153, 204, 0.15); border: 1px solid rgba(0, 153, 204, 0.3); }

    .m-body { display: flex; flex-direction: column; gap: 2px; }
    .m-val { font-family: 'Space Grotesk', sans-serif; font-size: 1.65rem; font-weight: 800; color: white; line-height: 1.15; }
    .m-lbl { font-size: 0.76rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.5); }
    .m-sub { font-size: 0.72rem; color: rgba(255, 255, 255, 0.4); }
    .text-cerulean { color: #0099CC; }
    .text-rose { color: #FF2D95; }
    .text-success { color: #00E676; }

    /* Charts Grid */
    .charts-grid {
      display: grid;
      grid-template-columns: 1.35fr 0.65fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    @media (max-width: 992px) {
      .charts-grid { grid-template-columns: 1fr; }
    }
    .chart-card { padding: 28px; display: flex; flex-direction: column; }
    .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .ch-info h3 { font-size: 1.15rem; color: white; margin: 0 0 4px 0; }
    .ch-info p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.5); margin: 0; }
    .chart-badge {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 0.75rem; font-weight: 600; color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.04); padding: 4px 10px;
      border-radius: 50px; border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .chart-container { position: relative; height: 280px; width: 100%; }
    .doughnut-wrap { display: flex; align-items: center; justify-content: center; }

    /* Breakdown Tables */
    .breakdown-card { padding: 28px; border-radius: 16px; }
    .mb-4 { margin-bottom: 28px; }
    .card-header-bar { margin-bottom: 20px; }
    .ch-title { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .ch-title h3 { font-size: 1.15rem; color: white; margin: 0; }
    .ch-sub { font-size: 0.82rem; color: rgba(255, 255, 255, 0.45); }

    .table-responsive { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; }
    .table th {
      padding: 12px 16px; color: rgba(255, 255, 255, 0.5);
      font-size: 0.76rem; text-transform: uppercase; font-weight: 700;
      letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .table td { padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
    .domain-title { color: white; }
    .score-txt { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: white; }

    .prog-wrapper { display: flex; align-items: center; gap: 10px; min-width: 140px; }
    .prog-bar-bg { flex: 1; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 50px; overflow: hidden; }
    .prog-bar-fill { height: 100%; background: linear-gradient(90deg, #007BA7, #00E676); border-radius: 50px; }
    .prog-rate { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.86rem; min-width: 44px; }

    .badge-gray { background: rgba(255, 255, 255, 0.06); color: rgba(255, 255, 255, 0.7); }
    .badge-cerulean { background: rgba(0, 123, 167, 0.15); color: #0099CC; border: 1px solid rgba(0, 123, 167, 0.3); }
    .badge-success { background: rgba(0, 230, 118, 0.15); color: #00E676; border: 1px solid rgba(0, 230, 118, 0.3); }
    .badge-warning { background: rgba(255, 179, 0, 0.15); color: #FFB300; border: 1px solid rgba(255, 179, 0, 0.3); }
    .badge-danger { background: rgba(255, 23, 68, 0.15); color: #FF1744; border: 1px solid rgba(255, 23, 68, 0.3); }

    .py-5 { padding: 48px 0; }
    .txt-muted { color: rgba(255, 255, 255, 0.5); }
  `]
})
export class AdminAnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barChart') barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart') doughnutCanvas!: ElementRef<HTMLCanvasElement>;

  analytics = signal<AdminAnalytics | null>(null);
  loading = signal<boolean>(true);

  private barChartInstance: any;
  private doughnutChartInstance: any;

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.quizService.adminGetAnalytics().subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.loading.set(false);
        setTimeout(() => this.renderCharts(), 150);
      },
      error: () => this.loading.set(false)
    });
  }

  ngAfterViewInit(): void {
    if (this.analytics()) {
      this.renderCharts();
    }
  }

  renderCharts(): void {
    const a = this.analytics();
    if (!a || a.completedAttempts === 0) return;

    // 1. Score Distribution Bar Chart
    if (this.barCanvas && a.scoreDistribution) {
      if (this.barChartInstance) this.barChartInstance.destroy();

      const labels = Object.keys(a.scoreDistribution);
      const data = Object.values(a.scoreDistribution);

      this.barChartInstance = new Chart(this.barCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Candidate Attempts',
            data,
            backgroundColor: [
              'rgba(255, 45, 149, 0.65)',
              'rgba(255, 179, 0, 0.65)',
              'rgba(0, 123, 167, 0.65)',
              'rgba(56, 189, 248, 0.65)',
              'rgba(0, 230, 118, 0.65)'
            ],
            borderColor: [
              '#FF2D95',
              '#FFB300',
              '#007BA7',
              '#38bdf8',
              '#00E676'
            ],
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#141414',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: '#38bdf8'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, color: 'rgba(255,255,255,0.6)' },
              grid: { color: 'rgba(255,255,255,0.06)' }
            },
            x: {
              ticks: { color: 'rgba(255,255,255,0.6)' },
              grid: { color: 'rgba(255,255,255,0.06)' }
            }
          }
        }
      });
    }

    // 2. Pass vs Fail Doughnut Chart
    if (this.doughnutCanvas) {
      if (this.doughnutChartInstance) this.doughnutChartInstance.destroy();

      this.doughnutChartInstance = new Chart(this.doughnutCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Passed', 'Needs Remediation'],
          datasets: [{
            data: [a.passCount, a.failCount],
            backgroundColor: ['#00E676', '#FF2D95'],
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: 'rgba(255,255,255,0.7)',
                padding: 16,
                font: { size: 12 }
              }
            }
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.barChartInstance) this.barChartInstance.destroy();
    if (this.doughnutChartInstance) this.doughnutChartInstance.destroy();
  }
}
