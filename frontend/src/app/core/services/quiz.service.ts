import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, Quiz, Question, Category, StartAttemptResponse,
         SubmitResult, AttemptResult, AttemptHistory, Analytics, ActiveAttempt } from '../models/models';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly BASE = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ── Public/Student ─────────────────────────────────────────

  getPublishedQuizzes(): Observable<Quiz[]> {
    return this.http.get<ApiResponse<Quiz[]>>(`${this.BASE}/quizzes/published`)
      .pipe(map(r => r.data));
  }

  getPublishedQuiz(id: number): Observable<Quiz> {
    return this.http.get<ApiResponse<Quiz>>(`${this.BASE}/quizzes/published/${id}`)
      .pipe(map(r => r.data));
  }

  getByCategory(categoryId: number): Observable<Quiz[]> {
    return this.http.get<ApiResponse<Quiz[]>>(`${this.BASE}/quizzes/published/category/${categoryId}`)
      .pipe(map(r => r.data));
  }

  startAttempt(quizId: number): Observable<StartAttemptResponse> {
    return this.http.post<ApiResponse<StartAttemptResponse>>(`${this.BASE}/quizzes/${quizId}/start`, {})
      .pipe(map(r => r.data));
  }

  saveAnswer(attemptId: number, questionId: number, selectedOptionId: number | null): Observable<any> {
    return this.http.post<ApiResponse<string>>(`${this.BASE}/quizzes/attempts/${attemptId}/answer`,
      { questionId, selectedOptionId });
  }

  submitAttempt(attemptId: number): Observable<SubmitResult> {
    return this.http.post<ApiResponse<SubmitResult>>(`${this.BASE}/quizzes/attempts/${attemptId}/submit`, {})
      .pipe(map(r => r.data));
  }

  getResult(attemptId: number): Observable<AttemptResult> {
    return this.http.get<ApiResponse<AttemptResult>>(`${this.BASE}/quizzes/attempts/${attemptId}/result`)
      .pipe(map(r => r.data));
  }

  // ── Student analytics ──────────────────────────────────────

  getActiveAttempts(): Observable<ActiveAttempt[]> {
    return this.http.get<ApiResponse<ActiveAttempt[]>>(`${this.BASE}/student/active-attempts`)
      .pipe(map(r => r.data));
  }

  getHistory(): Observable<AttemptHistory[]> {
    return this.http.get<ApiResponse<AttemptHistory[]>>(`${this.BASE}/student/history`)
      .pipe(map(r => r.data));
  }

  getAnalytics(): Observable<Analytics> {
    return this.http.get<ApiResponse<Analytics>>(`${this.BASE}/student/analytics`)
      .pipe(map(r => r.data));
  }

  // ── Categories ──────────────────────────────────────────────

  getCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.BASE}/categories`)
      .pipe(map(r => r.data));
  }

  // ── Admin ──────────────────────────────────────────────────

  adminGetAllQuizzes(): Observable<Quiz[]> {
    return this.http.get<ApiResponse<Quiz[]>>(`${this.BASE}/admin/quizzes`)
      .pipe(map(r => r.data));
  }

  adminCreateQuiz(data: any): Observable<Quiz> {
    return this.http.post<ApiResponse<Quiz>>(`${this.BASE}/admin/quizzes`, data)
      .pipe(map(r => r.data));
  }

  adminUpdateQuiz(quizId: number, data: any): Observable<Quiz> {
    return this.http.put<ApiResponse<Quiz>>(`${this.BASE}/admin/quizzes/${quizId}`, data)
      .pipe(map(r => r.data));
  }

  adminUpdateStatus(quizId: number, status: string): Observable<Quiz> {
    return this.http.patch<ApiResponse<Quiz>>(`${this.BASE}/admin/quizzes/${quizId}/status`, { status })
      .pipe(map(r => r.data));
  }

  adminDeleteQuiz(quizId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.BASE}/admin/quizzes/${quizId}`);
  }

  adminAddQuestion(quizId: number, data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.BASE}/admin/quizzes/${quizId}/questions`, data)
      .pipe(map(r => r.data));
  }

  adminUpdateQuestion(questionId: number, data: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.BASE}/admin/questions/${questionId}`, data)
      .pipe(map(r => r.data));
  }

  adminGetQuestions(quizId: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.BASE}/admin/quizzes/${quizId}/questions`)
      .pipe(map(r => r.data));
  }

  adminDeleteQuestion(questionId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.BASE}/admin/questions/${questionId}`);
  }

  adminGetCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.BASE}/admin/categories`)
      .pipe(map(r => r.data));
  }

  adminCreateCategory(data: { name: string; description?: string }): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.BASE}/admin/categories`, data)
      .pipe(map(r => r.data));
  }

  adminUpdateCategory(catId: number, data: { name: string; description?: string }): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.BASE}/admin/categories/${catId}`, data)
      .pipe(map(r => r.data));
  }

  adminDeleteCategory(catId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.BASE}/admin/categories/${catId}`);
  }

  adminGetStudents(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.BASE}/admin/students`)
      .pipe(map(r => r.data));
  }

  adminToggleStudentStatus(studentId: number, active?: boolean): Observable<any> {
    const payload = active !== undefined ? { active } : {};
    return this.http.patch<ApiResponse<any>>(`${this.BASE}/admin/students/${studentId}/status`, payload)
      .pipe(map(r => r.data));
  }

  adminGetStudentDetail(studentId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.BASE}/admin/students/${studentId}`)
      .pipe(map(r => r.data));
  }

  adminGetAllAttempts(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.BASE}/admin/attempts`)
      .pipe(map(r => r.data));
  }

  adminGetAttemptDetail(attemptId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.BASE}/admin/attempts/${attemptId}`)
      .pipe(map(r => r.data));
  }

  adminGetAnalytics(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.BASE}/admin/analytics`)
      .pipe(map(r => r.data));
  }

  adminGetStats(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.BASE}/admin/stats`)
      .pipe(map(r => r.data));
  }
}
