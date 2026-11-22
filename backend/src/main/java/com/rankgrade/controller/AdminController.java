package com.rankgrade.controller;

import com.rankgrade.dto.request.QuestionRequest;
import com.rankgrade.dto.request.QuizRequest;
import com.rankgrade.dto.response.ApiResponse;
import com.rankgrade.dto.response.AttemptResultResponse;
import com.rankgrade.dto.response.QuizResponse;
import com.rankgrade.entity.*;
import com.rankgrade.exception.BusinessException;
import com.rankgrade.exception.ResourceNotFoundException;
import com.rankgrade.repository.*;
import com.rankgrade.service.impl.AttemptService;
import com.rankgrade.service.impl.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final QuizService quizService;
    private final AttemptService attemptService;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final QuizAttemptRepository attemptRepository;

    public AdminController(
            QuizService quizService,
            AttemptService attemptService,
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            QuizAttemptRepository attemptRepository) {
        this.quizService = quizService;
        this.attemptService = attemptService;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.attemptRepository = attemptRepository;
    }

    // ─── Quiz Management ──────────────────────────────────────────────────────

    @GetMapping("/quizzes")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getAllQuizzes() {
        return ResponseEntity.ok(ApiResponse.success(quizService.getAllQuizzes()));
    }

    @PostMapping("/quizzes")
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(
            @Valid @RequestBody QuizRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = resolveUserId(userDetails);
        Quiz quiz = Quiz.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .timeLimitMinutes(req.getTimeLimitMinutes())
                .passingMarks(req.getPassingMarks())
                .maxAttempts(req.getMaxAttempts())
                .shuffleQuestions(req.isShuffleQuestions())
                .showResultImmediately(req.isShowResultImmediately())
                .build();
        QuizResponse created = quizService.createQuiz(quiz, req.getCategoryId(), adminId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quiz created", created));
    }

    @PutMapping("/quizzes/{id}")
    public ResponseEntity<ApiResponse<QuizResponse>> updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody QuizRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Quiz updated", quizService.updateQuiz(id, req)));
    }

    @PatchMapping("/quizzes/{id}/status")
    public ResponseEntity<ApiResponse<QuizResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            Quiz.QuizStatus status = Quiz.QuizStatus.valueOf(body.get("status").toUpperCase());
            return ResponseEntity.ok(ApiResponse.success(quizService.updateQuizStatus(id, status)));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status: " + body.get("status"));
        }
    }

    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz deleted", null));
    }

    // ─── Question Management ──────────────────────────────────────────────────

    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<ApiResponse<List<Question>>> getQuestions(@PathVariable Long quizId) {
        return ResponseEntity.ok(ApiResponse.success(
                questionRepository.findByQuizIdOrderByQuestionOrderAsc(quizId)));
    }

    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<ApiResponse<Question>> addQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody QuestionRequest req) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));

        boolean hasCorrectOption = req.getOptions().stream()
                .anyMatch(QuestionRequest.OptionRequest::isCorrect);
        if (!hasCorrectOption) {
            throw new BusinessException("At least one option must be marked as correct");
        }

        long currentCount = questionRepository.countByQuizId(quizId);
        Question question = Question.builder()
                .quiz(quiz)
                .questionText(req.getQuestionText())
                .marks(req.getMarks())
                .questionOrder(req.getQuestionOrder() != null
                        ? req.getQuestionOrder() : (int) currentCount + 1)
                .explanation(req.getExplanation())
                .build();

        List<QuestionOption> options = req.getOptions().stream()
                .map(o -> QuestionOption.builder()
                        .question(question)
                        .optionText(o.getOptionText())
                        .correct(o.isCorrect())
                        .optionOrder(o.getOptionOrder())
                        .build())
                .collect(Collectors.toList());
        question.setOptions(options);

        Question saved = questionRepository.save(question);
        recalculateQuizMarks(quiz);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Question added", saved));
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponse<Question>> updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody QuestionRequest req) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", questionId));

        boolean hasCorrectOption = req.getOptions().stream()
                .anyMatch(QuestionRequest.OptionRequest::isCorrect);
        if (!hasCorrectOption) {
            throw new BusinessException("At least one option must be marked as correct");
        }

        question.setQuestionText(req.getQuestionText());
        question.setMarks(req.getMarks());
        question.setExplanation(req.getExplanation());
        if (req.getQuestionOrder() != null) {
            question.setQuestionOrder(req.getQuestionOrder());
        }

        question.getOptions().clear();
        for (QuestionRequest.OptionRequest o : req.getOptions()) {
            question.getOptions().add(QuestionOption.builder()
                    .question(question)
                    .optionText(o.getOptionText())
                    .correct(o.isCorrect())
                    .optionOrder(o.getOptionOrder())
                    .build());
        }

        Question saved = questionRepository.save(question);
        recalculateQuizMarks(question.getQuiz());
        return ResponseEntity.ok(ApiResponse.success("Question updated", saved));
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", questionId));
        Quiz quiz = question.getQuiz();
        questionRepository.delete(question);
        recalculateQuizMarks(quiz);
        return ResponseEntity.ok(ApiResponse.success("Question deleted", null));
    }

    // ─── Category Management ──────────────────────────────────────────────────

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCategories() {
        List<Map<String, Object>> list = categoryRepository.findAll().stream().map(cat -> {
            long qCount = quizRepository.countByCategoryId(cat.getId());
            Map<String, Object> m = new HashMap<>();
            m.put("id", cat.getId());
            m.put("name", cat.getName());
            m.put("description", cat.getDescription() != null ? cat.getDescription() : "");
            m.put("iconClass", cat.getIconClass() != null ? cat.getIconClass() : "");
            m.put("active", cat.isActive());
            m.put("quizCount", qCount);
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            throw new BusinessException("Category name is required");
        }
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new BusinessException("Category already exists: " + name);
        }
        Category cat = Category.builder()
                .name(name.trim())
                .description(body.get("description"))
                .iconClass(body.get("iconClass"))
                .active(true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created", categoryRepository.save(cat)));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        String newName = body.get("name");
        if (newName != null && !newName.trim().equalsIgnoreCase(cat.getName())) {
            if (categoryRepository.existsByNameIgnoreCase(newName.trim())) {
                throw new BusinessException("Category already exists: " + newName.trim());
            }
            cat.setName(newName.trim());
        }
        if (body.containsKey("description")) {
            cat.setDescription(body.get("description"));
        }
        return ResponseEntity.ok(ApiResponse.success("Category updated", categoryRepository.save(cat)));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        long qCount = quizRepository.countByCategoryId(id);
        if (qCount > 0) {
            throw new BusinessException("Cannot delete category because " + qCount + " quizzes are assigned to it.");
        }
        categoryRepository.delete(cat);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }

    // ─── Student Management ───────────────────────────────────────────────────

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStudents() {
        List<Map<String, Object>> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.STUDENT)
                .map(u -> {
                    List<QuizAttempt> userAttempts = attemptRepository.findByStudentIdOrderByStartedAtDesc(u.getId());
                    double avgScore = userAttempts.stream()
                            .filter(a -> a.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS && a.getPercentage() != null)
                            .mapToDouble(QuizAttempt::getPercentage)
                            .average().orElse(0.0);

                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("username", u.getUsername());
                    map.put("email", u.getEmail());
                    map.put("fullName", u.getFullName() != null ? u.getFullName() : "");
                    map.put("active", u.isActive());
                    map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
                    map.put("attemptCount", userAttempts.size());
                    map.put("averageScore", Math.round(avgScore * 10.0) / 10.0);
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @PatchMapping("/students/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleStudentStatus(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Boolean> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));
        if (user.getRole() != User.Role.STUDENT) {
            throw new BusinessException("Cannot toggle status of non-student users");
        }
        if (body != null && body.containsKey("active")) {
            user.setActive(body.get("active"));
        } else {
            user.setActive(!user.isActive());
        }
        User saved = userRepository.save(user);

        Map<String, Object> res = new HashMap<>();
        res.put("id", saved.getId());
        res.put("username", saved.getUsername());
        res.put("active", saved.isActive());
        return ResponseEntity.ok(ApiResponse.success("Student status updated", res));
    }

    @GetMapping("/students/{id}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentDetail(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));
        List<QuizAttempt> attempts = attemptRepository.findByStudentIdOrderByStartedAtDesc(id);
        long completedCount = attempts.stream()
                .filter(a -> a.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS).count();
        long passedCount = attempts.stream().filter(a -> Boolean.TRUE.equals(a.getPassed())).count();
        double avgScore = attempts.stream()
                .filter(a -> a.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS && a.getPercentage() != null)
                .mapToDouble(QuizAttempt::getPercentage)
                .average().orElse(0.0);

        List<Map<String, Object>> attemptList = attempts.stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("attemptId", a.getId());
            m.put("quizTitle", a.getQuiz() != null ? a.getQuiz().getTitle() : "Untitled");
            m.put("status", a.getStatus().name());
            m.put("scoreObtained", a.getScoreObtained() != null ? a.getScoreObtained() : 0);
            m.put("totalMarks", a.getTotalMarks() != null ? a.getTotalMarks() : 0);
            m.put("percentage", a.getPercentage() != null ? a.getPercentage() : 0.0);
            m.put("passed", a.getPassed() != null ? a.getPassed() : false);
            m.put("startedAt", a.getStartedAt() != null ? a.getStartedAt().toString() : "");
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> res = new HashMap<>();
        res.put("id", user.getId());
        res.put("username", user.getUsername());
        res.put("email", user.getEmail());
        res.put("fullName", user.getFullName() != null ? user.getFullName() : "");
        res.put("active", user.isActive());
        res.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
        res.put("totalAttempts", attempts.size());
        res.put("completedAttempts", completedCount);
        res.put("passedAttempts", passedCount);
        res.put("averageScore", Math.round(avgScore * 10.0) / 10.0);
        res.put("attempts", attemptList);

        return ResponseEntity.ok(ApiResponse.success(res));
    }

    // ─── Attempts & Results Management ────────────────────────────────────────

    @GetMapping("/attempts")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllAttempts() {
        return ResponseEntity.ok(ApiResponse.success(attemptService.getAdminAllAttempts()));
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<ApiResponse<AttemptResultResponse>> getAttemptDetail(@PathVariable Long attemptId) {
        return ResponseEntity.ok(ApiResponse.success(attemptService.getAdminAttemptResult(attemptId)));
    }

    // ─── Analytics & Reports ──────────────────────────────────────────────────

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(attemptService.getAdminAnalytics()));
    }

    // ─── Dashboard Stats ──────────────────────────────────────────────────────

    @GetMapping("/stats")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        long totalStudents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.STUDENT).count();
        long totalQuizzes = quizRepository.count();
        long publishedQuizzes = quizRepository.findByStatus(Quiz.QuizStatus.PUBLISHED).size();
        long draftQuizzes = quizRepository.findByStatus(Quiz.QuizStatus.DRAFT).size();
        long archivedQuizzes = quizRepository.findByStatus(Quiz.QuizStatus.ARCHIVED).size();

        List<QuizAttempt> allAttempts = attemptRepository.findAll();
        List<QuizAttempt> completed = allAttempts.stream()
                .filter(a -> a.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS)
                .collect(Collectors.toList());

        long completedCount = completed.size();
        long passCount = completed.stream().filter(a -> Boolean.TRUE.equals(a.getPassed())).count();
        double overallPassRate = completedCount > 0
                ? Math.round(((double) passCount / completedCount) * 1000.0) / 10.0 : 0.0;
        double averageScore = completedCount > 0
                ? Math.round(completed.stream()
                    .mapToDouble(a -> a.getPercentage() != null ? a.getPercentage() : 0.0)
                    .average().orElse(0.0) * 10.0) / 10.0 : 0.0;

        // Recent 8 attempts
        List<Map<String, Object>> recentAttempts = allAttempts.stream()
                .sorted((a, b) -> {
                    if (a.getStartedAt() == null || b.getStartedAt() == null) return 0;
                    return b.getStartedAt().compareTo(a.getStartedAt());
                })
                .limit(8)
                .map(attempt -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", attempt.getId());
                    m.put("studentName", attempt.getStudent() != null
                            ? (attempt.getStudent().getFullName() != null && !attempt.getStudent().getFullName().isBlank()
                                ? attempt.getStudent().getFullName() : attempt.getStudent().getUsername())
                            : "Unknown");
                    m.put("quizTitle", attempt.getQuiz() != null ? attempt.getQuiz().getTitle() : "Untitled");
                    m.put("score", attempt.getScoreObtained() != null ? attempt.getScoreObtained() : 0);
                    m.put("totalMarks", attempt.getTotalMarks() != null ? attempt.getTotalMarks() : 0);
                    m.put("percentage", attempt.getPercentage() != null ? attempt.getPercentage() : 0.0);
                    m.put("passed", attempt.getPassed() != null ? attempt.getPassed() : false);
                    m.put("status", attempt.getStatus().name());
                    m.put("submittedAt", attempt.getSubmittedAt() != null ? attempt.getSubmittedAt().toString() : "");
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("totalQuizzes", totalQuizzes);
        stats.put("publishedQuizzes", publishedQuizzes);
        stats.put("draftQuizzes", draftQuizzes);
        stats.put("archivedQuizzes", archivedQuizzes);
        stats.put("totalAttempts", allAttempts.size());
        stats.put("completedAttempts", completedCount);
        stats.put("overallPassRate", overallPassRate);
        stats.put("averageScore", averageScore);
        stats.put("recentAttempts", recentAttempts);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void recalculateQuizMarks(Quiz quiz) {
        List<Question> questions = questionRepository.findByQuizIdOrderByQuestionOrderAsc(quiz.getId());
        int total = questions.stream().mapToInt(q -> q.getMarks() != null ? q.getMarks() : 1).sum();
        quiz.setTotalMarks(total);
        quizRepository.save(quiz);
    }

    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .or(() -> userRepository.findByUsername(userDetails.getUsername()))
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + userDetails.getUsername()))
                .getId();
    }
}
