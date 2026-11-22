// Core domain models matching the backend entities

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: 'STUDENT' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'ADMIN';
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  iconClass?: string;
  active?: boolean;
  quizCount?: number;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  timeLimitMinutes: number;
  totalMarks: number;
  passingMarks?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResultImmediately: boolean;
  questionCount: number;
  createdAt: string;
}

export interface QuizOption {
  id: number;
  optionText: string;
  optionOrder: number;
}

export interface Question {
  id: number;
  questionText: string;
  marks: number;
  questionOrder: number;
  options: QuizOption[];
}

export interface StartAttemptResponse {
  attemptId: number;
  startedAt: string;
  timeLimitMinutes: number;
  questions: Question[];
  savedAnswers?: { [questionId: string]: number };
}

export interface ActiveAttempt {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  categoryName: string;
  startedAt: string;
  timeLimitMinutes: number;
  remainingSeconds: number;
  answeredCount: number;
  totalQuestions: number;
}

export interface SubmitResult {
  attemptId: number;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
}

export interface AttemptResult {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  startedAt: string;
  submittedAt: string;
  timeTakenSeconds: number;
  status: string;
  scoreObtained: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  answers: AnswerReview[];
}

export interface AnswerReview {
  questionId: number;
  questionText: string;
  selectedOptionId: number | null;
  selectedOptionText: string | null;
  correctOptionId: number;
  correctOptionText: string;
  correct: boolean;
  marksAwarded: number;
  explanation?: string;
}

export interface AttemptHistory {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  status: string;
  submittedAt: string;
}

export interface Analytics {
  totalAttempts: number;
  passCount: number;
  failCount: number;
  passRate: number;
  averagePercentage: number;
  bestPercentage: number;
  scoreTrend: ScoreTrendItem[];
}

export interface ScoreTrendItem {
  quizTitle: string;
  percentage: number;
  submittedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AdminAttempt {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentUsername: string;
  quizId: number;
  quizTitle: string;
  categoryName: string;
  startedAt: string;
  submittedAt: string;
  timeTakenSeconds: number;
  status: string;
  scoreObtained: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
}

export interface AdminAnalytics {
  totalAttempts: number;
  completedAttempts: number;
  passCount: number;
  failCount: number;
  overallPassRate: number;
  averageScore: number;
  scoreDistribution: { [band: string]: number };
  categoryStats: {
    categoryName: string;
    attemptCount: number;
    passRate: number;
    averageScore: number;
  }[];
  quizStats: {
    quizTitle: string;
    attemptCount: number;
    passRate: number;
    averageScore: number;
  }[];
}

export interface AdminStudent {
  id: number;
  username: string;
  email: string;
  fullName: string;
  active: boolean;
  createdAt: string;
  attemptCount: number;
  averageScore?: number;
}

