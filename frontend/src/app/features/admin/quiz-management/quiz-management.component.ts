import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../shared/admin-layout.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz, Category } from '../../../core/models/models';

@Component({
  selector: 'app-quiz-management',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, AdminLayoutComponent, IconComponent, LoadingComponent],
  template: `
    <app-admin-layout pageTitle="Quiz Authoring &amp; Management">
      <div header-actions>
        <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
          <app-icon name="plus" [size]="15" />
          Create New Quiz
        </button>
      </div>

      <!-- Toolbar / Filter Bar -->
      <div class="toolbar-card card">
        <div class="search-wrap">
          <app-icon name="search" [size]="16" color="rgba(255,255,255,0.4)" customClass="search-icon" />
          <input
            type="text"
            class="form-control"
            placeholder="Search quizzes by title, description or category..."
            [(ngModel)]="searchQuery"
            (input)="filterQuizzes()"
          />
        </div>

        <div class="filters-row">
          <select class="form-control filter-select" [(ngModel)]="selectedCategory" (change)="filterQuizzes()">
            <option value="">All Categories</option>
            @for (cat of categories; track cat.id) {
              <option [value]="cat.name">{{ cat.name }}</option>
            }
          </select>

          <select class="form-control filter-select" [(ngModel)]="selectedStatus" (change)="filterQuizzes()">
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Draft Only</option>
            <option value="ARCHIVED">Archived Only</option>
          </select>

          @if (searchQuery || selectedCategory || selectedStatus) {
            <button class="btn btn-outline btn-sm" (click)="clearFilters()">
              <app-icon name="x" [size]="14" />
              Clear
            </button>
          }
        </div>
      </div>

      <!-- Quizzes Table Card -->
      @if (loading()) {
        <app-loading label="Loading curriculum assessment inventory from database..." [height]="'320px'" />
      } @else if (filteredQuizzes().length > 0) {
        <div class="table-card card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Title &amp; Concept</th>
                  <th>Domain Category</th>
                  <th>Duration</th>
                  <th>Marks Criteria</th>
                  <th>Question Bank</th>
                  <th>Status</th>
                  <th class="text-right">Operations</th>
                </tr>
              </thead>
              <tbody>
                @for (q of filteredQuizzes(); track q.id) {
                  <tr>
                    <td>
                      <div class="quiz-info-cell">
                        <strong class="q-title">{{ q.title }}</strong>
                        <span class="q-desc-sub">{{ q.description || 'Standard curriculum assessment' }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-cerulean">{{ q.categoryName || 'General' }}</span>
                    </td>
                    <td>
                      <span class="time-cell">
                        <app-icon name="clock" [size]="13" />
                        {{ q.timeLimitMinutes }} Mins
                      </span>
                    </td>
                    <td>
                      <span class="marks-val">{{ q.totalMarks }}</span>
                      <span class="pass-sub">Pass: {{ q.passingMarks ?? 40 }}%</span>
                    </td>
                    <td>
                      <span class="badge badge-gray">{{ q.questionCount }} Items</span>
                    </td>
                    <td>
                      <select
                        class="status-select"
                        [value]="q.status"
                        (change)="updateStatus(q.id, $any($event.target).value)"
                        [class.status-pub]="q.status === 'PUBLISHED'"
                        [class.status-dft]="q.status === 'DRAFT'"
                        [class.status-arc]="q.status === 'ARCHIVED'"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </td>
                    <td class="text-right">
                      <div class="action-btn-group">
                        <button class="btn btn-sm btn-outline" (click)="previewQuiz(q)" title="Preview Quiz Details">
                          <app-icon name="eye" [size]="13" />
                        </button>
                        <button class="btn btn-sm btn-outline" (click)="openEditModal(q)" title="Edit Quiz Properties">
                          <app-icon name="edit" [size]="13" />
                        </button>
                        <a [routerLink]="['/admin/quizzes', q.id, 'questions']" class="btn btn-sm btn-outline" title="Author Questions">
                          <app-icon name="file-text" [size]="13" />
                          ({{ q.questionCount }})
                        </a>
                        <button class="btn btn-sm btn-danger-ghost" (click)="promptDelete(q)" title="Delete Quiz">
                          <app-icon name="trash" [size]="14" color="#FF1744" />
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="empty-state card text-center py-5">
          <app-icon name="book" [size]="36" color="rgba(255,255,255,0.3)" />
          <h3>No Quizzes Found</h3>
          <p class="txt-muted">No assessments match your current filters or search query.</p>
          <button class="btn btn-primary btn-sm mt-3" (click)="openCreateModal()">
            <app-icon name="plus" [size]="14" />
            Create Assessment
          </button>
        </div>
      }

      <!-- Create / Edit Quiz Modal -->
      @if (showModal) {
        <div class="modal-backdrop" (click)="showModal = false">
          <div class="modal-card card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="mh-title">
                <app-icon [name]="isEditing ? 'edit' : 'plus'" [size]="18" color="#0099CC" />
                <h3>{{ isEditing ? 'Edit Assessment' : 'Create New Assessment' }}</h3>
              </div>
              <button class="close-btn" (click)="showModal = false">
                <app-icon name="x" [size]="16" />
              </button>
            </div>

            <form [formGroup]="quizForm" (ngSubmit)="onSaveQuiz()">
              <div class="form-group">
                <label class="form-label" for="qTitle">Assessment Title *</label>
                <input id="qTitle" type="text" class="form-control" formControlName="title" placeholder="e.g. Distributed Database Engineering" />
              </div>

              <div class="form-group">
                <label class="form-label" for="qDesc">Description</label>
                <textarea id="qDesc" class="form-control" formControlName="description" rows="3" placeholder="Brief outline of concepts tested in this module..."></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="qCat">Domain Category *</label>
                  <select id="qCat" class="form-control" formControlName="categoryId">
                    <option [ngValue]="null" disabled>Select domain</option>
                    @for (cat of categories; track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="qTime">Time Limit (Mins) *</label>
                  <input id="qTime" type="number" class="form-control" formControlName="timeLimitMinutes" min="1" max="300" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="qPass">Passing Threshold (Marks) *</label>
                  <input id="qPass" type="number" class="form-control" formControlName="passingMarks" min="1" max="500" />
                </div>

                <div class="form-group">
                  <label class="form-label" for="qAttempts">Max Attempts Allowed</label>
                  <input id="qAttempts" type="number" class="form-control" formControlName="maxAttempts" min="1" placeholder="e.g. 3 (leave blank for unlimited)" />
                </div>
              </div>

              <div class="checkbox-row">
                <label class="custom-check-lbl">
                  <input type="checkbox" formControlName="shuffleQuestions" />
                  <span>Randomize question sequence for candidates</span>
                </label>
                <label class="custom-check-lbl">
                  <input type="checkbox" formControlName="showResultImmediately" />
                  <span>Display comprehensive evaluation immediately upon submission</span>
                </label>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline btn-sm" (click)="showModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm" [disabled]="quizForm.invalid || saving">
                  {{ saving ? 'Persisting...' : (isEditing ? 'Update Assessment' : 'Create Assessment') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Quiz Preview Modal -->
      @if (previewedQuiz) {
        <div class="modal-backdrop" (click)="previewedQuiz = null">
          <div class="modal-card card preview-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <span class="preview-badge">ASSESSMENT SPECIFICATION</span>
                <h3>{{ previewedQuiz.title }}</h3>
              </div>
              <button class="close-btn" (click)="previewedQuiz = null">
                <app-icon name="x" [size]="16" />
              </button>
            </div>

            <p class="preview-desc">{{ previewedQuiz.description || 'No detailed syllabus summary provided for this assessment.' }}</p>

            <div class="spec-grid">
              <div class="spec-item">
                <span class="spec-label">Domain Category</span>
                <span class="spec-val text-cerulean">{{ previewedQuiz.categoryName || 'General' }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Duration</span>
                <span class="spec-val">{{ previewedQuiz.timeLimitMinutes }} Minutes</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Total Marks</span>
                <span class="spec-val">{{ previewedQuiz.totalMarks }} Points</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Passing Standard</span>
                <span class="spec-val text-success">{{ previewedQuiz.passingMarks ?? 40 }}% Threshold</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Question Bank</span>
                <span class="spec-val">{{ previewedQuiz.questionCount }} Active Items</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Current Publication</span>
                <span class="spec-val" [ngClass]="previewedQuiz.status === 'PUBLISHED' ? 'text-success' : 'text-warning'">{{ previewedQuiz.status }}</span>
              </div>
            </div>

            <div class="modal-footer">
              <a [routerLink]="['/admin/quizzes', previewedQuiz.id, 'questions']" class="btn btn-primary btn-sm" (click)="previewedQuiz = null">
                <app-icon name="edit" [size]="14" />
                Manage Question Bank
              </a>
              <button class="btn btn-outline btn-sm" (click)="previewedQuiz = null">Dismiss</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (quizToDelete) {
        <div class="modal-backdrop" (click)="quizToDelete = null">
          <div class="modal-card card confirm-card" (click)="$event.stopPropagation()">
            <div class="warn-icon-wrap">
              <app-icon name="trash" [size]="28" color="#FF1744" />
            </div>
            <h3>Delete Assessment?</h3>
            <p>
              Are you sure you want to permanently delete <strong>"{{ quizToDelete.title }}"</strong>?
              If this quiz is published or has recorded attempts, please archive it instead.
            </p>
            <div class="modal-footer justify-center">
              <button class="btn btn-outline btn-sm" (click)="quizToDelete = null">Cancel</button>
              <button class="btn btn-rose btn-sm" (click)="confirmDelete()">Yes, Delete Assessment</button>
            </div>
          </div>
        </div>
      }
    </app-admin-layout>
  `,
  styles: [`
    .toolbar-card {
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .search-wrap {
      position: relative;
      flex: 1;
      max-width: 440px;
      min-width: 260px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }
    .search-wrap .form-control {
      padding-left: 42px !important;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .filters-row {
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

    .table-card { padding: 0; overflow: hidden; border-radius: 16px; }
    .table-responsive { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; }
    .table th {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.76rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      background: rgba(255, 255, 255, 0.015);
    }
    .table td { padding: 16px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
    .table tr:hover td { background: rgba(255, 255, 255, 0.02); }

    .quiz-info-cell { display: flex; flex-direction: column; gap: 3px; max-width: 320px; }
    .q-title { color: white; font-size: 0.94rem; }
    .q-desc-sub { font-size: 0.78rem; color: rgba(255, 255, 255, 0.45); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .time-cell { display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; color: rgba(255, 255, 255, 0.6); }
    .marks-val { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: white; margin-right: 4px; }
    .pass-sub { font-size: 0.74rem; color: rgba(255, 255, 255, 0.4); }

    .status-select {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      color: white;
      padding: 6px 10px;
      font-size: 0.78rem;
      font-weight: 700;
      outline: none;
      cursor: pointer;
    }
    .status-select option { background: #141414; }
    .status-pub { border-color: rgba(0, 230, 118, 0.4); color: #00E676; }
    .status-dft { border-color: rgba(255, 179, 0, 0.4); color: #FFB300; }
    .status-arc { border-color: rgba(255, 255, 255, 0.2); color: rgba(255, 255, 255, 0.6); }

    .action-btn-group { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
    .btn-danger-ghost {
      background: rgba(255, 23, 68, 0.1);
      border: 1px solid rgba(255, 23, 68, 0.25);
      border-radius: 8px;
      padding: 6px 9px;
      cursor: pointer;
    }
    .btn-danger-ghost:hover { background: rgba(255, 23, 68, 0.2); }

    .badge-cerulean { background: rgba(0, 123, 167, 0.15); color: #0099CC; border: 1px solid rgba(0, 123, 167, 0.3); }
    .badge-gray { background: rgba(255, 255, 255, 0.06); color: rgba(255, 255, 255, 0.7); }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .py-5 { padding: 48px 0; }
    .txt-muted { color: rgba(255, 255, 255, 0.5); }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .modal-card {
      padding: 32px;
      max-width: 560px;
      width: 100%;
      border-radius: 20px;
      background: #141414;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
    .mh-title { display: flex; align-items: center; gap: 10px; }
    .mh-title h3 { font-size: 1.25rem; color: white; margin: 0; }
    .close-btn { background: none; border: none; color: rgba(255, 255, 255, 0.5); cursor: pointer; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .checkbox-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 16px 0 20px 0;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
    }
    .custom-check-lbl {
      display: flex; align-items: center; gap: 10px;
      font-size: 0.84rem; color: rgba(255, 255, 255, 0.8); cursor: pointer;
    }
    .custom-check-lbl input { accent-color: #007BA7; }

    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }

    /* Preview Card */
    .preview-card { max-width: 620px; }
    .preview-badge { font-size: 0.72rem; font-weight: 800; color: #0099CC; letter-spacing: 0.06em; }
    .preview-desc { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); margin-bottom: 20px; line-height: 1.5; }
    .spec-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
      padding: 18px; border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      margin-bottom: 20px;
    }
    .spec-item { display: flex; flex-direction: column; gap: 2px; }
    .spec-label { font-size: 0.72rem; color: rgba(255, 255, 255, 0.45); text-transform: uppercase; font-weight: 700; }
    .spec-val { font-weight: 700; color: white; font-size: 0.95rem; }

    .confirm-card { text-align: center; max-width: 440px; }
    .warn-icon-wrap {
      width: 56px; height: 56px;
      border-radius: 14px;
      background: rgba(255, 23, 68, 0.12);
      border: 1px solid rgba(255, 23, 68, 0.25);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px auto;
    }
    .justify-center { justify-content: center; }
  `]
})
export class QuizManagementComponent implements OnInit {
  quizzes: Quiz[] = [];
  filteredQuizzes = signal<Quiz[]>([]);
  categories: Category[] = [];

