package com.rankgrade.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResultResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Long timeTakenSeconds;
    private String status;
    private Integer scoreObtained;
    private Integer totalMarks;
    private Double percentage;
    private Boolean passed;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer unansweredCount;
    private List<AnswerReviewItem> answers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerReviewItem {
        private Long questionId;
        private String questionText;
        private Long selectedOptionId;
        private String selectedOptionText;
        private Long correctOptionId;
        private String correctOptionText;
        private Boolean correct;
        private Integer marksAwarded;
        private String explanation;
    }
}
