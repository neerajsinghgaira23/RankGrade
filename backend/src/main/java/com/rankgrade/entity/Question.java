package com.rankgrade.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Quiz quiz;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Integer marks = 1;

    @Column(name = "question_order")
    private Integer questionOrder;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @OrderBy("optionOrder ASC")
    private List<QuestionOption> options;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<AttemptAnswer> attemptAnswers;
}
