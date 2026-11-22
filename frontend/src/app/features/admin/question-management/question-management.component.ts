import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../shared/admin-layout.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-question-management',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AdminLayoutComponent, IconComponent, LoadingComponent],
  template: `
    <app-admin-layout pageTitle="Question Bank &amp; Item Authoring">
      <div header-actions>
        <a routerLink="/admin/quizzes" class="btn btn-outline btn-sm">
          <app-icon name="arrow-left" [size]="14" />
          Back to Quizzes
        </a>
        <button class="btn btn-primary btn-sm" (click)="openAddModal()">
          <app-icon name="plus" [size]="15" />
          Add Question Item
        </button>
      </div>

      <!-- Header Summary Banner -->
      <div class="q-summary-strip card mb-4">
        <div class="qs-left">
          <span class="qs-badge">ASSESSMENT #{{ quizId }} REPOSITORY</span>
          <h2>Question Bank Management</h2>
          <p>Author and calibrate multiple-choice questions, set marks weightage, and configure academic answer explanations.</p>
        </div>
        <div class="qs-stats">
          <div class="qs-stat-box">
            <span class="qsb-val text-cerulean">{{ questions.length }}</span>
            <span class="qsb-lbl">Total Questions</span>
          </div>
          <div class="qs-stat-box">
            <span class="qsb-val text-success">{{ getTotalMarks() }}</span>
            <span class="qsb-lbl">Total Points</span>
          </div>
        </div>
      </div>

      @if (loading()) {
        <app-loading label="Retrieving question items from repository..." [height]="'300px'" />
      } @else if (questions.length > 0) {
        <div class="questions-list">
          @for (q of questions; let i = $index; track q.id) {
            <div class="question-card card">
              <div class="q-card-header">
                <div class="qh-left">
                  <span class="q-badge">Question Item #{{ i + 1 }}</span>
                  <span class="q-marks-pill">{{ q.marks }} Point{{ q.marks > 1 ? 's' : '' }}</span>
                  @if (q.questionOrder) {
                    <span class="q-order-tag">Order: {{ q.questionOrder }}</span>
                  }
                </div>
                <div class="qh-right">
                  <button class="btn-icon" (click)="openEditModal(q)" title="Edit Question">
                    <app-icon name="edit" [size]="14" color="#0099CC" />
                  </button>
                  <button class="btn-icon-danger" (click)="promptDeleteQuestion(q)" title="Delete Question">
                    <app-icon name="trash" [size]="14" color="#FF1744" />
                  </button>
                </div>
              </div>

              <h3 class="q-title">{{ q.questionText }}</h3>

              <div class="options-grid">
                @for (opt of q.options; track opt.id) {
                  <div class="opt-item" [class.is-correct]="opt.correct">
                    <span class="opt-bullet">{{ getOptionLetter(opt.optionOrder) }}</span>
                    <span class="opt-text">{{ opt.optionText }}</span>
                    @if (opt.correct) {
                      <span class="correct-key-tag">
                        <app-icon name="check-circle" [size]="13" color="#00E676" />
                        Correct Key
                      </span>
                    }
                  </div>
                }
              </div>

              @if (q.explanation) {
                <div class="q-expl">
                  <div class="expl-lbl">
                    <app-icon name="help-circle" [size]="14" color="#0099CC" />
                    <span>Academic Rationale:</span>
                  </div>
                  <p class="expl-text">{{ q.explanation }}</p>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="empty-state card text-center py-5">
          <app-icon name="file-text" [size]="40" color="rgba(255,255,255,0.3)" />
          <h3>No Questions in this Assessment</h3>
          <p class="txt-muted">Add multiple-choice questions with 4 answer options and an explanation.</p>
          <button class="btn btn-primary btn-sm mt-3" (click)="openAddModal()">
            <app-icon name="plus" [size]="14" />
            Add First Question
          </button>
        </div>
      }

      <!-- Add / Edit Question Modal -->
      @if (showModal) {
        <div class="modal-backdrop" (click)="showModal = false">
          <div class="modal-card card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="mh-title">
                <app-icon [name]="isEditing ? 'edit' : 'plus'" [size]="18" color="#0099CC" />
                <h3>{{ isEditing ? 'Edit Question Item' : 'Add Multiple Choice Question' }}</h3>
              </div>
              <button class="close-btn" (click)="showModal = false">
                <app-icon name="x" [size]="16" />
              </button>
            </div>

            <form [formGroup]="qForm" (ngSubmit)="onSaveQuestion()">
              <div class="form-group">
                <label class="form-label" for="qText">Question Prompt *</label>
                <textarea
                  id="qText"
                  class="form-control"
                  rows="3"
                  formControlName="questionText"
                  placeholder="e.g. Which algorithmic paradigm does Dijkstra's algorithm employ?"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="qMarks">Marks Awarded *</label>
                  <input id="qMarks" type="number" class="form-control" formControlName="marks" min="1" max="100" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="qExpl">Explanation (Revealed after exam)</label>
                  <input id="qExpl" type="text" class="form-control" formControlName="explanation" placeholder="Rationale for correct answer" />
                </div>
              </div>

              <label class="form-label mt-2">Answer Choices (Select radio button for the correct key):</label>
              <div formArrayName="options" class="options-builder">
                @for (optCtrl of optionsArray.controls; let idx = $index; track idx) {
                  <div [formGroupName]="idx" class="option-row">
                    <input
                      type="radio"
                      name="correctRadio"
                      [checked]="optCtrl.get('correct')?.value"
                      (change)="setCorrectOption(idx)"
                      title="Mark as correct answer"
                      class="custom-radio"
                    />
                    <span class="opt-letter">{{ getOptionLetter(idx + 1) }}</span>
                    <input
                      type="text"
                      class="form-control"
                      formControlName="optionText"
                      placeholder="Option choice description..."
                    />
                  </div>
                }
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline btn-sm" (click)="showModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm" [disabled]="qForm.invalid || saving">
                  {{ saving ? 'Persisting Item...' : (isEditing ? 'Update Question' : 'Save Question') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Question Confirmation Modal -->
      @if (questionToDelete) {
        <div class="modal-backdrop" (click)="questionToDelete = null">
          <div class="modal-card card confirm-card" (click)="$event.stopPropagation()">
            <div class="warn-icon-wrap">
              <app-icon name="trash" [size]="28" color="#FF1744" />
            </div>
            <h3>Delete Question Item?</h3>
            <p>
              Are you sure you want to delete this question? This action will remove its choices and adjust total assessment marks.
            </p>
            <div class="modal-footer justify-center">
              <button class="btn btn-outline btn-sm" (click)="questionToDelete = null">Cancel</button>
              <button class="btn btn-rose btn-sm" (click)="confirmDeleteQuestion()">Yes, Delete Question</button>
            </div>
          </div>
        </div>
      }
    </app-admin-layout>
  `,
  styles: [`
    .q-summary-strip {
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      border-radius: 16px;
    }
    .mb-4 { margin-bottom: 24px; }
    .qs-badge { font-size: 0.72rem; font-weight: 800; color: #0099CC; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; display: block; }
    .qs-left h2 { font-size: 1.35rem; color: white; margin: 0 0 6px 0; }
    .qs-left p { color: rgba(255, 255, 255, 0.55); font-size: 0.88rem; margin: 0; max-width: 580px; }

    .qs-stats { display: flex; gap: 14px; }
    .qs-stat-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 10px 18px;
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      min-width: 90px;
    }
    .qsb-val { font-family: 'Space Grotesk', sans-serif; font-size: 1.35rem; font-weight: 800; color: white; }
    .qsb-lbl { font-size: 0.68rem; color: rgba(255, 255, 255, 0.45); text-transform: uppercase; font-weight: 700; }
    .text-cerulean { color: #0099CC; }
    .text-success { color: #00E676; }

    .questions-list { display: flex; flex-direction: column; gap: 18px; }
    .question-card { padding: 24px 28px; display: flex; flex-direction: column; gap: 14px; border-radius: 16px; }

    .q-card-header { display: flex; justify-content: space-between; align-items: center; }
    .qh-left { display: flex; align-items: center; gap: 10px; }
    .q-badge { font-size: 0.8rem; font-weight: 700; color: #0099CC; text-transform: uppercase; letter-spacing: 0.05em; }
    .q-marks-pill { font-size: 0.72rem; color: rgba(255, 255, 255, 0.7); background: rgba(255, 255, 255, 0.05); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.08); }
    .q-order-tag { font-size: 0.72rem; color: rgba(255, 255, 255, 0.4); }

    .qh-right { display: flex; align-items: center; gap: 8px; }
    .btn-icon {
      background: rgba(0, 123, 167, 0.1);
      border: 1px solid rgba(0, 123, 167, 0.25);
      border-radius: 8px; padding: 6px 8px; cursor: pointer;
    }
    .btn-icon:hover { background: rgba(0, 123, 167, 0.2); }
    .btn-icon-danger {
      background: rgba(255, 23, 68, 0.1);
      border: 1px solid rgba(255, 23, 68, 0.25);
      border-radius: 8px; padding: 6px 8px; cursor: pointer;
    }
    .btn-icon-danger:hover { background: rgba(255, 23, 68, 0.2); }

    .q-title { font-size: 1.1rem; color: white; margin: 0; line-height: 1.45; }

    .options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; }
    .opt-item {
      display: flex; align-items: center; gap: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px; padding: 10px 12px;
    }
    .opt-item.is-correct { background: rgba(0, 230, 118, 0.08); border-color: rgba(0, 230, 118, 0.3); }
    .opt-bullet {
      width: 26px; height: 26px; border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.78rem; color: white; flex-shrink: 0;
    }
    .opt-item.is-correct .opt-bullet { background: #00E676; color: black; }
    .opt-text { font-size: 0.88rem; color: rgba(255, 255, 255, 0.85); flex: 1; }
    .correct-key-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 700; color: #00E676; }

    .q-expl {
      background: rgba(0, 123, 167, 0.06); border: 1px solid rgba(0, 123, 167, 0.2);
      border-radius: 8px; padding: 10px 14px;
      display: flex; flex-direction: column; gap: 3px;
    }
    .expl-lbl { display: inline-flex; align-items: center; gap: 6px; font-size: 0.74rem; font-weight: 700; color: #0099CC; text-transform: uppercase; }
    .expl-text { font-size: 0.86rem; color: rgba(255, 255, 255, 0.7); margin: 0; line-height: 1.45; }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
      z-index: 1000; display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .modal-card {
      padding: 32px; max-width: 600px; width: 100%;
      border-radius: 20px; background: #141414;
      max-height: 90vh; overflow-y: auto;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
    .mh-title { display: flex; align-items: center; gap: 8px; }
    .mh-title h3 { font-size: 1.25rem; color: white; margin: 0; }
    .close-btn { background: none; border: none; color: rgba(255, 255, 255, 0.5); cursor: pointer; }
    .form-row { display: grid; grid-template-columns: 1fr 2fr; gap: 14px; }

    .options-builder { display: flex; flex-direction: column; gap: 10px; margin-bottom: 22px; }
    .option-row { display: flex; align-items: center; gap: 10px; }
    .custom-radio { cursor: pointer; accent-color: #00E676; width: 18px; height: 18px; }
    .opt-letter {
      width: 28px; height: 28px; border-radius: 6px;
      background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8rem; color: white; flex-shrink: 0;
    }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; }

    .confirm-card { text-align: center; max-width: 440px; }
    .warn-icon-wrap {
      width: 56px; height: 56px; border-radius: 14px;
      background: rgba(255, 23, 68, 0.12); border: 1px solid rgba(255, 23, 68, 0.25);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px auto;
    }
    .justify-center { justify-content: center; }
    .py-5 { padding: 48px 0; }
    .txt-muted { color: rgba(255, 255, 255, 0.5); }
  `]
})
export class QuestionManagementComponent implements OnInit {
  quizId = 0;
  questions: any[] = [];
  showModal = false;
  isEditing = false;
  editingQuestionId: number | null = null;
  saving = false;

