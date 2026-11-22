import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../shared/admin-layout.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { QuizService } from '../../../core/services/quiz.service';
import { AdminStudent } from '../../../core/models/models';

@Component({
  selector: 'app-student-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent, IconComponent, LoadingComponent],
  template: `
    <app-admin-layout pageTitle="Student Registry &amp; Profiles">
      <!-- Toolbar Bar -->
      <div class="toolbar-card card mb-4">
        <div class="search-box">
          <app-icon name="search" [size]="16" color="rgba(255,255,255,0.4)" customClass="search-icon" />
          <input
            type="text"
            class="form-control"
            placeholder="Search candidates by name, username, or email address..."
            [(ngModel)]="searchQuery"
            (input)="filterStudents()"
          />
        </div>
        <div class="count-pill">
          <app-icon name="users" [size]="14" color="#0099CC" />
          <span>{{ filteredStudents.length }} of {{ students.length }} Registered Learners</span>
        </div>
      </div>

      @if (loading()) {
        <app-loading label="Retrieving registered student registry and telemetry..." [height]="'320px'" />
      } @else if (filteredStudents.length > 0) {
        <div class="table-card card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Learner Profile</th>
                  <th>Username</th>
                  <th>Email Address</th>
                  <th>Account Status</th>
                  <th>Examination Attempts</th>
                  <th>Mean Score</th>
                  <th>Enrolled</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (s of filteredStudents; track s.id) {
                  <tr>
                    <td>
                      <div class="student-cell">
                        <div class="avatar-sm">{{ getInitials(s.fullName || s.username) }}</div>
                        <div class="student-meta">
                          <span class="student-name">{{ s.fullName || s.username }}</span>
                          <span class="student-id-sub">UID: #{{ s.id }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="username-tag">&#64;{{ s.username }}</span>
                    </td>
                    <td>
                      <span class="email-text">{{ s.email }}</span>
                    </td>
                    <td>
                      <button
                        class="status-toggle-btn"
                        [class.is-active]="s.active"
                        (click)="toggleStatus(s)"
                        title="Click to toggle status"
                      >
                        <span class="status-dot"></span>
                        {{ s.active ? 'Active' : 'Deactivated' }}
                      </button>
                    </td>
                    <td>
                      <span class="badge badge-gray">{{ s.attemptCount }} Attempt{{ s.attemptCount !== 1 ? 's' : '' }}</span>
                    </td>
                    <td>
                      <span class="score-txt">{{ (s.averageScore ?? 0) | number:'1.0-1' }}%</span>
                    </td>
                    <td>
                      <span class="date-text">
                        <app-icon name="clock" [size]="12" />
                        {{ s.createdAt ? (s.createdAt | date:'mediumDate') : 'Recent' }}
                      </span>
                    </td>
                    <td class="text-right">
                      <button class="btn btn-outline btn-sm" (click)="viewStudentDetail(s.id)">
                        <app-icon name="eye" [size]="13" />
                        Profile
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="empty-state card text-center py-5">
          <app-icon name="users" [size]="36" color="rgba(255,255,255,0.3)" />
          <h3>No Student Profiles Found</h3>
          <p class="txt-muted">{{ searchQuery ? 'No learners matched your query filter.' : 'No candidates registered in database.' }}</p>
        </div>
      }

      <!-- Student Detail Modal -->
      @if (selectedStudentDetail) {
        <div class="modal-backdrop" (click)="selectedStudentDetail = null">
          <div class="modal-card card detail-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-user-header">
                <div class="avatar-lg">{{ getInitials(selectedStudentDetail.fullName || selectedStudentDetail.username) }}</div>
                <div>
                  <h3>{{ selectedStudentDetail.fullName || selectedStudentDetail.username }}</h3>
                  <span class="user-sub">&#64;{{ selectedStudentDetail.username }} &bull; {{ selectedStudentDetail.email }}</span>
                </div>
              </div>
              <button class="close-btn" (click)="selectedStudentDetail = null">
                <app-icon name="x" [size]="16" />
              </button>
            </div>

            <!-- Student Metrics Overview -->
            <div class="student-kpis">
              <div class="skpi-box">
                <span class="skpi-lbl">Total Attempts</span>
                <span class="skpi-val">{{ selectedStudentDetail.totalAttempts }}</span>
              </div>
              <div class="skpi-box">
                <span class="skpi-lbl">Completed</span>
                <span class="skpi-val">{{ selectedStudentDetail.completedAttempts }}</span>
              </div>
              <div class="skpi-box">
                <span class="skpi-lbl">Passed</span>
                <span class="skpi-val text-success">{{ selectedStudentDetail.passedAttempts }}</span>
              </div>
              <div class="skpi-box">
                <span class="skpi-lbl">Average Score</span>
                <span class="skpi-val text-rose">{{ selectedStudentDetail.averageScore }}%</span>
              </div>
            </div>

            <!-- Attempts History in Modal -->
            <h4 class="modal-section-title">Examination Attempts Log</h4>
            @if (selectedStudentDetail.attempts && selectedStudentDetail.attempts.length > 0) {
              <div class="detail-attempts-list">
                @for (att of selectedStudentDetail.attempts; track att.attemptId) {
                  <div class="att-item-row">
                    <div class="air-info">
                      <strong class="air-title">{{ att.quizTitle }}</strong>
                      <span class="air-date">{{ att.startedAt ? (att.startedAt | date:'medium') : '' }}</span>
                    </div>
                    <div class="air-score">
                      <span class="air-marks">{{ att.scoreObtained }} / {{ att.totalMarks }}</span>
                      <span class="air-pct" [class.text-success]="att.passed" [class.text-rose]="!att.passed && att.status !== 'IN_PROGRESS'">
                        {{ att.percentage }}%
                      </span>
                      <span class="badge" [ngClass]="att.passed ? 'badge-success' : (att.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-danger')">
                        {{ att.passed ? 'PASSED' : att.status }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="txt-muted text-center py-3">No examination records logged for this candidate.</p>
            }

            <div class="modal-footer">
              <button class="btn btn-outline btn-sm" (click)="selectedStudentDetail = null">Close Profile</button>
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
      max-width: 480px;
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

    .student-cell { display: flex; align-items: center; gap: 12px; }
    .avatar-sm {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #007BA7, #FF2D95);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.82rem; font-weight: 800; color: white;
      flex-shrink: 0;
    }
    .student-meta { display: flex; flex-direction: column; gap: 2px; }
    .student-name { font-weight: 600; color: white; }
    .student-id-sub { font-size: 0.7rem; color: rgba(255, 255, 255, 0.4); font-family: 'Space Grotesk', monospace; }

    .username-tag { font-family: 'Space Grotesk', monospace; color: #0099CC; font-size: 0.86rem; }
    .email-text { color: rgba(255, 255, 255, 0.7); font-size: 0.86rem; }

    .status-toggle-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 50px;
      font-size: 0.76rem; font-weight: 700;
      background: rgba(255, 23, 68, 0.1);
      border: 1px solid rgba(255, 23, 68, 0.3);
      color: #FF5252; cursor: pointer; transition: all 0.15s;
    }
    .status-toggle-btn.is-active {
      background: rgba(0, 230, 118, 0.1);
      border-color: rgba(0, 230, 118, 0.3);
      color: #00E676;
    }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .score-txt { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: white; }
    .date-text { display: inline-flex; align-items: center; gap: 5px; font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }

    .badge-gray { background: rgba(255, 255, 255, 0.06); color: rgba(255, 255, 255, 0.7); }
    .badge-success { background: rgba(0, 230, 118, 0.15); color: #00E676; border: 1px solid rgba(0, 230, 118, 0.3); }
    .badge-danger { background: rgba(255, 23, 68, 0.15); color: #FF1744; border: 1px solid rgba(255, 23, 68, 0.3); }
    .badge-warning { background: rgba(255, 179, 0, 0.15); color: #FFB300; border: 1px solid rgba(255, 179, 0, 0.3); }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .py-5 { padding: 48px 0; }
    .py-3 { padding: 24px 0; }
    .txt-muted { color: rgba(255, 255, 255, 0.5); font-size: 0.88rem; }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
      z-index: 1000; display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .detail-card {
      width: 100%; max-width: 660px;
      padding: 32px; border-radius: 20px; background: #141414;
      max-height: 90vh; display: flex; flex-direction: column;
    }
    .modal-user-header { display: flex; align-items: center; gap: 14px; }
    .avatar-lg {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, #007BA7, #FF2D95);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; font-weight: 800; color: white;
    }
    .modal-user-header h3 { font-size: 1.3rem; color: white; margin: 0 0 2px 0; }
    .user-sub { font-size: 0.84rem; color: rgba(255, 255, 255, 0.5); }
    .close-btn { background: none; border: none; color: rgba(255, 255, 255, 0.5); cursor: pointer; }

    .student-kpis {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
      margin: 20px 0;
    }
    .skpi-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px; padding: 12px;
      display: flex; flex-direction: column; align-items: center; gap: 2px;
    }
    .skpi-lbl { font-size: 0.7rem; color: rgba(255, 255, 255, 0.45); text-transform: uppercase; font-weight: 700; }
    .skpi-val { font-family: 'Space Grotesk', sans-serif; font-size: 1.35rem; font-weight: 800; color: white; }
    .text-success { color: #00E676; }
    .text-rose { color: #FF2D95; }

    .modal-section-title { font-size: 0.94rem; color: white; margin: 10px 0 12px 0; font-weight: 700; }
    .detail-attempts-list {
      flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
      padding-right: 4px; margin-bottom: 20px;
    }
    .att-item-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .air-info { display: flex; flex-direction: column; gap: 2px; }
    .air-title { color: white; font-size: 0.9rem; }
    .air-date { font-size: 0.74rem; color: rgba(255, 255, 255, 0.4); }
    .air-score { display: flex; align-items: center; gap: 10px; }
    .air-marks { font-size: 0.84rem; color: rgba(255, 255, 255, 0.6); }
    .air-pct { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.9rem; }

    .modal-footer { display: flex; justify-content: flex-end; }
  `]
})
export class StudentManagementComponent implements OnInit {
  students: AdminStudent[] = [];
  filteredStudents: AdminStudent[] = [];
  searchQuery = '';
  loading = signal<boolean>(true);

  selectedStudentDetail: any = null;

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading.set(true);
    this.quizService.adminGetStudents().subscribe({
      next: (data) => {
        this.students = data || [];
        this.filterStudents();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterStudents(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredStudents = this.students;
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredStudents = this.students.filter(s =>
        (s.fullName && s.fullName.toLowerCase().includes(q)) ||
        (s.username && s.username.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
      );
    }
  }

  toggleStatus(student: AdminStudent): void {
    const nextState = !student.active;
    this.quizService.adminToggleStudentStatus(student.id, nextState).subscribe({
      next: () => {
        student.active = nextState;
      },
      error: () => alert('Failed to update student account status.')
    });
  }

  viewStudentDetail(studentId: number): void {
    this.quizService.adminGetStudentDetail(studentId).subscribe({
      next: (res) => {
        this.selectedStudentDetail = res;
      },
      error: () => alert('Failed to retrieve student details.')
    });
  }

  getInitials(name: string): string {
    return (name || 'S').substring(0, 2).toUpperCase();
  }
}
