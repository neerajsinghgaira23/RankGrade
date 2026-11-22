import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/services/auth.service';
import { Quiz, AttemptHistory, Analytics, ActiveAttempt, Category } from '../../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent, IconComponent, LoadingComponent],
  template: `
    <app-navbar />

    <main class="dashboard-page">
      <div class="container">
        <!-- Personalized Greeting Banner -->
        <div class="welcome-banner card card-glass">
          <div class="welcome-left">
            <div class="student-avatar-badge">
              <div class="avatar-circle">
                {{ userInitials() }}
              </div>
              <div class="welcome-meta">
                <div class="welcome-badge">
                  <img src="assets/images/rankgrade-icon.png" alt="RankGrade" style="width: 15px; height: 15px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0, 123, 167, 0.4));" />
                  <span>Student Learning Portal</span>
                  <span class="badge-dot"></span>
                  <span class="date-text">{{ todayFormatted }}</span>
                </div>
                <h1>
                  Welcome back,
                  <span class="text-gradient">{{ user()?.fullName || user()?.username || 'Learner' }}</span>!
                </h1>
                <p>
                  {{ motivationalQuote }}
                </p>
              </div>
            </div>
          </div>

          <div class="banner-cta">
            <a routerLink="/student/quizzes" class="btn btn-primary">
              <app-icon name="book-open" [size]="17" />
              Explore Catalog
            </a>
            <a routerLink="/student/analytics" class="btn btn-outline">
              <app-icon name="bar-chart" [size]="17" />
              View Telemetry
            </a>
          </div>
        </div>

        <!-- Global Loading State -->
        @if (loading()) {
          <app-loading label="Synchronizing assessment data with server..." [height]="'320px'" />
        } @else {
          <!-- Performance Overview KPI Cards -->
          <div class="kpi-grid">
            <div class="kpi-card card">
              <div class="kpi-icon-box cerulean">
                <app-icon name="clock" [size]="22" color="#0099CC" />
              </div>
              <div class="kpi-data">
                <span class="kpi-label">Total Attempts</span>
                <span class="kpi-value">{{ analytics()?.totalAttempts ?? 0 }}</span>
                <span class="kpi-sub">Lifetime evaluations completed</span>
              </div>
            </div>

            <div class="kpi-card card">
              <div class="kpi-icon-box rose">
                <app-icon name="target" [size]="22" color="#FF2D95" />
              </div>
              <div class="kpi-data">
                <span class="kpi-label">Pass Rate</span>
                <span class="kpi-value text-rose">
                  {{ analytics()?.passRate ? (analytics()?.passRate | number:'1.0-1') + '%' : '0%' }}
                </span>
                <span class="kpi-sub">{{ analytics()?.passCount ?? 0 }} passed / {{ analytics()?.failCount ?? 0 }} failed</span>
              </div>
            </div>

            <div class="kpi-card card">
              <div class="kpi-icon-box cerulean-alt">
                <app-icon name="bar-chart" [size]="22" color="#007BA7" />
              </div>
              <div class="kpi-data">
                <span class="kpi-label">Average Score</span>
                <span class="kpi-value text-cerulean">
                  {{ analytics()?.averagePercentage ? (analytics()?.averagePercentage | number:'1.0-1') + '%' : '0%' }}
                </span>
                <span class="kpi-sub">Across all submitted quizzes</span>
              </div>
            </div>

            <div class="kpi-card card">
              <div class="kpi-icon-box green">
                <app-icon name="award" [size]="22" color="#00E676" />
              </div>
              <div class="kpi-data">
                <span class="kpi-label">Personal Best</span>
                <span class="kpi-value text-success">
                  {{ analytics()?.bestPercentage ? (analytics()?.bestPercentage | number:'1.0-1') + '%' : '0%' }}
                </span>
                <span class="kpi-sub">Highest recorded percentage</span>
              </div>
            </div>
          </div>

          <!-- Section C: Continue Learning (Active / Resumable Attempts) -->
          @if (activeAttempts().length > 0) {
            <section class="active-attempts-section">
              <div class="section-title-bar">
                <div class="st-left">
                  <div class="pulse-indicator"></div>
                  <h2>Continue Learning (Active Attempts)</h2>
                </div>
                <span class="active-count-tag">{{ activeAttempts().length }} In Progress</span>
              </div>

              <div class="active-attempts-grid">
                @for (att of activeAttempts(); track att.attemptId) {
                  <div class="active-card card">
                    <div class="ac-top">
                      <span class="badge badge-warning">
                        <app-icon name="clock" [size]="12" />
                        In Progress
                      </span>
                      <span class="ac-category">{{ att.categoryName }}</span>
                    </div>

                    <h3 class="ac-title">{{ att.quizTitle }}</h3>

                    <!-- Saved Progress Bar -->
                    <div class="progress-wrap">
                      <div class="progress-labels">
                        <span>Answer Progress</span>
                        <span>{{ att.answeredCount }} / {{ att.totalQuestions }} Answered</span>
                      </div>
                      <div class="progress-bar-bg">
                        <div
                          class="progress-bar-fill"
                          [style.width.%]="att.totalQuestions > 0 ? (att.answeredCount / att.totalQuestions * 100) : 0"
                        ></div>
                      </div>
                    </div>

                    <div class="ac-footer">
                      <div class="ac-time">
                        <app-icon name="clock" [size]="14" color="#0099CC" />
                        <span>{{ formatSeconds(att.remainingSeconds) }} remaining</span>
                      </div>
                      <a [routerLink]="['/student/exam', att.quizId]" class="btn btn-rose btn-sm">
                        <app-icon name="play" [size]="13" />
                        Resume Quiz
                      </a>
                    </div>
                  </div>
                }
              </div>
            </section>
          }

          <!-- Section E: Recommended For You -->
          @if (recommendedQuizzes().length > 0) {
            <section class="recommendations-section">
              <div class="rec-banner card">
                <div class="rec-header">
                  <div class="rec-header-left">
                    <div class="rec-icon-box">
                      <app-icon name="sparkles" [size]="20" color="#FFB300" />
                    </div>
                    <div>
                      <h3>Recommended For You</h3>
                      <p>Personalized suggestions based on your evaluation performance and curriculum gaps.</p>
                    </div>
                  </div>
                </div>

                <div class="rec-cards-grid">
                  @for (rec of recommendedQuizzes(); track rec.quiz.id) {
                    <div class="rec-card card">
                      <div class="rec-card-reason">
                        <app-icon name="target" [size]="13" color="#FF2D95" />
                        <span>{{ rec.reason }}</span>
                      </div>
                      <h4 class="rec-title">{{ rec.quiz.title }}</h4>
                      <p class="rec-desc">{{ rec.quiz.description || 'Targeted assessment to strengthen your mastery.' }}</p>
                      <div class="rec-card-meta">
                        <span>{{ rec.quiz.questionCount }} Questions</span>
                        <span>•</span>
                        <span>{{ rec.quiz.timeLimitMinutes }} Mins</span>
                        <span>•</span>
                        <span>{{ rec.quiz.totalMarks }} Marks</span>
                      </div>
                      <a [routerLink]="['/student/quizzes', rec.quiz.id]" class="btn btn-outline btn-sm mt-2">
                        Start Assessment
                        <app-icon name="arrow-right" [size]="13" />
                      </a>
                    </div>
                  }
                </div>
              </div>
            </section>
          }

          <!-- Main Dashboard Split: Available Quizzes & Recent Attempts -->
          <div class="dashboard-grid">
            <!-- Left Column: Available Quizzes (Section D - Priority) -->
            <section class="dash-column">
              <div class="column-header">
                <div class="ch-left">
                  <app-icon name="book-open" [size]="20" color="#0099CC" />
                  <h2>Available Assessments</h2>
                </div>
                <button class="btn btn-ghost btn-sm" (click)="refreshQuizzes()" title="Refresh quizzes from server">
                  <app-icon name="refresh-cw" [size]="14" />
                  Refresh
                </button>
              </div>

              <!-- Filter & Search Toolbar -->
              <div class="quiz-filter-bar card">
                <div class="search-input-wrap">
                  <app-icon name="search" [size]="15" class="search-ico" />
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Search quizzes by title or topic..."
                    [(ngModel)]="searchQuery"
                    (input)="applyFilters()"
                  />
                </div>

                <div class="filter-controls">
                  <select
                    class="form-control form-control-sm select-cat"
                    [(ngModel)]="selectedCategory"
                    (change)="applyFilters()"
                  >
                    <option value="">All Categories</option>
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.name">{{ cat.name }}</option>
                    }
                  </select>

                  <select
                    class="form-control form-control-sm select-sort"
                    [(ngModel)]="sortBy"
                    (change)="applyFilters()"
                  >
                    <option value="newest">Newest First</option>
                    <option value="duration">Duration (Low-High)</option>
                    <option value="marks">Marks (High-Low)</option>
                    <option value="title">Title (A-Z)</option>
                  </select>

                  @if (searchQuery || selectedCategory) {
                    <button class="btn btn-ghost btn-sm clear-btn" (click)="clearFilters()">
                      <app-icon name="x" [size]="14" />
                      Clear
                    </button>
                  }
                </div>
              </div>

              <!-- Available Quizzes List -->
              @if (filteredQuizzes().length > 0) {
                <div class="quiz-stack">
                  @for (q of filteredQuizzes(); track q.id) {
                    <div class="quiz-card card">
                      <div class="quiz-card-top">
                        <span class="badge badge-cerulean">{{ q.categoryName || 'General' }}</span>
                        <div class="quiz-timer-pill">
                          <app-icon name="clock" [size]="13" color="rgba(255,255,255,0.7)" />
                          <span>{{ q.timeLimitMinutes }} Mins</span>
                        </div>
                      </div>

                      <h3>{{ q.title }}</h3>
                      <p class="quiz-description">
                        {{ q.description || 'Comprehensive evaluation designed to test foundational and practical knowledge.' }}
                      </p>

                      <div class="quiz-card-bottom">
                        <div class="quiz-specs">
                          <span class="spec-item">
                            <app-icon name="layers" [size]="14" />
                            {{ q.questionCount }} Questions
                          </span>
                          <span class="spec-divider">•</span>
                          <span class="spec-item">
                            <app-icon name="target" [size]="14" />
                            {{ q.totalMarks }} Marks
                          </span>
                          @if (q.passingMarks) {
                            <span class="spec-divider">•</span>
                            <span class="spec-item pass-thresh">
                              Pass: {{ q.passingMarks }}m
                            </span>
                          }
                        </div>
                        <a [routerLink]="['/student/quizzes', q.id]" class="btn btn-primary btn-sm">
                          Start Quiz
                          <app-icon name="arrow-right" [size]="14" />
                        </a>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state card">
                  <app-icon name="book" [size]="36" color="rgba(255,255,255,0.2)" />
                  <h4>{{ searchQuery || selectedCategory ? 'No Matching Quizzes Found' : 'No Quizzes Published Yet' }}</h4>
                  <p>
                    {{ searchQuery || selectedCategory
                      ? 'Try clearing your search query or choosing another category.'
                      : 'Administrators have not published active quizzes yet. Please check back shortly.' }}
                  </p>
                  @if (searchQuery || selectedCategory) {
                    <button class="btn btn-outline btn-sm mt-2" (click)="clearFilters()">
                      Reset Filter
                    </button>
                  }
                </div>
              }
            </section>

            <!-- Right Column: Recent Activity (Section F) -->
            <section class="dash-column">
              <div class="column-header">
                <div class="ch-left">
                  <app-icon name="clock" [size]="20" color="#FF2D95" />
                  <h2>Recent Activity</h2>
                </div>
                <a routerLink="/student/history" class="ch-link">
                  Full History
                  <app-icon name="arrow-right" [size]="14" />
                </a>
              </div>

              @if (recentAttempts().length > 0) {
                <div class="attempts-stack">
                  @for (a of recentAttempts().slice(0, 5); track a.attemptId) {
                    <div class="attempt-item card">
                      <div class="attempt-primary">
                        <h4>{{ a.quizTitle }}</h4>
                        <span class="attempt-timestamp">
                          <app-icon name="clock" [size]="12" />
                          {{ a.submittedAt | date:'mediumDate' }}
                        </span>
                      </div>

                      <div class="attempt-secondary">
                        <span class="badge" [ngClass]="a.passed ? 'badge-success' : 'badge-error'">
                          {{ a.passed ? 'PASSED' : 'FAILED' }}
                        </span>
                        <div class="attempt-score-box">
                          <span class="score-ratio">{{ a.score }} / {{ a.totalMarks }}</span>
                          <span class="score-pct">({{ a.percentage | number:'1.0-0' }}%)</span>
                        </div>
                        <a [routerLink]="['/student/result', a.attemptId]" class="btn btn-ghost btn-sm">
                          Review
                          <app-icon name="arrow-right" [size]="13" />
                        </a>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state card">
                  <app-icon name="award" [size]="36" color="rgba(255,255,255,0.2)" />
                  <h4>No Exam History Yet</h4>
                  <p>You haven't completed any quizzes yet. Pick an assessment on the left to start building your telemetry.</p>
                  <a routerLink="/student/quizzes" class="btn btn-primary btn-sm mt-2">
                    Browse Quizzes
                  </a>
                </div>
              }

              <!-- Analytics Teaser Card -->
              <div class="telemetry-teaser-card card mt-4">
                <div class="tt-left">
                  <div class="tt-icon">
                    <app-icon name="bar-chart" [size]="20" color="#0099CC" />
                  </div>
                  <div>
                    <h4>Performance Analytics</h4>
                    <p>Track your score progression and accuracy breakdowns over time.</p>
                  </div>
                </div>
                <a routerLink="/student/analytics" class="btn btn-outline btn-sm">
                  View Charts
                  <app-icon name="arrow-right" [size]="13" />
                </a>
              </div>
            </section>
          </div>
        }
      </div>
    </main>

    <app-footer />
  `,
  styles: [`
    .dashboard-page {
      min-height: calc(100vh - 140px);
      padding: 36px 0 72px 0;
      background: #0A0A0A;
    }

    /* Welcome Banner */
    .welcome-banner {
      padding: 32px 36px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;
      background: linear-gradient(135deg, rgba(0, 123, 167, 0.08), rgba(255, 45, 149, 0.06));
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
    }
    .student-avatar-badge {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .avatar-circle {
      width: 58px;
      height: 58px;
      border-radius: 16px;
      background: linear-gradient(135deg, #007BA7, #FF2D95);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      font-weight: 800;
      color: white;
      box-shadow: 0 8px 24px rgba(0, 123, 167, 0.35);
      flex-shrink: 0;
    }
    .welcome-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0099CC;
      background: rgba(0, 123, 167, 0.1);
      padding: 4px 12px;
      border-radius: 50px;
      border: 1px solid rgba(0, 123, 167, 0.25);
      margin-bottom: 8px;
    }
    .badge-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
    }
    .date-text {
      color: rgba(255, 255, 255, 0.55);
      font-weight: 500;
    }
    .welcome-meta h1 {
      font-size: clamp(1.6rem, 3.2vw, 2.1rem);
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 6px;
    }
    .welcome-meta p {
      color: rgba(255, 255, 255, 0.62);
      font-size: 0.92rem;
      max-width: 580px;
      margin: 0;
    }
    .banner-cta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }
    .kpi-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 22px;
    }
    .kpi-icon-box {
      width: 50px; height: 50px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .kpi-icon-box.cerulean {
      background: rgba(0, 123, 167, 0.15);
      border: 1px solid rgba(0, 123, 167, 0.3);
    }
    .kpi-icon-box.rose {
      background: rgba(255, 45, 149, 0.15);
      border: 1px solid rgba(255, 45, 149, 0.3);
    }
    .kpi-icon-box.cerulean-alt {
      background: rgba(0, 153, 204, 0.15);
      border: 1px solid rgba(0, 153, 204, 0.3);
    }
    .kpi-icon-box.green {
      background: rgba(0, 230, 118, 0.15);
      border: 1px solid rgba(0, 230, 118, 0.3);
    }
    .kpi-data {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .kpi-label {
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.5);
    }
    .kpi-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.65rem;
      font-weight: 800;
      color: white;
      line-height: 1.15;
    }
    .kpi-sub {
      font-size: 0.74rem;
      color: rgba(255, 255, 255, 0.45);
    }
    .text-cerulean { color: #0099CC; }
    .text-rose { color: #FF2D95; }
    .text-success { color: #00E676; }

    /* Active Attempts (Section C) */
    .active-attempts-section {
      margin-bottom: 28px;
    }
    .section-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .st-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .st-left h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      margin: 0;
    }
    .pulse-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #FF2D95;
      box-shadow: 0 0 10px #FF2D95;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }
    .active-count-tag {
      font-size: 0.78rem;
      font-weight: 600;
      color: #FF2D95;
      background: rgba(255, 45, 149, 0.12);
      border: 1px solid rgba(255, 45, 149, 0.25);
      padding: 3px 10px;
      border-radius: 50px;
    }
    .active-attempts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .active-card {
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      border: 1px solid rgba(255, 45, 149, 0.3);
      background: linear-gradient(135deg, rgba(255, 45, 149, 0.05), transparent);
    }
    .ac-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ac-category {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.5);
    }
    .ac-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: white;
      margin: 0;
    }
    .progress-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.6);
    }
    .progress-bar-bg {
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #007BA7, #FF2D95);
      border-radius: 999px;
      transition: width 0.3s;
    }
    .ac-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .ac-time {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.65);
      font-family: 'Space Grotesk', monospace;
    }

    /* Recommendations (Section E) */
    .recommendations-section {
      margin-bottom: 28px;
    }
    .rec-banner {
      padding: 24px;
      background: rgba(255, 179, 0, 0.03);
      border: 1px solid rgba(255, 179, 0, 0.2);
    }
    .rec-header {
      margin-bottom: 18px;
    }
    .rec-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .rec-icon-box {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: rgba(255, 179, 0, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .rec-header-left h3 {
      font-size: 1.1rem;
      color: #FFB300;
      margin: 0 0 2px 0;
    }
    .rec-header-left p {
      font-size: 0.84rem;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
    }
    .rec-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .rec-card {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.06);
    }
    .rec-card-reason {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.74rem;
      color: #FF5AAE;
      font-weight: 600;
    }
    .rec-title {
      font-size: 1rem;
      font-weight: 700;
      color: white;
      margin: 0;
    }
    .rec-desc {
      font-size: 0.82rem;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0;
      flex: 1;
    }
    .rec-card-meta {
      display: flex;
      gap: 6px;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.45);
    }

    /* Dashboard Layout Split */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
      gap: 28px;
    }
    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .ch-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ch-left h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      margin: 0;
    }
    .ch-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #0099CC;
    }
    .ch-link:hover { color: #FF2D95; }

    /* Filter Toolbar (Section D) */
    .quiz-filter-bar {
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }
    .search-input-wrap {
      position: relative;
      flex: 1;
      min-width: 200px;
    }
    .search-input-wrap .search-ico {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.4);
      pointer-events: none;
    }
    .search-input-wrap .form-control {
      padding-left: 36px;
    }
    .filter-controls {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .select-cat {
      min-width: 130px;
    }
    .select-sort {
      min-width: 140px;
    }
    .clear-btn {
      color: rgba(255, 255, 255, 0.6);
      padding: 4px 8px;
    }

    /* Quiz Cards Stack */
    .quiz-stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .quiz-card {
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;
    }
    .quiz-card:hover {
      transform: translateY(-2px);
      border-color: rgba(0, 123, 167, 0.35);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
    }
    .quiz-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .quiz-timer-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.65);
      background: rgba(255, 255, 255, 0.04);
      padding: 3px 10px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .quiz-card h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: white;
      margin: 0;
    }
    .quiz-description {
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0;
    }
    .quiz-card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .quiz-specs {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .spec-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
    }
    .spec-divider { color: rgba(255, 255, 255, 0.2); }
    .pass-thresh { color: #00E676; font-size: 0.78rem; }

    /* Attempts Stack */
    .attempts-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .attempt-item {
      padding: 16px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
    }
    .attempt-primary h4 {
      font-size: 0.94rem;
      font-weight: 600;
      color: white;
      margin: 0 0 4px 0;
    }
    .attempt-timestamp {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.76rem;
      color: rgba(255, 255, 255, 0.45);
    }
    .attempt-secondary {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .attempt-score-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .score-ratio {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.92rem;
      font-weight: 700;
      color: white;
    }
    .score-pct {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
    }

    /* Telemetry Teaser */
    .telemetry-teaser-card {
      padding: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      background: linear-gradient(135deg, rgba(0, 123, 167, 0.1), transparent);
    }
    .tt-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tt-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: rgba(0, 123, 167, 0.15);
      border: 1px solid rgba(0, 123, 167, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tt-left h4 {
      font-size: 0.95rem;
      color: white;
      margin: 0 0 2px 0;
    }
    .tt-left p {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.55);
      margin: 0;
    }

    /* Empty state */
    .empty-state {
      padding: 40px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
    }
    .empty-state h4 { font-size: 1.05rem; color: white; margin: 0; }
    .empty-state p { font-size: 0.86rem; color: rgba(255, 255, 255, 0.5); max-width: 340px; margin: 0; }

    .mt-4 { margin-top: 20px; }

    @media (max-width: 992px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .welcome-banner { padding: 24px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 576px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .student-avatar-badge { flex-direction: column; align-items: flex-start; }
      .attempt-item { flex-direction: column; align-items: flex-start; }
      .attempt-secondary { width: 100%; justify-content: space-between; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private quizService = inject(QuizService);

  user = this.auth.user;
  quizzes = signal<Quiz[]>([]);
  categories = signal<Category[]>([]);
  activeAttempts = signal<ActiveAttempt[]>([]);
  recentAttempts = signal<AttemptHistory[]>([]);
  analytics = signal<Analytics | null>(null);
  loading = signal<boolean>(true);

  // Filters for available quizzes
  searchQuery = '';
  selectedCategory = '';
  sortBy: 'newest' | 'duration' | 'marks' | 'title' = 'newest';

  // Quotes for header
  motivationalQuote = 'Track your diagnostic accuracy, tackle curriculum domains, and build continuous learning streaks.';

  get todayFormatted(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  userInitials = computed(() => {
    const u = this.user();
    const name = u?.fullName || u?.username || 'S';
    return name.charAt(0).toUpperCase();
  });

  // Filtered & sorted quizzes signal
  filteredQuizzes = computed(() => {
    let list = [...this.quizzes()];

    // Search query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(quiz =>
        quiz.title.toLowerCase().includes(q) ||
        (quiz.description && quiz.description.toLowerCase().includes(q)) ||
        (quiz.categoryName && quiz.categoryName.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (this.selectedCategory) {
      list = list.filter(quiz => quiz.categoryName === this.selectedCategory);
    }

    // Sorting
    switch (this.sortBy) {
      case 'duration':
        list.sort((a, b) => a.timeLimitMinutes - b.timeLimitMinutes);
        break;
      case 'marks':
        list.sort((a, b) => b.totalMarks - a.totalMarks);
        break;
      case 'title':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        list.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
    }

    return list;
  });

  // Recommended Quizzes based on actual student history
  recommendedQuizzes = computed(() => {
    const all = this.quizzes();
    const history = this.recentAttempts();
    if (all.length === 0) return [];

    const recs: { quiz: Quiz; reason: string }[] = [];
    const attemptedQuizIds = new Set(history.map(h => h.quizId));

    // 1. Quizzes student failed in
    const failedQuizIds = new Set(history.filter(h => !h.passed).map(h => h.quizId));
    all.forEach(q => {
      if (failedQuizIds.has(q.id) && recs.length < 3) {
        recs.push({
          quiz: q,
          reason: 'Recommended for revision to raise your pass rate'
        });
      }
    });

    // 2. Unattempted quizzes in relevant categories
    all.forEach(q => {
      if (!attemptedQuizIds.has(q.id) && !recs.some(r => r.quiz.id === q.id) && recs.length < 3) {
        recs.push({
          quiz: q,
          reason: 'Unattempted curriculum topic'
        });
      }
    });

    // 3. Fallback to newest available if none
    if (recs.length === 0 && all.length > 0) {
      recs.push({
        quiz: all[0],
        reason: 'Recommended assessment to calibrate your performance'
      });
    }

    return recs.slice(0, 3);
  });

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.loading.set(true);
    let loadedCount = 0;
    const checkDone = () => {
      loadedCount++;
      if (loadedCount >= 5) {
        this.loading.set(false);
      }
    };

    // 1. Published Quizzes
    this.quizService.getPublishedQuizzes().subscribe({
      next: (q) => {
        this.quizzes.set(q || []);
        checkDone();
      },
      error: () => checkDone()
    });

    // 2. Categories
    this.quizService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats || []);
        checkDone();
      },
      error: () => checkDone()
    });

    // 3. Active / In-progress Attempts
    this.quizService.getActiveAttempts().subscribe({
      next: (acts) => {
        this.activeAttempts.set(acts || []);
        checkDone();
      },
      error: () => checkDone()
    });

    // 4. Completed History
    this.quizService.getHistory().subscribe({
      next: (hist) => {
        this.recentAttempts.set(hist || []);
        checkDone();
      },
      error: () => checkDone()
    });

    // 5. Analytics
    this.quizService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics.set(data || null);
        checkDone();
      },
      error: () => checkDone()
    });
  }

  refreshQuizzes(): void {
    this.quizService.getPublishedQuizzes().subscribe({
      next: (q) => this.quizzes.set(q || []),
      error: () => {}
    });
  }

  applyFilters(): void {
    // Computed signal updates reactively
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.sortBy = 'newest';
  }

  formatSeconds(sec: number): string {
    if (!sec || sec <= 0) return '0m';
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  }
}

