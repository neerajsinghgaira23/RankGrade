import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz, Category } from '../../../core/models/models';

@Component({
  selector: 'app-quiz-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, FooterComponent, IconComponent, LoadingComponent],
  template: `
    <app-navbar />

    <main class="catalog-page">
      <div class="container">
        <!-- Catalog Header -->
        <div class="catalog-header">
          <div class="catalog-tag">
            <app-icon name="book-open" [size]="14" color="#0099CC" />
            <span>Curriculum &amp; Certification Assessments</span>
          </div>
          <h1>Explore Assessment <span class="text-gradient">Catalogue</span></h1>
          <p>Sharpen your technical knowledge with computer-based timed assessments and deep performance analytics.</p>
        </div>

        <!-- Filter Controls Bar -->
        <div class="controls-panel card card-glass">
          <div class="controls-top">
            <div class="search-field">
              <app-icon name="search" [size]="18" color="rgba(255,255,255,0.4)" customClass="search-icon" />
              <input
                type="text"
                class="form-control search-input"
                placeholder="Search assessments by title, domain, or concepts..."
                [(ngModel)]="searchQuery"
                (input)="applyFilters()"
              />
              @if (searchQuery) {
                <button class="clear-search-btn" (click)="searchQuery = ''; applyFilters()" title="Clear search">
                  <app-icon name="x" [size]="14" />
                </button>
              }
            </div>

            <!-- Sort Selector -->
            <div class="sort-selector">
              <app-icon name="filter" [size]="16" color="#0099CC" />
              <select class="sort-select" [(ngModel)]="sortBy" (change)="applyFilters()">
                <option value="default">Sort: Default</option>
                <option value="duration-asc">Duration (Short to Long)</option>
                <option value="duration-desc">Duration (Long to Short)</option>
                <option value="marks-desc">Total Marks (Highest)</option>
                <option value="title-asc">Title (A - Z)</option>
              </select>
            </div>
          </div>

          <!-- Category Filter Pills -->
          <div class="category-pills">
            <button
              class="pill-btn"
              [class.active]="selectedCategory === null"
              (click)="selectCategory(null)"
            >
              <app-icon name="layers" [size]="14" />
              All Categories ({{ quizzes.length }})
            </button>
            @for (cat of categories; track cat.id) {
              <button
                class="pill-btn"
                [class.active]="selectedCategory === cat.id"
                (click)="selectCategory(cat.id)"
              >
                {{ cat.name }}
              </button>
            }
          </div>
        </div>

        <!-- Loading State -->
        @if (loading) {
          <app-loading label="Loading published assessments..." [height]="'320px'" />
        } @else {
          <!-- Filter Summary & Results Count -->
          <div class="results-meta">
            <span class="count-text">
              Showing <strong>{{ filteredQuizzes.length }}</strong> of <strong>{{ quizzes.length }}</strong> published quizzes
            </span>
            @if (searchQuery || selectedCategory !== null) {
              <button class="reset-filters-btn" (click)="resetFilters()">
                <app-icon name="rotate-ccw" [size]="13" />
                Reset Filters
              </button>
            }
          </div>

          <!-- Quiz Grid -->
          @if (filteredQuizzes.length > 0) {
            <div class="quiz-grid">
              @for (q of filteredQuizzes; track q.id) {
                <div class="quiz-card card">
                  <div class="card-badge-row">
                    <span class="badge badge-cerulean">{{ q.categoryName || 'Technical' }}</span>
                    <div class="time-tag">
                      <app-icon name="clock" [size]="13" color="rgba(255,255,255,0.7)" />
                      <span>{{ q.timeLimitMinutes }} Mins</span>
                    </div>
                  </div>

                  <h3 class="card-title">{{ q.title }}</h3>
                  <p class="card-desc">
                    {{ q.description || 'Comprehensive evaluation designed to test foundational and practical proficiency.' }}
                  </p>

                  <div class="card-metrics-grid">
                    <div class="meta-item">
                      <span class="meta-label">Questions</span>
                      <span class="meta-val">{{ q.questionCount }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Total Marks</span>
                      <span class="meta-val text-cerulean">{{ q.totalMarks }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Passing</span>
                      <span class="meta-val text-rose">{{ q.passingMarks ?? '40%' }}</span>
                    </div>
                  </div>

                  <div class="card-actions">
                    <a [routerLink]="['/student/quizzes', q.id]" class="btn btn-outline btn-sm action-btn">
                      Syllabus
                    </a>
                    <a [routerLink]="['/student/exam', q.id]" class="btn btn-primary btn-sm action-btn">
                      <app-icon name="play" [size]="13" />
                      Start Exam
                    </a>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-box card">
              <div class="empty-icon-wrap">
                <app-icon name="search" [size]="36" color="rgba(255,255,255,0.3)" />
              </div>
              <h3>No Matching Assessments</h3>
              <p>We couldn't find any quiz matching your filter criteria. Try clearing your search keyword.</p>
              <button class="btn btn-outline btn-sm mt-2" (click)="resetFilters()">
                Clear All Filters
              </button>
            </div>
          }
        }
      </div>
    </main>

    <app-footer />
  `,
  styles: [`
    .catalog-page {
      min-height: calc(100vh - 140px);
      padding: 36px 0 72px 0;
      background: #0A0A0A;
    }
    .catalog-header {
      margin-bottom: 32px;
      text-align: center;
    }
    .catalog-tag {
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
    .catalog-header h1 {
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 800;
      margin-bottom: 10px;
    }
    .catalog-header p {
      color: rgba(255, 255, 255, 0.6);
      max-width: 620px;
      margin: 0 auto;
      font-size: 1rem;
    }

    /* Controls Panel */
    .controls-panel {
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      border-radius: 18px;
    }
    .controls-top {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .search-field {
      position: relative;
      flex: 1;
      min-width: 280px;
    }
    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }
    .search-input {
      padding-left: 46px !important;
      padding-right: 40px !important;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.92rem;
    }
    .clear-search-btn {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
    }
    .clear-search-btn:hover { color: white; }

    .sort-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0 14px;
    }
    .sort-select {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 500;
      padding: 10px 0;
      outline: none;
      cursor: pointer;
    }
    .sort-select option {
      background: #141414;
      color: white;
    }

    .category-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.65);
      padding: 7px 16px;
      border-radius: 50px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pill-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: white;
    }
    .pill-btn.active {
      background: rgba(0, 123, 167, 0.15);
      border-color: #0099CC;
      color: #0099CC;
      box-shadow: 0 0 14px rgba(0, 123, 167, 0.25);
    }

    .results-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 0 4px;
    }
    .count-text {
      font-size: 0.84rem;
      color: rgba(255, 255, 255, 0.5);
    }
    .reset-filters-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      font-size: 0.82rem;
      color: #FF5AAE;
      cursor: pointer;
    }
    .reset-filters-btn:hover { text-decoration: underline; }

    /* Quiz Grid */
    .quiz-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .quiz-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .card-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .time-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.65);
      background: rgba(255, 255, 255, 0.04);
      padding: 3px 10px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .card-title {
      font-size: 1.18rem;
      font-weight: 700;
      color: white;
      margin: 0;
      line-height: 1.3;
    }
    .card-desc {
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.55);
      margin: 0;
      line-height: 1.55;
      flex-grow: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 10px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .meta-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.45);
      font-weight: 600;
    }
    .meta-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: white;
    }
    .text-cerulean { color: #0099CC; }
    .text-rose { color: #FF2D95; }

    .card-actions {
      display: flex;
      gap: 10px;
      margin-top: 4px;
    }
    .action-btn { flex: 1; text-align: center; }

    .empty-box {
      padding: 56px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
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
    .empty-box h3 { font-size: 1.2rem; color: white; margin: 0; }
    .empty-box p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.5); max-width: 360px; margin: 0; }
  `]
})
export class QuizCatalogComponent implements OnInit {
  quizzes: Quiz[] = [];
  filteredQuizzes: Quiz[] = [];
  categories: Category[] = [];
  searchQuery: string = '';
  selectedCategory: number | null = null;
  sortBy: string = 'default';
  loading = true;

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    let loaded = 0;
    const check = () => {
      loaded++;
      if (loaded >= 2) this.loading = false;
    };