  questionToDelete: any = null;
  loading = signal<boolean>(true);

  qForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private quizService: QuizService
  ) {
    this.qForm = this.fb.group({
      questionText: ['', Validators.required],
      marks: [10, [Validators.required, Validators.min(1)]],
      explanation: [''],
      options: this.fb.array([
        this.createOptionGroup(1, true),
        this.createOptionGroup(2, false),
        this.createOptionGroup(3, false),
        this.createOptionGroup(4, false)
      ])
    });
  }

  get optionsArray(): FormArray {
    return this.qForm.get('options') as FormArray;
  }

  createOptionGroup(order: number, correct: boolean, text: string = ''): FormGroup {
    return this.fb.group({
      optionText: [text, Validators.required],
      correct: [correct],
      optionOrder: [order]
    });
  }

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.quizId) {
      this.loadQuestions();
    }
  }

  loadQuestions(): void {
    this.quizService.adminGetQuestions(this.quizId).subscribe({
      next: (q) => {
        this.questions = q || [];
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getTotalMarks(): number {
    return this.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingQuestionId = null;
    this.qForm.reset({
      questionText: '',
      marks: 10,
      explanation: ''
    });
    this.optionsArray.clear();
    for (let i = 1; i <= 4; i++) {
      this.optionsArray.push(this.createOptionGroup(i, i === 1));
    }
    this.showModal = true;
  }

  openEditModal(q: any): void {
    this.isEditing = true;
    this.editingQuestionId = q.id;
    this.qForm.patchValue({
      questionText: q.questionText,
      marks: q.marks || 10,
      explanation: q.explanation || ''
    });

    this.optionsArray.clear();
    if (q.options && q.options.length > 0) {
      q.options.forEach((opt: any, idx: number) => {
        this.optionsArray.push(this.createOptionGroup(idx + 1, opt.correct, opt.optionText));
      });
    } else {
      for (let i = 1; i <= 4; i++) {
        this.optionsArray.push(this.createOptionGroup(i, i === 1));
      }
    }
    this.showModal = true;
  }

  setCorrectOption(selectedIdx: number): void {
    this.optionsArray.controls.forEach((ctrl, idx) => {
      ctrl.patchValue({ correct: idx === selectedIdx });
    });
  }

  onSaveQuestion(): void {
    if (this.qForm.invalid) return;
    this.saving = true;

    if (this.isEditing && this.editingQuestionId) {
      this.quizService.adminUpdateQuestion(this.editingQuestionId, this.qForm.value).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.loadQuestions();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to update question item.');
          this.saving = false;
        }
      });
    } else {
      this.quizService.adminAddQuestion(this.quizId, this.qForm.value).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.loadQuestions();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to add question item.');
          this.saving = false;
        }
      });
    }
  }

  promptDeleteQuestion(question: any): void {
    this.questionToDelete = question;
  }

  confirmDeleteQuestion(): void {
    if (!this.questionToDelete) return;
    const id = this.questionToDelete.id;
    this.quizService.adminDeleteQuestion(id).subscribe({
      next: () => {
        this.questionToDelete = null;
        this.loadQuestions();
      },
      error: () => {
        alert('Failed to delete question.');
        this.questionToDelete = null;
      }
    });
  }

  getOptionLetter(order: number): string {
    return String.fromCharCode(64 + order);
  }
}
