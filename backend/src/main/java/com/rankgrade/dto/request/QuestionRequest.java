package com.rankgrade.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {
    @NotBlank private String questionText;
    private Integer marks = 1;
    private Integer questionOrder;
    private String explanation;

    @NotEmpty @Size(min = 2, max = 6)
    private List<OptionRequest> options;

    @Data
    public static class OptionRequest {
        @NotBlank private String optionText;
        private boolean correct = false;
        private Integer optionOrder;
    }
}