  showModal = false;
  isEditing = false;
  editingQuizId: number | null = null;
  saving = false;

  previewedQuiz: Quiz | null = null;
  quizToDelete: Quiz | null = null;

  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  loading = signal<boolean>(true);

  quizForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService
  ) {
    this.quizForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      categoryId: [null, Validators.required],
      timeLimitMinutes: [15, [Validators.required, Validators.min(1)]],
      passingMarks: [20, [Validators.required, Validators.min(1)]],
      maxAttempts: [null],
      shuffleQuestions: [false],
      showResultImmediately: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.quizService.getCategories().subscribe({
      next: (cats) => { this.categories = cats || []; }
    });

    this.quizService.adminGetAllQuizzes().subscribe({
      next: (q) => {
        this.quizzes = q || [];
        this.filterQuizzes();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterQuizzes(): void {
    let list = [...this.quizzes];

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const s = this.searchQuery.toLowerCase();
      list = list.filter(q =>
        q.title.toLowerCase().includes(s) ||
        (q.description && q.description.toLowerCase().includes(s)) ||
        (q.categoryName && q.categoryName.toLowerCase().includes(s))
      );
    }

    if (this.selectedCategory) {
      list = list.filter(q => q.categoryName === this.selectedCategory);
    }

    if (this.selectedStatus) {
      list = list.filter(q => q.status === this.selectedStatus);
    }

    this.filteredQuizzes.set(list);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.filterQuizzes();
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingQuizId = null;
    this.quizForm.reset({
      title: '',
      description: '',
      categoryId: this.categories.length > 0 ? this.categories[0].id : null,
      timeLimitMinutes: 15,
      passingMarks: 20,
      maxAttempts: null,
      shuffleQuestions: false,
      showResultImmediately: true
    });
    this.showModal = true;
  }

  openEditModal(q: Quiz): void {
    this.isEditing = true;
    this.editingQuizId = q.id;
    this.quizForm.patchValue({
      title: q.title,
      description: q.description || '',
      categoryId: q.categoryId,
      timeLimitMinutes: q.timeLimitMinutes,
      passingMarks: q.passingMarks ?? 20,
      maxAttempts: q.maxAttempts || null,
      shuffleQuestions: q.shuffleQuestions || false,
      showResultImmediately: q.showResultImmediately !== false
    });
    this.showModal = true;
  }

  onSaveQuiz(): void {
    if (this.quizForm.invalid) return;
    this.saving = true;

    if (this.isEditing && this.editingQuizId) {
      this.quizService.adminUpdateQuiz(this.editingQuizId, this.quizForm.value).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.loadData();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to update quiz.');
          this.saving = false;
        }
      });
    } else {
      this.quizService.adminCreateQuiz(this.quizForm.value).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.loadData();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to create assessment.');
          this.saving = false;
        }
      });
    }
  }

  updateStatus(quizId: number, status: string): void {
    this.quizService.adminUpdateStatus(quizId, status).subscribe({
      next: () => this.loadData(),
      error: (err) => alert(err.error?.message || 'Failed to update status.')
    });
  }

  previewQuiz(q: Quiz): void {
    this.previewedQuiz = q;
  }

  promptDelete(quiz: Quiz): void {
    this.quizToDelete = quiz;
  }

  confirmDelete(): void {
    if (!this.quizToDelete) return;
    const id = this.quizToDelete.id;
    this.quizService.adminDeleteQuiz(id).subscribe({
      next: () => {
        this.quizToDelete = null;
        this.loadData();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete quiz.');
        this.quizToDelete = null;
      }
    });
  }
}
