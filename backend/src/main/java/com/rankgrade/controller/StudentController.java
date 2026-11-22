package com.rankgrade.controller;

import com.rankgrade.dto.response.ApiResponse;
import com.rankgrade.entity.QuizAttempt;
import com.rankgrade.repository.UserRepository;
import com.rankgrade.service.impl.AttemptService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@Transactional(readOnly = true)
public class StudentController {

    private final AttemptService attemptService;
    private final UserRepository userRepository;

    public StudentController(AttemptService attemptService, UserRepository userRepository) {
        this.attemptService = attemptService;
        this.userRepository = userRepository;
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long studentId = resolveUserId(userDetails);
        List<QuizAttempt> history = attemptService.getStudentHistory(studentId);
        List<Map<String, Object>> result = history.stream().map(a -> Map.<String, Object>of(
                "attemptId", a.getId(),
                "quizId", a.getQuiz().getId(),
                "quizTitle", a.getQuiz().getTitle(),
                "score", a.getScoreObtained() != null ? a.getScoreObtained() : 0,
                "totalMarks", a.getTotalMarks() != null ? a.getTotalMarks() : 0,
                "percentage", a.getPercentage() != null ? a.getPercentage() : 0.0,
                "passed", a.getPassed() != null && a.getPassed(),
                "status", a.getStatus().name(),
                "submittedAt", a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : null
        )).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/active-attempts")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getActiveAttempts(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long studentId = resolveUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(attemptService.getActiveAttempts(studentId)));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long studentId = resolveUserId(userDetails);
        List<QuizAttempt> completed = attemptService.getStudentHistory(studentId);

        int totalAttempts = completed.size();
        long passed = completed.stream().filter(a -> a.getPassed() != null && a.getPassed()).count();
        double avgScore = completed.stream()
                .filter(a -> a.getPercentage() != null)
                .mapToDouble(QuizAttempt::getPercentage)
                .average().orElse(0.0);
        double bestScore = completed.stream()
                .filter(a -> a.getPercentage() != null)
                .mapToDouble(QuizAttempt::getPercentage)
                .max().orElse(0.0);

        // Score trend (last 10 attempts)
        List<Map<String, Object>> trend = completed.stream()
                .limit(10)
                .map(a -> Map.<String, Object>of(
                        "quizTitle", a.getQuiz().getTitle(),
                        "percentage", a.getPercentage() != null ? a.getPercentage() : 0.0,
                        "submittedAt", a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : ""
                ))
                .collect(Collectors.toList());

        Map<String, Object> analytics = Map.of(
                "totalAttempts", totalAttempts,
                "passCount", passed,
                "failCount", totalAttempts - passed,
                "passRate", totalAttempts > 0 ? Math.round((double) passed / totalAttempts * 100) : 0,
                "averagePercentage", Math.round(avgScore * 100.0) / 100.0,
                "bestPercentage", Math.round(bestScore * 100.0) / 100.0,
                "scoreTrend", trend
        );

        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .or(() -> userRepository.findByUsername(userDetails.getUsername()))
                .orElseThrow(() -> new com.rankgrade.exception.ResourceNotFoundException("User not found: " + userDetails.getUsername()))
                .getId();
    }
}
