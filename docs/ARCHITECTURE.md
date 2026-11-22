# RankGrade — Technical Architecture & Engineering Documentation

**Project**: BCA Final-Year Project  
**Title**: RankGrade — Online Quiz and Performance Analyzer  
**Stack**: Java 21, Spring Boot 3.3.4, Spring Security 6, JWT, Spring Data JPA, Hibernate, MySQL 8.0, Angular 21, Chart.js, SCSS  

---

## 1. System Overview

RankGrade is an enterprise-grade academic assessment and performance telemetry platform designed to conduct live, time-bounded examinations and provide students and faculty with deep diagnostic insights into learning outcomes.

### Core Modules:
1. **Authentication & Authorization Subsystem**: Stateless JWT token authentication with role-based access control (`ROLE_ADMIN`, `ROLE_STUDENT`).
2. **Curriculum & Assessment Engine**: Category taxonomy, draft-to-published quiz lifecycles, configurable time limits, scoring benchmarks, and question banks.
3. **Live Exam & Telemetry Engine**: Server-enforced time-bounded attempts, auto-save state synchronization, question shuffling, instant grading, and explanation reviews.
4. **Performance Analytics & Diagnostics Engine**: Historical attempt tracking, longitudinal score trajectories, passing ratios, and category proficiency breakdown.

---

## 2. Architecture Diagram

```
+-------------------------------------------------------------------------+
|                           CLIENT TIER                                   |
|  Angular 21 Standalone Components (Signals, Reactive Forms, Router)      |
|  - Landing Page             - Quiz Catalog        - Exam Engine         |
|  - Auth (Login/Register)    - Attempt History     - Result & Review     |
|  - Student Dashboard        - Analytics & Charts  - Admin Operations    |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTP/REST (JSON + Bearer JWT)
                                     v
+------------------------------------+------------------------------------+
|                       BACKEND APPLICATION TIER                          |
|  Spring Boot 3.3.4 (Java 21)                                            |
|                                                                         |
|  [Security Filter Chain] -> JwtAuthFilter -> UserDetailsService        |
|                                                                         |
|  [Controllers]                                                          |
|    - AuthController           - QuizController                          |
|    - StudentController        - CategoryController                      |
|    - AdminController                                                    |
|                                                                         |
|  [Service Layer & Business Rules]                                       |
|    - AuthServiceImpl          - QuizService                             |
|    - AttemptService (Live Exam, Auto-Submit, Score Computation)         |
|                                                                         |
|  [Persistence Layer (Spring Data JPA / Hibernate)]                      |
|    - UserRepository           - QuizRepository      - QuestionRepo      |
|    - QuizAttemptRepository    - AttemptAnswerRepo   - CategoryRepo      |
+------------------------------------+------------------------------------+
                                     |
                                     | JDBC (HikariCP)
                                     v
+------------------------------------+------------------------------------+
|                         DATABASE TIER                                   |
|  MySQL 8.0 Engine (InnoDB, Foreign Keys, UTF8MB4, ACID Compliant)       |
+-------------------------------------------------------------------------+
```

---

## 3. Database Entity Relationship

- `users` (1) ────< (N) `quizzes` (Created By)
- `users` (1) ────< (N) `quiz_attempts` (Student Attempts)
- `categories` (1) ────< (N) `quizzes`
- `quizzes` (1) ────< (N) `questions`
- `questions` (1) ────< (N) `question_options`
- `quiz_attempts` (1) ────< (N) `attempt_answers`
- `questions` (1) ────< (N) `attempt_answers`
- `question_options` (1) ────< (N) `attempt_answers` (Selected Option)

---

## 4. Key Security Controls

1. **Password Hashing**: BCrypt with salted rounds.
2. **Stateless JWT**: Signed using HMAC-SHA256 with 24-hour expiration.
3. **Role Segregation**:
   - `/api/admin/**`: Requires `ROLE_ADMIN`.
   - `/api/student/**`: Requires `ROLE_STUDENT`.
   - `/api/quizzes/**`: Authenticated access for attempts; public read for published summaries.
4. **CORS Policy**: Configured to restrict origin access to trusted frontend hosts (`http://localhost:4200`).
