package com.rankgrade.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizRequest {
    @NotBlank private String title;
    private String description;
    @NotNull private Long categoryId;
    @NotNull @Min(1) private Integer timeLimitMinutes;
    private Integer passingMarks;
    @Min(1) private Integer maxAttempts = 1;
    private boolean shuffleQuestions = false;
    private boolean showResultImmediately = true;
}
