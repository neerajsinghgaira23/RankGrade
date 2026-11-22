# ⚡ RankGrade — Online Quiz and Performance Analyzer

> **BCA Final-Year Academic Capstone Project**  
> A Next-Generation Full-Stack Web Platform for Computer-Based Testing and Performance Telemetry.

---

## 🌟 Tech Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | Angular 21, TypeScript, Chart.js, SCSS Glassmorphic Design System |
| **Backend** | Java 21, Spring Boot 3.3.4 (parent 3.4.1), Spring Security 6, JWT, Spring Data JPA |
| **Database** | MySQL 8.0+ (InnoDB, UTF-8 mb4) |
| **Build & Tooling** | Apache Maven 3.9.9 (Portable Wrapper), Angular CLI, npm |
| **Brand Colors** | Jet Black (`#0A0A0A`), Cerulean Blue (`#007BA7`), Neon Rose (`#FF2D95`) |

---

## 📋 Software Prerequisites

Ensure the following tools are installed on your workstation:
- **Java Development Kit (JDK)**: Java 21 LTS (64-bit)
- **Node.js**: v18.x or v20.x+ & npm 9+
- **MySQL Database Server**: MySQL 8.0+ running on port `3306`
- **PowerShell / Terminal**: Windows PowerShell 5.1+ or PowerShell 7+

---

## 🚀 Pre-Configured Demo Credentials

On first run, `DataInitializer.java` automatically seeds the database with the following demo accounts:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Author quizzes, manage questions, view students & categories |
| **Student** | `student` | `student123` | Take live exams, view history, and inspect score diagnostics |

*Note: New students can also self-register via the **Create Account** page (`/register`). Public registration is strictly restricted to the `STUDENT` role.*

---

## ⚙️ Quick Start Guide

### Step 1: Database Setup
Ensure MySQL is running on port `3306`. Connect to MySQL and create the database schema:
```sql
CREATE DATABASE IF NOT EXISTS rankgrade_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
*(The schema and seed data are automatically initialized on startup by Spring Data JPA Hibernate and `DataInitializer.java`).*

If you need to adjust database credentials or JWT settings, edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rankgrade_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
rankgrade.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
rankgrade.jwt.expiration-ms=86400000
```

### Step 2: Start the Backend (Spring Boot 3)
Run either from the root folder or from `backend/`:
```powershell
# From project root:
.\mvnw.cmd spring-boot:run

# Or from backend folder:
cd backend
.\mvnw.cmd spring-boot:run
```
The REST API server will launch on: **`http://localhost:8080/api`**

### Step 3: Start the Frontend (Angular 21)
In a separate terminal, navigate to `frontend/` and launch the dev server:
```powershell
cd frontend
npm start
```
The client application will launch on: **`http://localhost:4200`**

---

## 🧪 Running Automated Tests

### Backend Unit & Integration Tests
Run from the workspace root or `backend/`:
```powershell
.\mvnw.cmd clean test
```

### Frontend Production Build
Run from `frontend/`:
```powershell
cd frontend
npm run build
```

### Complete End-to-End API Integration Suite
We provide an automated verification suite that validates authentication, exam timers, answer protection, result calculation, analytics, and security isolation:
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\06362\.gemini\antigravity-ide\brain\5bfb6caf-45a4-49ea-91ab-c1aac8f6556d\scratch\test-apis.ps1"
```

---

## 📬 Postman API Collection

A complete Postman collection is located at:
`postman/RankGrade_API_Collection.json`

### Import & Execution Steps:
1. Open **Postman**.
2. Click **Import** and select `postman/RankGrade_API_Collection.json`.
3. Collection variables are pre-configured:
   - `baseUrl`: `http://localhost:8080/api`
   - `token`: (Automatically updated or paste your Bearer token here)
4. Execute **Authentication -> Login (Admin)** or **Login (Student)**.
5. Copy the returned `token` from `data.token` into the collection variable `token`.
6. Run the student and admin workflows:
   - Browse quizzes (`GET /quizzes/published`)
   - Start attempt (`POST /quizzes/{id}/start`)
   - Save answer (`POST /quizzes/attempts/{id}/answer`)
   - Submit attempt (`POST /quizzes/attempts/{id}/submit`)
   - Review results & explanations (`GET /quizzes/attempts/{id}/result`)
   - View history & analytics (`GET /student/history`, `GET /student/analytics`)

---

## 📂 Project Directory Structure

```
RankGrade/
├── mvnw.cmd                  # Root convenience Maven wrapper
├── mvnw.ps1                  # Root PowerShell runner
├── backend/                  # Spring Boot 3 + Java 21 REST API
│   ├── mvnw.cmd              # Windows Maven wrapper
│   ├── mvnw.ps1              # PowerShell Maven wrapper
│   ├── pom.xml               # Maven build file with Java 21 configuration
│   └── src/main/java/com/rankgrade/
│       ├── config/           # SecurityConfig, CorsConfig, DataInitializer
│       ├── controller/       # AuthController, QuizController, StudentController, AdminController
│       ├── dto/              # Request / Response DTO models
│       ├── entity/           # JPA Entities (User, Category, Quiz, Question, Option, Attempt)
│       ├── repository/       # Repositories with JOIN FETCH optimized queries
│       ├── security/         # JwtAuthFilter, JwtUtils, UserDetailsServiceImpl
│       └── service/          # Business logic, exam grading, telemetry services
├── frontend/                 # Angular 21 SPA Client
│   ├── src/app/
│   │   ├── core/             # AuthService, QuizService, Guards, JWT Interceptor
│   │   ├── features/
│   │   │   ├── admin/        # Dashboard, Quiz Management, Question Editor, Students
│   │   │   ├── auth/         # Login & Registration components
│   │   │   ├── landing/      # Glassmorphic Landing Page with CTA
│   │   │   └── student/      # Exam interface, Timer, Review, Analytics, History
│   │   └── shared/           # Sticky Navbar, Footer, UI Cards, Badges
│   └── src/styles.scss       # RankGrade Theme (Jet Black #0A0A0A, Cerulean #007BA7, Rose #FF2D95)
├── database/                 # MySQL DDL Schema scripts
├── docs/                     # Architectural diagrams and technical viva report
└── postman/                  # Ready-to-import Postman API Collection
```

---

## 🛠️ Troubleshooting Common Errors

### 1. `CommunicationsException: Communications link failure`
- **Cause**: MySQL server is not running or port `3306` is blocked.
- **Fix**: Open Windows Services (`services.msc`) and ensure `MySQL80` (or `MySQL`) is started. Verify password matches `application.properties`.

### 2. `Address already in use: bind (Port 8080 or 4200)`
- **Cause**: A previous instance is still bound to the port.
- **Fix**: Run in PowerShell:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
  ```

### 3. `LazyInitializationException: could not initialize proxy`
- **Cause**: Accessing lazy relationships outside transactional context.
- **Fix**: All repository queries for student history and attempt results now utilize `JOIN FETCH qa.quiz` and `@Transactional(readOnly = true)` annotations.

### 4. `The Java feature 'Flexible Constructor Bodies' is only available with source level 25`
- **Cause**: Eclipse JDT/ecj compiler mismatch with Lombok `@RequiredArgsConstructor`.
- **Fix**: All backend controllers and services use explicit standard Java constructors and `maven-compiler-plugin` explicitly set to Java 21 release.
