import { Routes } from '@angular/router';
import { authGuard, adminGuard, studentGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'student',
    canActivate: [authGuard, studentGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/student/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'quizzes',
        loadComponent: () => import('./features/student/quiz-catalog/quiz-catalog.component').then(m => m.QuizCatalogComponent)
      },
      {
        path: 'quizzes/:id',
        loadComponent: () => import('./features/student/quiz-detail/quiz-detail.component').then(m => m.QuizDetailComponent)
      },
      {
        path: 'exam/:id',
        loadComponent: () => import('./features/student/exam/exam.component').then(m => m.ExamComponent)
      },
      {
        path: 'result/:attemptId',
        loadComponent: () => import('./features/student/result/result.component').then(m => m.ResultComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/student/history/history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/student/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/student/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'quizzes',
        loadComponent: () => import('./features/admin/quiz-management/quiz-management.component').then(m => m.QuizManagementComponent)
      },
      {
        path: 'quizzes/:id/questions',
        loadComponent: () => import('./features/admin/question-management/question-management.component').then(m => m.QuestionManagementComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./features/admin/student-management/student-management.component').then(m => m.StudentManagementComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/category-management/category-management.component').then(m => m.CategoryManagementComponent)
      },
      {
        path: 'attempts',
        loadComponent: () => import('./features/admin/attempts-management/admin-attempts.component').then(m => m.AdminAttemptsComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/admin/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
