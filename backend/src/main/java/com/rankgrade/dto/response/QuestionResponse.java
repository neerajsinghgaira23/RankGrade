package com.rankgrade.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Student-facing question response — does NOT include isCorrect on options.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private String questionText;
    private Integer marks;
    private Integer questionOrder;
    private List<OptionResponse> options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionResponse {
        private Long id;
        private String optionText;
        private Integer optionOrder;
        // NOTE: isCorrect is intentionally OMITTED from this response
    }
}
