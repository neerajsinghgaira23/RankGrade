import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../shared/admin-layout.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { Category } from '../../../core/models/models';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminLayoutComponent, IconComponent, LoadingComponent],
  template: `
    <app-admin-layout pageTitle="Curriculum Taxonomy &amp; Categories">
      <div header-actions>
        <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
          <app-icon name="plus" [size]="15" />
          <span>Create Category</span>
        </button>
      </div>

      <!-- Toolbar / Metric Bar -->
      <div class="toolbar-card card mb-4">
        <div class="search-box">
          <app-icon name="search" [size]="16" color="rgba(255,255,255,0.4)" customClass="search-icon" />
          <input
            type="text"
            class="form-control"
            placeholder="Search categories by domain name or curriculum description..."
            [(ngModel)]="searchQuery"
            (input)="filterCategories()"
          />
        </div>
        <div class="count-pill">
          <app-icon name="layers" [size]="14" color="#0099CC" />
          <span>{{ filteredCategories.length }} of {{ categories.length }} Active Domains</span>
        </div>
      </div>

      @if (loading()) {
        <app-loading label="Loading taxonomy classifications..." [height]="'320px'" />
      } @else if (filteredCategories.length > 0) {
        <div class="categories-grid">
          @for (cat of filteredCategories; track cat.id) {
            <div class="category-card card">
              <div class="cat-header">
                <div class="cat-icon-badge">
                  <app-icon name="layers" [size]="22" color="#007BA7" />
                </div>
                <div class="cat-header-actions">
                  <span class="cat-id-tag">#{{ cat.id }}</span>
                  <button class="btn-icon" (click)="openEditModal(cat)" title="Edit Category">
                    <app-icon name="edit" [size]="13" color="#0099CC" />
                  </button>
                  <button class="btn-icon-danger" (click)="promptDeleteCategory(cat)" title="Delete Category">
                    <app-icon name="trash" [size]="13" color="#FF1744" />
                  </button>
                </div>
              </div>

              <h3 class="cat-name">{{ cat.name }}</h3>
              <p class="cat-desc">{{ cat.description || 'No detailed curriculum description provided for this academic domain.' }}</p>

              <div class="cat-footer">
                <span class="quiz-count-pill">
                  <app-icon name="book" [size]="12" />
                  {{ cat.quizCount ?? 0 }} Assessments Assigned
                </span>
                <span class="active-tag">
                  <span class="pulse-dot"></span>
                  Active Domain
                </span>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state card text-center py-5">
          <app-icon name="layers" [size]="36" color="rgba(255,255,255,0.3)" />
          <h3>No categories found</h3>
          <p class="txt-muted">{{ searchQuery ? 'No categories matched your search criteria.' : 'No categories have been established yet.' }}</p>
          <button class="btn btn-primary btn-sm mt-3" (click)="openCreateModal()">
            <app-icon name="plus" [size]="14" />
            <span>Create First Category</span>
          </button>
        </div>
      }

      <!-- Create / Edit Category Modal -->
      @if (showModal) {
        <div class="modal-backdrop" (click)="showModal = false">
          <div class="modal-card card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-group">
                <app-icon [name]="isEditing ? 'edit' : 'plus'" [size]="18" color="#0099CC" />
                <div>
                  <h3>{{ isEditing ? 'Edit Category' : 'Add Domain Category' }}</h3>
                  <p class="txt-muted">{{ isEditing ? 'Update classification and details' : 'Register a new academic topic domain for quiz classification' }}</p>
                </div>
              </div>
              <button class="close-btn" (click)="showModal = false">
                <app-icon name="x" [size]="16" />
              </button>
            </div>

            <form [formGroup]="catForm" (ngSubmit)="onSaveCategory()">
              <div class="form-group">
                <label class="form-label">Category Name <span class="required">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="name"
                  placeholder="e.g. Distributed Systems, Neural Networks, Cloud DevOps"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  rows="3"
                  formControlName="description"
                  placeholder="Provide a concise curriculum overview of topics covered in this domain..."
                ></textarea>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline btn-sm" (click)="showModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm" [disabled]="catForm.invalid || saving">
                  {{ saving ? 'Persisting...' : (isEditing ? 'Update Category' : 'Create Category') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Category Confirmation Modal -->
      @if (categoryToDelete) {
        <div class="modal-backdrop" (click)="categoryToDelete = null">
          <div class="modal-card card confirm-card" (click)="$event.stopPropagation()">
            <div class="warn-icon-wrap">
              <app-icon name="trash" [size]="28" color="#FF1744" />
            </div>
            <h3>Delete Domain Category?</h3>
            <p>
              Are you sure you want to delete category <strong>"{{ categoryToDelete.name }}"</strong>?
              @if ((categoryToDelete.quizCount ?? 0) > 0) {
                <span class="warning-alert">
                  Warning: This category has {{ categoryToDelete.quizCount }} quizzes assigned to it. Categories with assigned quizzes cannot be removed.
                </span>
              }
            </p>
            <div class="modal-footer justify-center">
              <button class="btn btn-outline btn-sm" (click)="categoryToDelete = null">Cancel</button>
              <button class="btn btn-rose btn-sm" (click)="confirmDeleteCategory()">Yes, Delete Category</button>
            </div>
          </div>
        </div>
      }
    </app-admin-layout>
  `,
  styles: [`
    .toolbar-card {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      border-radius: 14px;
    }
    .mb-4 { margin-bottom: 24px; }
    .search-box {
      position: relative;
      flex: 1;
      max-width: 460px;
      min-width: 260px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }
    .search-box .form-control {
      padding-left: 42px !important;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .count-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      padding: 6px 14px;
      border-radius: 50px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 20px;
    }
    .category-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      transition: all 0.2s ease;
    }
    .category-card:hover {
      transform: translateY(-3px);
      border-color: rgba(0, 123, 167, 0.4);
    }
    .cat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .cat-icon-badge {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: rgba(0, 123, 167, 0.12);
      border: 1px solid rgba(0, 123, 167, 0.25);
      display: flex; align-items: center; justify-content: center;
    }
    .cat-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cat-id-tag {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.4);
      font-family: 'Space Grotesk', monospace;
      padding: 3px 8px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
      margin-right: 4px;
    }
    .btn-icon {
      background: rgba(0, 123, 167, 0.1);
      border: 1px solid rgba(0, 123, 167, 0.25);
      border-radius: 6px; padding: 5px 8px; cursor: pointer;
    }
    .btn-icon:hover { background: rgba(0, 123, 167, 0.2); }
    .btn-icon-danger {
      background: rgba(255, 23, 68, 0.1);
      border: 1px solid rgba(255, 23, 68, 0.25);
      border-radius: 6px; padding: 5px 8px; cursor: pointer;
    }
    .btn-icon-danger:hover { background: rgba(255, 23, 68, 0.2); }

    .cat-name { font-size: 1.18rem; font-weight: 700; color: white; margin: 0 0 6px 0; }
    .cat-desc { font-size: 0.86rem; color: rgba(255, 255, 255, 0.6); margin-bottom: 20px; flex: 1; line-height: 1.5; }

    .cat-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 14px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .quiz-count-pill {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 0.78rem; color: #38bdf8; font-weight: 600;
    }
    .active-tag {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.74rem; font-weight: 600; color: #00E676;
    }
    .pulse-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #00E676; box-shadow: 0 0 8px #00E676;
    }

    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
      z-index: 1000; display: flex; align-items: center; justify-content: center;
      padding: 16px;
    }
    .modal-card {
      width: 100%; max-width: 500px;
      padding: 30px; border-radius: 20px; background: #141414;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .modal-title-group { display: flex; align-items: center; gap: 12px; }
    .modal-title-group h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 2px 0; color: white; }
    .close-btn { background: none; border: none; color: rgba(255, 255, 255, 0.5); cursor: pointer; }
    .required { color: #FF2D95; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 22px; }

    .confirm-card { text-align: center; max-width: 440px; }
    .warn-icon-wrap {
      width: 56px; height: 56px; border-radius: 14px;
      background: rgba(255, 23, 68, 0.12); border: 1px solid rgba(255, 23, 68, 0.25);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px auto;
    }
    .warning-alert { display: block; margin-top: 10px; color: #FFB300; font-size: 0.82rem; }
    .justify-center { justify-content: center; }
    .py-5 { padding: 48px 0; }
    .txt-muted { color: rgba(255, 255, 255, 0.5); font-size: 0.85rem; }
  `]
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchQuery = '';
  loading = signal<boolean>(true);

  showModal = false;
  isEditing = false;
  editingCatId: number | null = null;
  saving = false;

  categoryToDelete: Category | null = null;
  catForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService
  ) {
    this.catForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.quizService.adminGetCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
        this.filterCategories();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterCategories(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredCategories = this.categories;
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredCategories = this.categories.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingCatId = null;
    this.catForm.reset({ name: '', description: '' });
    this.showModal = true;
  }

  openEditModal(cat: Category): void {
    this.isEditing = true;
    this.editingCatId = cat.id;
    this.catForm.patchValue({
      name: cat.name,
      description: cat.description || ''
    });
    this.showModal = true;
  }

  onSaveCategory(): void {
    if (this.catForm.invalid) return;
    this.saving = true;

    if (this.isEditing && this.editingCatId) {
      this.quizService.adminUpdateCategory(this.editingCatId, this.catForm.value).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.loadCategories();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to update category.');
          this.saving = false;
        }
      });
    } else {
      this.quizService.adminCreateCategory(this.catForm.value).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.loadCategories();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to create category.');
          this.saving = false;
        }
      });
    }
  }

  promptDeleteCategory(cat: Category): void {
    this.categoryToDelete = cat;
  }

  confirmDeleteCategory(): void {
    if (!this.categoryToDelete) return;
    const id = this.categoryToDelete.id;
    this.quizService.adminDeleteCategory(id).subscribe({
      next: () => {
        this.categoryToDelete = null;
        this.loadCategories();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete category.');
        this.categoryToDelete = null;
      }
    });
  }
}
