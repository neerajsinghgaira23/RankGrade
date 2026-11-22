package com.rankgrade.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private String categoryName;
    private Long categoryId;
    private Integer timeLimitMinutes;
    private Integer totalMarks;
    private Integer passingMarks;
    private String status;
    private Integer maxAttempts;
    private boolean shuffleQuestions;
    private boolean showResultImmediately;
    private int questionCount;
    private LocalDateTime createdAt;
}
