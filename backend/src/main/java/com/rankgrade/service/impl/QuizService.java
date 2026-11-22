package com.rankgrade.service.impl;

import com.rankgrade.dto.response.QuestionResponse;
import com.rankgrade.dto.response.QuizResponse;
import com.rankgrade.entity.*;
import com.rankgrade.exception.BusinessException;
import com.rankgrade.exception.ResourceNotFoundException;
import com.rankgrade.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public QuizService(
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    // ─── Public / Student facing ──────────────────────────────────────────────

    public List<QuizResponse> getPublishedQuizzes() {
        return quizRepository.findByStatus(Quiz.QuizStatus.PUBLISHED)
                .stream().map(this::toQuizResponse).collect(Collectors.toList());
    }

    public List<QuizResponse> getPublishedByCategory(Long categoryId) {
        return quizRepository.findByCategoryIdAndStatus(categoryId, Quiz.QuizStatus.PUBLISHED)
                .stream().map(this::toQuizResponse).collect(Collectors.toList());
    }

    public QuizResponse getPublishedQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", id));
        if (quiz.getStatus() != Quiz.QuizStatus.PUBLISHED) {
            throw new BusinessException("Quiz is not available");
        }
        return toQuizResponse(quiz);
    }

    /**
     * Returns questions WITHOUT correct-answer information (safe for students).
     */
    public List<QuestionResponse> getQuestionsForAttempt(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));
        if (quiz.getStatus() != Quiz.QuizStatus.PUBLISHED) {
            throw new BusinessException("Quiz is not available");
        }
        return questionRepository.findByQuizIdOrderByQuestionOrderAsc(quizId)
                .stream().map(this::toStudentQuestionResponse).collect(Collectors.toList());
    }

    // ─── Admin facing ────────────────────────────────────────────────────────

    public List<QuizResponse> getAllQuizzes() {
        return quizRepository.findAll().stream().map(this::toQuizResponse).collect(Collectors.toList());
    }

    @Transactional
    public QuizResponse createQuiz(Quiz quiz, Long categoryId, Long adminId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        quiz.setCategory(category);
        quiz.setCreatedBy(admin);
        quiz.setStatus(Quiz.QuizStatus.DRAFT);
        return toQuizResponse(quizRepository.save(quiz));
    }

    @Transactional
    public QuizResponse updateQuiz(Long id, com.rankgrade.dto.request.QuizRequest req) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", id));
        quiz.setTitle(req.getTitle());
        quiz.setDescription(req.getDescription());
        quiz.setTimeLimitMinutes(req.getTimeLimitMinutes());
        quiz.setPassingMarks(req.getPassingMarks());
        quiz.setMaxAttempts(req.getMaxAttempts());
        quiz.setShuffleQuestions(req.isShuffleQuestions());
        quiz.setShowResultImmediately(req.isShowResultImmediately());
        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", req.getCategoryId()));
            quiz.setCategory(category);
        }
        return toQuizResponse(quizRepository.save(quiz));
    }

    @Transactional
    public QuizResponse updateQuizStatus(Long id, Quiz.QuizStatus status) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", id));
        if (status == Quiz.QuizStatus.PUBLISHED) {
            long questionCount = questionRepository.countByQuizId(id);
            if (questionCount == 0) {
                throw new BusinessException("Cannot publish a quiz with no questions");
            }
        }
        quiz.setStatus(status);
        return toQuizResponse(quizRepository.save(quiz));
    }

    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", id));
        if (quiz.getStatus() == Quiz.QuizStatus.PUBLISHED) {
            throw new BusinessException("Cannot delete a published quiz. Archive it first.");
        }
        quizRepository.delete(quiz);
    }

    // ─── Mappers ─────────────────────────────────────────────────────────────

    public QuizResponse toQuizResponse(Quiz quiz) {
        int qCount = (int) questionRepository.countByQuizId(quiz.getId());
        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .categoryId(quiz.getCategory() != null ? quiz.getCategory().getId() : null)
                .categoryName(quiz.getCategory() != null ? quiz.getCategory().getName() : null)
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .totalMarks(quiz.getTotalMarks())
                .passingMarks(quiz.getPassingMarks())
                .status(quiz.getStatus().name())
                .maxAttempts(quiz.getMaxAttempts())
                .shuffleQuestions(quiz.isShuffleQuestions())
                .showResultImmediately(quiz.isShowResultImmediately())
                .questionCount(qCount)
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    /**
     * Maps question to student-safe DTO — NO isCorrect field.
     */
    private QuestionResponse toStudentQuestionResponse(Question q) {
        List<QuestionResponse.OptionResponse> opts = q.getOptions().stream()
                .map(o -> QuestionResponse.OptionResponse.builder()
                        .id(o.getId())
                        .optionText(o.getOptionText())
                        .optionOrder(o.getOptionOrder())
                        .build())  // isCorrect intentionally omitted
                .collect(Collectors.toList());

        return QuestionResponse.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .marks(q.getMarks())
                .questionOrder(q.getQuestionOrder())
                .options(opts)
                .build();
    }
}