    this.quizService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats || [];
        check();
      },
      error: () => check()
    });

    this.quizService.getPublishedQuizzes().subscribe({
      next: (data) => {
        this.quizzes = data || [];
        this.applyFilters();
        check();
      },
      error: () => check()
    });
  }

  selectCategory(id: number | null): void {
    this.selectedCategory = id;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.sortBy = 'default';
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.quizzes];

    // Filter by Category
    if (this.selectedCategory !== null) {
      result = result.filter(q => q.categoryId === this.selectedCategory);
    }

    // Filter by Search Query
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(quiz =>
        quiz.title.toLowerCase().includes(q) ||
        (quiz.description && quiz.description.toLowerCase().includes(q)) ||
        (quiz.categoryName && quiz.categoryName.toLowerCase().includes(q))
      );
    }

    // Sort
    if (this.sortBy === 'duration-asc') {
      result.sort((a, b) => a.timeLimitMinutes - b.timeLimitMinutes);
    } else if (this.sortBy === 'duration-desc') {
      result.sort((a, b) => b.timeLimitMinutes - a.timeLimitMinutes);
    } else if (this.sortBy === 'marks-desc') {
      result.sort((a, b) => b.totalMarks - a.totalMarks);
    } else if (this.sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    this.filteredQuizzes = result;
  }
}
