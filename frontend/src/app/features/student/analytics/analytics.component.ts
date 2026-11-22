import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { Analytics } from '../../../core/models/models';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, IconComponent, LoadingComponent],
  template: `
    <app-navbar />

    <main class="analytics-page">
      <div class="container">
        @if (loading()) {
          <app-loading label="Synthesizing performance telemetry and chart models..." [height]="'420px'" />
        } @else if (analytics(); as a) {
          <div class="page-header">
            <div class="page-tag">
              <app-icon name="bar-chart" [size]="14" color="#0099CC" />
              <span>Performance Telemetry</span>
            </div>
            <h1>Performance <span class="text-gradient">Diagnostics</span></h1>
            <p>Inspect longitudinal examination trends, pass consistency, and score distributions.</p>
          </div>

          <!-- Metrics KPI Cards -->
          <div class="metrics-grid">
            <div class="metric-card card">
              <div class="m-icon-box cerulean">
                <app-icon name="target" [size]="22" color="#0099CC" />
              </div>
              <div class="m-body">
                <span class="m-val text-cerulean">{{ a.passRate | number:'1.0-1' }}%</span>
                <span class="m-lbl">Pass Accuracy</span>
                <span class="m-sub">{{ a.passCount }} Passed / {{ a.failCount }} Failed</span>
              </div>
            </div>

            <div class="metric-card card">
              <div class="m-icon-box rose">
                <app-icon name="trending-up" [size]="22" color="#FF2D95" />
              </div>
              <div class="m-body">
                <span class="m-val text-rose">{{ a.averagePercentage | number:'1.0-1' }}%</span>
                <span class="m-lbl">Average Score</span>
                <span class="m-sub">Across all attempts</span>
              </div>
            </div>

            <div class="metric-card card">
              <div class="m-icon-box green">
                <app-icon name="award" [size]="22" color="#00E676" />
              </div>
              <div class="m-body">
                <span class="m-val text-success">{{ a.bestPercentage | number:'1.0-1' }}%</span>
                <span class="m-lbl">Peak Performance</span>
                <span class="m-sub">Highest recorded percentage</span>
              </div>
            </div>

            <div class="metric-card card">
              <div class="m-icon-box cerulean-alt">
                <app-icon name="layers" [size]="22" color="#007BA7" />
              </div>
              <div class="m-body">
                <span class="m-val">{{ a.totalAttempts }}</span>
                <span class="m-lbl">Examinations Taken</span>
                <span class="m-sub">Validated database records</span>
              </div>
            </div>
          </div>

          @if (a.totalAttempts > 0) {
            <!-- Charts Grid -->
            <div class="charts-grid">
              <div class="chart-card card">
                <div class="chart-header">
                  <div class="ch-info">
                    <h3>Score Progression Trajectory</h3>
                    <p>Chronological performance over recent examination attempts</p>
                  </div>
                  <span class="chart-badge">
                    <app-icon name="trending-up" [size]="14" color="#0099CC" />
                    Live Data
                  </span>
                </div>
                <div class="chart-container">
                  <canvas #trendChart></canvas>
                </div>
              </div>

              <div class="chart-card card">
                <div class="chart-header">
                  <div class="ch-info">
                    <h3>Outcome Ratio</h3>
                    <p>Pass vs. needs improvement distribution</p>
                  </div>
                  <span class="chart-badge">
                    <app-icon name="target" [size]="14" color="#00E676" />
                    Distribution
                  </span>
                </div>
                <div class="chart-container doughnut-wrap">
                  <canvas #pieChart></canvas>
                </div>
              </div>
            </div>

            <!-- Trend Table -->
            <div class="trend-table-card card">
              <div class="table-header">
                <h3>Assessment Milestones Log</h3>
                <span class="th-sub">Sequential attempt records</span>
              </div>

              @if (a.scoreTrend && a.scoreTrend.length > 0) {
                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Assessment</th>
                        <th>Submission Timestamp</th>
                        <th>Score Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of a.scoreTrend; track item.submittedAt) {
                        <tr>
                          <td>
                            <strong class="quiz-title-cell">{{ item.quizTitle }}</strong>
                          </td>
                          <td>
                            <span class="time-cell">
                              <app-icon name="calendar" [size]="13" />
                              {{ item.submittedAt | date:'medium' }}
                            </span>
                          </td>
                          <td>
                            <div class="prog-cell">
                              <div class="bar-bg">
                                <div class="bar-fill" [style.width.%]="item.percentage"></div>
                              </div>
                              <span class="prog-txt" [class.txt-success]="item.percentage >= 40" [class.txt-danger]="item.percentage < 40">
                                {{ item.percentage | number:'1.0-1' }}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="empty-milestones">
                  <p>No milestone records found.</p>
                </div>
              }
            </div>
          } @else {
            <div class="empty-analytics card text-center">
              <div class="empty-icon-wrap">
                <app-icon name="bar-chart" [size]="40" color="rgba(255,255,255,0.3)" />
              </div>
              <h3>No Examination Telemetry Yet</h3>
              <p>Complete at least one assessment to generate score progression charts and diagnostic breakdowns.</p>
              <a routerLink="/student/quizzes" class="btn btn-primary btn-sm mt-3">
                <app-icon name="play" [size]="14" />
                Take Your First Quiz
              </a>
            </div>
          }
        }
      </div>
    </main>

    <app-footer />
  `,
  styles: [`
    .analytics-page {
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

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 20px;
      margin-bottom: 36px;
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

    .m-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .m-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.65rem;
      font-weight: 800;
      color: white;
      line-height: 1.15;
    }
    .m-lbl {
      font-size: 0.76rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.5);
    }
    .m-sub {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.4);
    }
    .text-cerulean { color: #0099CC; }
    .text-rose { color: #FF2D95; }
    .text-success { color: #00E676; }

    /* Charts Grid */
    .charts-grid {
      display: grid;
      grid-template-columns: 1.3fr 0.7fr;
      gap: 24px;
      margin-bottom: 36px;
    }
    @media (max-width: 992px) {
      .charts-grid { grid-template-columns: 1fr; }
    }
    .chart-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .ch-info h3 { font-size: 1.15rem; color: white; margin: 0 0 4px 0; }
    .ch-info p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.5); margin: 0; }
    .chart-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.04);
      padding: 4px 10px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .chart-container {
      position: relative;
      height: 280px;
      width: 100%;
    }
    .doughnut-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Trend Table */
    .trend-table-card {
      padding: 28px;
    }
    .table-header { margin-bottom: 20px; }
    .table-header h3 { font-size: 1.15rem; color: white; margin: 0 0 4px 0; }
    .th-sub { font-size: 0.84rem; color: rgba(255, 255, 255, 0.5); }
    .table-responsive { overflow-x: auto; }
    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    .table th {
      text-align: left;
      padding: 12px 16px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.78rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .table td {
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.85);
    }
    .quiz-title-cell { color: white; font-weight: 600; }
    .time-cell {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.84rem;
    }
    .prog-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 180px;
    }
    .bar-bg {
      flex: 1;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #007BA7, #FF2D95);
      border-radius: 50px;
    }
    .prog-txt {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 0.9rem;
      min-width: 50px;
    }
    .txt-success { color: #00E676; }
    .txt-danger { color: #FF5AAE; }

    .empty-analytics {
      padding: 60px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
    }
    .empty-icon-wrap {
      width: 72px; height: 72px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.03);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;
    }
    .empty-analytics h3 { font-size: 1.3rem; color: white; margin: 0; }
    .empty-analytics p { font-size: 0.92rem; color: rgba(255, 255, 255, 0.55); max-width: 420px; margin: 0; }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trendChart') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieCanvas!: ElementRef<HTMLCanvasElement>;

  analytics = signal<Analytics | null>(null);
  loading = signal<boolean>(true);

  private trendChartInstance: any;
  private pieChartInstance: any;

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizService.getAnalytics().subscribe({
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
    if (!a || a.totalAttempts === 0) return;

    if (this.trendCanvas && a.scoreTrend?.length > 0) {
      const labels = a.scoreTrend.map((t, idx) => `Test ${idx + 1}`);
      const data = a.scoreTrend.map(t => t.percentage);

      if (this.trendChartInstance) this.trendChartInstance.destroy();

      this.trendChartInstance = new Chart(this.trendCanvas.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Score %',
            data,
            borderColor: '#007BA7',
            backgroundColor: 'rgba(0, 123, 167, 0.15)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#FF2D95',
            pointBorderColor: '#FFFFFF',
            pointRadius: 5,
            pointHoverRadius: 7
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
              bodyColor: '#0099CC'
            }
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: { color: 'rgba(255,255,255,0.6)' }
            },
            x: {
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: { color: 'rgba(255,255,255,0.6)' }
            }
          }
        }
      });
    }

    if (this.pieCanvas) {
      if (this.pieChartInstance) this.pieChartInstance.destroy();

      const pass = a.passCount || 0;
      const fail = a.failCount || 0;

      this.pieChartInstance = new Chart(this.pieCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Passed', 'Needs Improvement'],
          datasets: [{
            data: [pass, fail],
            backgroundColor: ['#00E676', '#FF2D95'],
            borderWidth: 0,
            hoverOffset: 4
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
    if (this.trendChartInstance) this.trendChartInstance.destroy();
    if (this.pieChartInstance) this.pieChartInstance.destroy();
  }
}
