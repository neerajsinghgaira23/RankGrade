package com.rankgrade.controller;

import com.rankgrade.dto.response.ApiResponse;
import com.rankgrade.dto.response.QuestionResponse;
import com.rankgrade.dto.response.QuizResponse;
import com.rankgrade.entity.QuizAttempt;
import com.rankgrade.entity.User;
import com.rankgrade.repository.UserRepository;
import com.rankgrade.service.impl.AttemptService;
import com.rankgrade.service.impl.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final AttemptService attemptService;
    private final UserRepository userRepository;

    public QuizController(
            QuizService quizService,
            AttemptService attemptService,
            UserRepository userRepository) {
        this.quizService = quizService;
        this.attemptService = attemptService;
        this.userRepository = userRepository;
    }

    @GetMapping("/published")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getPublished() {
        return ResponseEntity.ok(ApiResponse.success(quizService.getPublishedQuizzes()));
    }

    @GetMapping("/published/{id}")
    public ResponseEntity<ApiResponse<QuizResponse>> getPublishedQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getPublishedQuiz(id)));
    }

    @GetMapping("/published/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getPublishedByCategory(categoryId)));
    }

    /**
     * Start or resume a quiz attempt — returns attempt ID and question list (no answers).
     */
    @PostMapping("/{quizId}/start")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startAttempt(
            @PathVariable Long quizId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long studentId = resolveUserId(userDetails);
        QuizAttempt attempt = attemptService.startAttempt(studentId, quizId);
        List<QuestionResponse> questions = quizService.getQuestionsForAttempt(quizId);

        Map<Long, Long> savedAnswers = attemptService.getSavedAnswersMap(attempt.getId());

        Map<String, Object> responseData = new java.util.HashMap<>();
        responseData.put("attemptId", attempt.getId());
        responseData.put("startedAt", attempt.getStartedAt() != null ? attempt.getStartedAt().toString() : "");
        responseData.put("timeLimitMinutes", attempt.getQuiz().getTimeLimitMinutes());
        responseData.put("questions", questions);
        responseData.put("savedAnswers", savedAnswers);

        return ResponseEntity.ok(ApiResponse.success(responseData));
    }

    /**
     * Save a single answer during an active attempt.
     */
    @PostMapping("/attempts/{attemptId}/answer")
    public ResponseEntity<ApiResponse<String>> saveAnswer(
            @PathVariable Long attemptId,
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long studentId = resolveUserId(userDetails);
        attemptService.saveAnswer(attemptId, body.get("questionId"), body.get("selectedOptionId"), studentId);
        return ResponseEntity.ok(ApiResponse.success("Answer saved"));
    }

    /**
     * Submit a completed attempt.
     */
    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submit(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long studentId = resolveUserId(userDetails);
        QuizAttempt result = attemptService.submitAttempt(attemptId, studentId, false);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "attemptId", result.getId(),
                "score", result.getScoreObtained(),
                "totalMarks", result.getTotalMarks(),
                "percentage", result.getPercentage(),
                "passed", result.getPassed() != null && result.getPassed()
        )));
    }

    /**
     * Get full result with answer review (only after submission).
     */
    @GetMapping("/attempts/{attemptId}/result")
    public ResponseEntity<ApiResponse<Object>> getResult(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long studentId = resolveUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(attemptService.getResult(attemptId, studentId)));
    }

    private Long resolveUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .or(() -> userRepository.findByUsername(userDetails.getUsername()))
                .orElseThrow(() -> new com.rankgrade.exception.ResourceNotFoundException(
                        "User not found: " + userDetails.getUsername()));
        return user.getId();
    }
}
