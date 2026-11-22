import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz } from '../../../core/models/models';

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, IconComponent, LoadingComponent],
  template: `
    <app-navbar />

    <main class="quiz-detail-page">
      <div class="container">
        <div class="back-nav">
          <a routerLink="/student/quizzes" class="back-link">
            <app-icon name="arrow-left" [size]="15" />
            Back to Assessment Catalogue
          </a>
        </div>

        @if (loading()) {
          <app-loading label="Loading assessment specifications..." [height]="'380px'" />
        } @else if (quiz(); as q) {
          <div class="detail-card card">
            <div class="detail-header">
              <span class="badge badge-cerulean">{{ q.categoryName || 'General Assessment' }}</span>
              <div class="time-limit">
                <app-icon name="clock" [size]="15" color="#0099CC" />
                <span>Duration: <strong>{{ q.timeLimitMinutes }} Mins</strong></span>
              </div>
            </div>

            <h1 class="quiz-title">{{ q.title }}</h1>
            <p class="quiz-desc">
              {{ q.description || 'This curriculum assessment evaluates fundamental paradigms, problem-solving, and practical technical application.' }}
            </p>

            <div class="quiz-specs-grid">
              <div class="spec-card">
                <div class="spec-icon-wrap cerulean">
                  <app-icon name="layers" [size]="20" color="#0099CC" />
                </div>
                <span class="spec-val">{{ q.questionCount }}</span>
                <span class="spec-lbl">Questions</span>
              </div>

              <div class="spec-card">
                <div class="spec-icon-wrap cerulean-alt">
                  <app-icon name="award" [size]="20" color="#007BA7" />
                </div>
                <span class="spec-val text-cerulean">{{ q.totalMarks }}</span>
                <span class="spec-lbl">Total Marks</span>
              </div>

              <div class="spec-card">
                <div class="spec-icon-wrap rose">
                  <app-icon name="target" [size]="20" color="#FF2D95" />
                </div>
                <span class="spec-val text-rose">{{ q.passingMarks ?? 40 }}%</span>
                <span class="spec-lbl">Passing Score</span>
              </div>

              <div class="spec-card">
                <div class="spec-icon-wrap green">
                  <app-icon name="refresh-cw" [size]="20" color="#00E676" />
                </div>
                <span class="spec-val text-success">{{ q.maxAttempts === 0 ? 'Unlimited' : q.maxAttempts }}</span>
                <span class="spec-lbl">Max Attempts</span>
              </div>
            </div>

            <div class="instructions-section">
              <div class="inst-header">
                <app-icon name="shield" [size]="18" color="#0099CC" />
                <h3>Examination Rules &amp; Protocol</h3>
              </div>
              <ul class="rules-list">
                <li>
                  <strong>Synchronized Countdown Timer:</strong> Once you begin, the countdown clock starts on the server.
                </li>
                <li>
                  <strong>Incremental Autosave:</strong> Each answer you select is saved asynchronously to the database.
                </li>
                <li>
                  <strong>Question Palette Navigation:</strong> You can jump freely between questions and flag items for review.
                </li>
                <li>
                  <strong>Zero Answer Leakage:</strong> Solution keys and explanations are encrypted and held on the server until submission.
                </li>
                <li>
                  <strong>Automated Submission:</strong> If the timer reaches 00:00, your exam will be automatically evaluated.
                </li>
              </ul>
            </div>

            <div class="action-footer">
              <button class="btn btn-primary btn-lg" (click)="startQuiz()">
                <app-icon name="play" [size]="18" />
                Begin Assessment Now
              </button>
            </div>
          </div>
        }
      </div>
    </main>

    <app-footer />
  `,
  styles: [`
    .quiz-detail-page {
      min-height: calc(100vh - 140px);
      padding: 36px 0 72px 0;
      background: #0A0A0A;
    }
    .back-nav { margin-bottom: 24px; }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      transition: color 0.2s, transform 0.2s;
    }
    .back-link:hover {
      color: #0099CC;
      transform: translateX(-3px);
    }
    .detail-card {
      padding: 44px;
      max-width: 860px;
      margin: 0 auto;
      border-radius: 20px;
    }
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .time-limit {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.92rem;
    }
    .time-limit strong { color: white; }
    .quiz-title {
      font-size: clamp(1.8rem, 4vw, 2.4rem);
      font-weight: 800;
      margin-bottom: 12px;
      line-height: 1.2;
    }
    .quiz-desc {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.65);
      line-height: 1.65;
      margin-bottom: 32px;
    }
    .quiz-specs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 36px;
    }
    .spec-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 4px;
    }
    .spec-icon-wrap {
      width: 42px; height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;
    }
    .spec-icon-wrap.cerulean { background: rgba(0, 123, 167, 0.12); }
    .spec-icon-wrap.cerulean-alt { background: rgba(0, 153, 204, 0.12); }
    .spec-icon-wrap.rose { background: rgba(255, 45, 149, 0.12); }
    .spec-icon-wrap.green { background: rgba(0, 230, 118, 0.12); }

    .spec-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.45rem;
      font-weight: 800;
      color: white;
    }
    .text-cerulean { color: #0099CC; }
    .text-rose { color: #FF2D95; }
    .text-success { color: #00E676; }
    .spec-lbl {
      font-size: 0.74rem;
      color: rgba(255, 255, 255, 0.45);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .instructions-section {
      background: rgba(0, 123, 167, 0.05);
      border: 1px solid rgba(0, 123, 167, 0.2);
      border-radius: 16px;
      padding: 24px 28px;
      margin-bottom: 36px;
    }
    .inst-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .inst-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0099CC;
      margin: 0;
    }
    .rules-list {
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: rgba(255, 255, 255, 0.72);
      font-size: 0.92rem;
      line-height: 1.6;
    }
    .rules-list strong { color: white; }

    .action-footer {
      display: flex;
      justify-content: center;
    }
    @media (max-width: 600px) {
      .detail-card { padding: 24px; }
      .quiz-specs-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class QuizDetailComponent implements OnInit {
  quiz = signal<Quiz | null>(null);
  loading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.quizService.getPublishedQuiz(id).subscribe({
        next: (q) => {
          this.quiz.set(q);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/student/quizzes']);
        }
      });
    } else {
      this.loading.set(false);
      this.router.navigate(['/student/quizzes']);
    }
  }

  startQuiz(): void {
    const q = this.quiz();
    if (q) {
      this.router.navigate(['/student/exam', q.id]);
    }
  }
}
