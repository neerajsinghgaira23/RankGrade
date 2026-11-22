import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { AttemptResult } from '../../../core/models/models';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, IconComponent, LoadingComponent],
  template: `
    <app-navbar />

    <main class="result-page">
      <div class="container">
        @if (loading()) {
          <app-loading label="Compiling assessment telemetry and grading breakdown..." [height]="'400px'" />
        } @else if (result(); as res) {
          <!-- Result Summary Banner -->
          <div class="summary-card card" [class.passed]="res.passed" [class.failed]="!res.passed">
            <div class="status-badge-wrap">
              <span class="status-pill" [class.pass]="res.passed" [class.fail]="!res.passed">
                <app-icon [name]="res.passed ? 'check-circle' : 'alert-circle'" [size]="16" />
                {{ res.passed ? 'PASSED ASSESSMENT' : 'NEEDS IMPROVEMENT' }}
              </span>
            </div>

            <h1 class="quiz-title">{{ res.quizTitle }}</h1>
            <p class="exam-date">
              <app-icon name="calendar" [size]="13" />
              Completed on {{ res.submittedAt | date:'medium' }}
            </p>

            <!-- Circular SVG Score Ring -->
            <div class="score-ring-wrap">
              <div class="score-gauge">
                <svg class="gauge-svg" viewBox="0 0 160 160">
                  <circle class="gauge-track" cx="80" cy="80" r="70" />
                  <circle
                    class="gauge-fill"
                    cx="80" cy="80" r="70"
                    [style.stroke-dashoffset]="calculateDashOffset(res.percentage)"
                    [class.fill-success]="res.passed"
                    [class.fill-fail]="!res.passed"
                  />
                </svg>
                <div class="gauge-text">
                  <span class="gauge-pct">{{ res.percentage | number:'1.0-1' }}%</span>
                  <span class="gauge-pts">{{ res.scoreObtained }} / {{ res.totalMarks }} Marks</span>
                </div>
              </div>
            </div>

            <!-- Metrics Breakdown Grid -->
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="mc-icon cerulean">
                  <app-icon name="clock" [size]="20" color="#0099CC" />
                </div>
                <div class="mc-body">
                  <span class="mc-val">{{ formatDuration(res.timeTakenSeconds) }}</span>
                  <span class="mc-lbl">Duration</span>
                </div>
              </div>

              <div class="metric-card">
                <div class="mc-icon green">
                  <app-icon name="check-circle" [size]="20" color="#00E676" />
                </div>
                <div class="mc-body">
                  <span class="mc-val text-success">{{ res.correctCount }}</span>
                  <span class="mc-lbl">Correct</span>
                </div>
              </div>

              <div class="metric-card">
                <div class="mc-icon rose">
                  <app-icon name="x-circle" [size]="20" color="#FF1744" />
                </div>
                <div class="mc-body">
                  <span class="mc-val text-danger">{{ res.wrongCount }}</span>
                  <span class="mc-lbl">Incorrect</span>
                </div>
              </div>

              <div class="metric-card">
                <div class="mc-icon gray">
                  <app-icon name="alert-circle" [size]="20" color="rgba(255,255,255,0.4)" />
                </div>
                <div class="mc-body">
                  <span class="mc-val">{{ res.unansweredCount }}</span>
                  <span class="mc-lbl">Skipped</span>
                </div>
              </div>

              <div class="metric-card">
                <div class="mc-icon cerulean-alt">
                  <app-icon name="target" [size]="20" color="#007BA7" />
                </div>
                <div class="mc-body">
                  <span class="mc-val text-cerulean">{{ calculateAccuracy(res) }}%</span>
                  <span class="mc-lbl">Accuracy</span>
                </div>
              </div>
            </div>

            <div class="actions-row">
              <a routerLink="/student/quizzes" class="btn btn-primary">
                <app-icon name="book-open" [size]="16" />
                Browse More Quizzes
              </a>
              <a routerLink="/student/history" class="btn btn-outline">
                <app-icon name="clock" [size]="16" />
                Attempt History
              </a>
              <button class="btn btn-ghost" (click)="printPage()">
                <app-icon name="download" [size]="16" />
                Print Transcript
              </button>
            </div>
          </div>

          <!-- Detailed Solution Key Section -->
          <section class="review-section">
            <div class="review-header">
              <div class="rh-left">
                <app-icon name="file-text" [size]="22" color="#0099CC" />
                <h2>Question-by-Question Solution Key</h2>
              </div>
              <span class="rh-badge">{{ res.answers.length }} Questions Evaluated</span>
            </div>

            @if (res.answers && res.answers.length > 0) {
              <div class="answers-stack">
                @for (ans of res.answers; let idx = $index; track ans.questionId) {
                  <div
                    class="answer-card card"
                    [class.ans-correct]="ans.correct"
                    [class.ans-wrong]="!ans.correct && ans.selectedOptionId"
                    [class.ans-skipped]="!ans.selectedOptionId"
                  >
                    <div class="ans-top-bar">
                      <span class="ans-number">Question {{ idx + 1 }}</span>
                      <span
                        class="badge"
                        [ngClass]="ans.correct ? 'badge-success' : (!ans.selectedOptionId ? 'badge-gray' : 'badge-error')"
                      >
                        {{ ans.correct ? 'Correct (+' + ans.marksAwarded + ' Marks)' : (ans.selectedOptionId ? 'Incorrect (0 Marks)' : 'Skipped (0 Marks)') }}
                      </span>
                    </div>

                    <h3 class="ans-question-text">{{ ans.questionText }}</h3>

                    <div class="ans-comparison-grid">
                      <div class="ans-box" [class.box-wrong]="!ans.correct && ans.selectedOptionId" [class.box-correct]="ans.correct">
                        <span class="ans-lbl">Your Submitted Choice:</span>
                        <div class="ans-val-row">
                          <app-icon
                            [name]="ans.correct ? 'check-circle' : (!ans.selectedOptionId ? 'alert-circle' : 'x-circle')"
                            [size]="16"
                            [color]="ans.correct ? '#00E676' : (!ans.selectedOptionId ? '#999' : '#FF1744')"
                          />
                          <span class="ans-val" [class.txt-success]="ans.correct" [class.txt-danger]="!ans.correct && ans.selectedOptionId">
                            {{ ans.selectedOptionText || 'No answer selected (Skipped)' }}
                          </span>
                        </div>
                      </div>

                      <div class="ans-box box-solution">
                        <span class="ans-lbl">Verified Correct Option:</span>
                        <div class="ans-val-row">
                          <app-icon name="check-circle" [size]="16" color="#00E676" />
                          <span class="ans-val txt-success">{{ ans.correctOptionText }}</span>
                        </div>
                      </div>
                    </div>

                    @if (ans.explanation) {
                      <div class="explanation-callout">
                        <div class="exp-title">
                          <app-icon name="help-circle" [size]="16" color="#0099CC" />
                          <span>Academic Rationale &amp; Explanation</span>
                        </div>
                        <p class="exp-text">{{ ans.explanation }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="empty-review card">
                <p>No itemized solution review is available for this attempt.</p>
              </div>
            }
          </section>
        }
      </div>
    </main>

    <app-footer />
  `,
  styles: [`
    .result-page {
      min-height: calc(100vh - 140px);
      padding: 36px 0 72px 0;
      background: #0A0A0A;
    }

    /* Summary Card */
    .summary-card {
      padding: 44px 32px;
      text-align: center;
      margin-bottom: 44px;
      border-radius: 24px;
      background: linear-gradient(180deg, #121212 0%, #0d0d0d 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
    }
    .summary-card.passed {
      border-color: rgba(0, 230, 118, 0.3);
      box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 35px rgba(0, 230, 118, 0.15);
    }
    .summary-card.failed {
      border-color: rgba(255, 45, 149, 0.3);
      box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 35px rgba(255, 45, 149, 0.15);
    }
    .status-badge-wrap { margin-bottom: 16px; }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 18px;
      border-radius: 50px;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .status-pill.pass {
      background: rgba(0, 230, 118, 0.12);
      border: 1px solid rgba(0, 230, 118, 0.35);
      color: #00E676;
    }
    .status-pill.fail {
      background: rgba(255, 45, 149, 0.12);
      border: 1px solid rgba(255, 45, 149, 0.35);
      color: #FF5AAE;
    }
    .quiz-title {
      font-size: clamp(1.8rem, 4vw, 2.4rem);
      font-weight: 800;
      margin-bottom: 8px;
    }
    .exam-date {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 28px;
    }

    /* Gauge Ring */
    .score-ring-wrap {
      display: flex;
      justify-content: center;
      margin-bottom: 36px;
    }
    .score-gauge {
      position: relative;
      width: 160px;
      height: 160px;
    }
    .gauge-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .gauge-track {
      fill: none;
      stroke: rgba(255, 255, 255, 0.08);
      stroke-width: 10;
    }
    .gauge-fill {
      fill: none;
      stroke-width: 10;
      stroke-linecap: round;
      stroke-dasharray: 440;
      transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .gauge-fill.fill-success { stroke: #00E676; filter: drop-shadow(0 0 8px rgba(0, 230, 118, 0.4)); }
    .gauge-fill.fill-fail { stroke: #FF2D95; filter: drop-shadow(0 0 8px rgba(255, 45, 149, 0.4)); }
    .gauge-text {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .gauge-pct {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.8rem;
      font-weight: 800;
      color: white;
    }
    .gauge-pts {
      font-size: 0.74rem;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 600;
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 14px;
      margin-bottom: 36px;
    }
    .metric-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 14px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .mc-icon {
      width: 42px; height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .mc-icon.cerulean { background: rgba(0, 123, 167, 0.12); }
    .mc-icon.cerulean-alt { background: rgba(0, 153, 204, 0.12); }
    .mc-icon.green { background: rgba(0, 230, 118, 0.12); }
    .mc-icon.rose { background: rgba(255, 23, 68, 0.12); }
    .mc-icon.gray { background: rgba(255, 255, 255, 0.05); }
    .mc-body {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }
    .mc-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.2rem;
      font-weight: 800;
      color: white;
    }
    .mc-lbl {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.45);
      letter-spacing: 0.05em;
    }
    .text-success { color: #00E676; }
    .text-danger { color: #FF1744; }
    .text-cerulean { color: #0099CC; }

    .actions-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Review Section */
    .review-section {
      max-width: 900px;
      margin: 0 auto;
    }
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .rh-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .rh-left h2 { font-size: 1.35rem; color: white; margin: 0; }
    .rh-badge {
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.04);
      padding: 4px 12px;
      border-radius: 50px;
    }

    .answers-stack {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .answer-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-left: 4px solid var(--border);
    }
    .answer-card.ans-correct {
      border-left-color: #00E676;
    }
    .answer-card.ans-wrong {
      border-left-color: #FF1744;
    }
    .answer-card.ans-skipped {
      border-left-color: #FFB300;
    }

    .ans-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ans-number {
      font-size: 0.82rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-gray {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .ans-question-text {
      font-size: 1.12rem;
      font-weight: 600;
      color: white;
      line-height: 1.45;
      margin: 0;
    }

    .ans-comparison-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 14px;
    }
    .ans-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ans-box.box-correct {
      background: rgba(0, 230, 118, 0.05);
      border-color: rgba(0, 230, 118, 0.2);
    }
    .ans-box.box-wrong {
      background: rgba(255, 23, 68, 0.05);
      border-color: rgba(255, 23, 68, 0.2);
    }
    .ans-box.box-solution {
      background: rgba(0, 123, 167, 0.05);
      border-color: rgba(0, 123, 167, 0.2);
    }
    .ans-lbl {
      font-size: 0.74rem;
      font-weight: 600;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.45);
      letter-spacing: 0.05em;
    }
    .ans-val-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ans-val {
      font-size: 0.94rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.85);
    }
    .txt-success { color: #00E676; }
    .txt-danger { color: #FF5370; }

    .explanation-callout {
      background: rgba(0, 123, 167, 0.06);
      border: 1px solid rgba(0, 123, 167, 0.2);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .exp-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      font-weight: 700;
      color: #0099CC;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .exp-text {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.55;
      margin: 0;
    }
    .empty-review { padding: 36px; text-align: center; color: rgba(255, 255, 255, 0.5); }

    @media print {
      .navbar, .footer, .actions-row { display: none !important; }
      .result-page { padding: 0; background: white; color: black; }
      .summary-card, .answer-card { background: white; color: black; border: 1px solid #ccc; box-shadow: none; }
    }
  `]
})
export class ResultComponent implements OnInit {
  result = signal<AttemptResult | null>(null);
  loading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const attemptId = Number(this.route.snapshot.paramMap.get('attemptId'));
    if (attemptId) {
      this.quizService.getResult(attemptId).subscribe({
        next: (data) => {
          this.result.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  formatDuration(seconds: number): string {
    if (!seconds && seconds !== 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  }

  calculateAccuracy(res: AttemptResult): number {
    const attempted = res.correctCount + res.wrongCount;
    if (attempted === 0) return 0;
    return Math.round((res.correctCount / attempted) * 100);
  }

  calculateDashOffset(percentage: number): number {
    const circum = 440; // 2 * pi * 70
    const pct = Math.max(0, Math.min(100, percentage || 0));
    return circum - (circum * pct) / 100;
  }

  printPage(): void {
    window.print();
  }
}
