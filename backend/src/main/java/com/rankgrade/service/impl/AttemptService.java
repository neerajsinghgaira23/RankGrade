package com.rankgrade.service.impl;

import com.rankgrade.dto.response.AttemptResultResponse;
import com.rankgrade.entity.*;
import com.rankgrade.exception.BusinessException;
import com.rankgrade.exception.ResourceNotFoundException;
import com.rankgrade.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final AttemptAnswerRepository answerRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;

    public AttemptService(
            QuizAttemptRepository attemptRepository,
            AttemptAnswerRepository answerRepository,
            QuizRepository quizRepository,
            UserRepository userRepository,
            QuestionRepository questionRepository) {
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
    }

    /**
     * Start or resume a quiz attempt.
     */
    @Transactional
    public QuizAttempt startAttempt(Long studentId, Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));

        if (quiz.getStatus() != Quiz.QuizStatus.PUBLISHED) {
            throw new BusinessException("Quiz is not available");
        }

        // Check for an existing IN_PROGRESS attempt (allow resume)
        Optional<QuizAttempt> existingAttempt = attemptRepository
                .findByStudentIdAndQuizIdAndStatus(studentId, quizId, QuizAttempt.AttemptStatus.IN_PROGRESS);

        if (existingAttempt.isPresent()) {
            QuizAttempt attempt = existingAttempt.get();
            // Auto-submit if time exceeded
            long elapsedSeconds = ChronoUnit.SECONDS.between(attempt.getStartedAt(), LocalDateTime.now());
            long limitSeconds = (long) quiz.getTimeLimitMinutes() * 60;
            if (elapsedSeconds > limitSeconds) {
                return submitAttempt(attempt.getId(), studentId, true);
            }
            return attempt;
        }

        // Check max attempts
        long completedCount = attemptRepository.findByStudentIdAndQuizId(studentId, quizId)
                .stream()
                .filter(a -> a.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS)
                .count();

        if (quiz.getMaxAttempts() != null && quiz.getMaxAttempts() > 0 && completedCount >= quiz.getMaxAttempts()) {
            throw new BusinessException("You have reached the maximum number of attempts for this quiz");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", studentId));

        QuizAttempt attempt = QuizAttempt.builder()
                .student(student)
                .quiz(quiz)
                .status(QuizAttempt.AttemptStatus.IN_PROGRESS)
                .totalMarks(quiz.getTotalMarks())
                .build();

        return attemptRepository.save(attempt);
    }

    /**
     * Save or update a single answer during an active attempt.
     */
    @Transactional
    public AttemptAnswer saveAnswer(Long attemptId, Long questionId, Long selectedOptionId, Long studentId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt", attemptId));

        // Security: only the owner can answer
        if (!attempt.getStudent().getId().equals(studentId)) {
            throw new BusinessException("Unauthorized access to attempt");
        }

        if (attempt.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS) {
            throw new BusinessException("This attempt is no longer active");
        }

        // Check timer
        long elapsed = ChronoUnit.SECONDS.between(attempt.getStartedAt(), LocalDateTime.now());
        long limit = (long) attempt.getQuiz().getTimeLimitMinutes() * 60;
        if (elapsed > limit + 30) { // 30s grace
            submitAttempt(attemptId, studentId, true);
            throw new BusinessException("Time limit exceeded. Attempt auto-submitted.");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", questionId));

        if (!question.getQuiz().getId().equals(attempt.getQuiz().getId())) {
            throw new BusinessException("Question does not belong to this quiz");
        }

        QuestionOption selectedOption = null;
        if (selectedOptionId != null) {
            selectedOption = question.getOptions().stream()
                    .filter(o -> o.getId().equals(selectedOptionId))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException("Invalid option for this question"));
        }

        // Upsert answer
        AttemptAnswer answer = answerRepository
                .findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElse(AttemptAnswer.builder()
                        .attempt(attempt)
                        .question(question)
                        .build());

        answer.setSelectedOption(selectedOption);
        return answerRepository.save(answer);
    }

    /**
     * Submit and evaluate a quiz attempt.
     */
    @Transactional
    public QuizAttempt submitAttempt(Long attemptId, Long studentId, boolean autoSubmit) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt", attemptId));

        if (!attempt.getStudent().getId().equals(studentId)) {
            throw new BusinessException("Unauthorized access to attempt");
        }

        if (attempt.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS) {
            throw new BusinessException("Attempt is not in progress");
        }

        // Evaluate all answers server-side
        List<AttemptAnswer> answers = answerRepository.findByAttemptId(attemptId);
        List<Question> questions = questionRepository.findByQuizIdOrderByQuestionOrderAsc(
                attempt.getQuiz().getId());

        int totalMarks = 0;
        int scoreObtained = 0;
        int correctCount = 0;
        int wrongCount = 0;
        int unansweredCount = 0;

        for (Question question : questions) {
            totalMarks += question.getMarks();
            AttemptAnswer answer = answers.stream()
                    .filter(a -> a.getQuestion().getId().equals(question.getId()))
                    .findFirst().orElse(null);

            if (answer == null || answer.getSelectedOption() == null) {
                unansweredCount++;
                // Save unanswered record if not exists
                if (answer == null) {
                    answer = AttemptAnswer.builder()
                            .attempt(attempt)
                            .question(question)
                            .selectedOption(null)
                            .correct(false)
                            .marksAwarded(0)
                            .build();
                    answerRepository.save(answer);
                } else {
                    answer.setCorrect(false);
                    answer.setMarksAwarded(0);
                    answerRepository.save(answer);
                }
            } else {
                // Evaluate correctness server-side
                boolean isCorrect = answer.getSelectedOption().isCorrect();
                int awarded = isCorrect ? question.getMarks() : 0;
                answer.setCorrect(isCorrect);
                answer.setMarksAwarded(awarded);
                answerRepository.save(answer);

                if (isCorrect) {
                    scoreObtained += awarded;
                    correctCount++;
                } else {
                    wrongCount++;
                }
            }
        }

        double percentage = totalMarks > 0 ? ((double) scoreObtained / totalMarks) * 100 : 0;
        boolean passed = attempt.getQuiz().getPassingMarks() != null
                && scoreObtained >= attempt.getQuiz().getPassingMarks();

        long timeTaken = ChronoUnit.SECONDS.between(attempt.getStartedAt(), LocalDateTime.now());

        attempt.setStatus(autoSubmit ? QuizAttempt.AttemptStatus.AUTO_SUBMITTED
                                     : QuizAttempt.AttemptStatus.EVALUATED);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setTimeTakenSeconds(timeTaken);
        attempt.setScoreObtained(scoreObtained);
        attempt.setTotalMarks(totalMarks);
        attempt.setPercentage(Math.round(percentage * 100.0) / 100.0);
        attempt.setPassed(passed);
        attempt.setCorrectCount(correctCount);
        attempt.setWrongCount(wrongCount);
        attempt.setUnansweredCount(unansweredCount);

        return attemptRepository.save(attempt);
    }

    /**
     * Get full result with answer review (after submission).
     */
    @Transactional(readOnly = true)
    public AttemptResultResponse getResult(Long attemptId, Long studentId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt", attemptId));

        if (!attempt.getStudent().getId().equals(studentId)) {
            throw new BusinessException("Unauthorized access to attempt result");
        }

        if (attempt.getStatus() == QuizAttempt.AttemptStatus.IN_PROGRESS) {
            throw new BusinessException("Quiz attempt is still in progress");
        }

        List<AttemptAnswer> answers = answerRepository.findByAttemptId(attemptId);
        List<AttemptResultResponse.AnswerReviewItem> reviewItems = new ArrayList<>();

        for (AttemptAnswer answer : answers) {
            Question q = answer.getQuestion();
            QuestionOption correctOption = q.getOptions().stream()
                    .filter(QuestionOption::isCorrect)
                    .findFirst().orElse(null);

            reviewItems.add(AttemptResultResponse.AnswerReviewItem.builder()
                    .questionId(q.getId())
                    .questionText(q.getQuestionText())
                    .selectedOptionId(answer.getSelectedOption() != null
                            ? answer.getSelectedOption().getId() : null)
                    .selectedOptionText(answer.getSelectedOption() != null
                            ? answer.getSelectedOption().getOptionText() : null)
                    .correctOptionId(correctOption != null ? correctOption.getId() : null)
                    .correctOptionText(correctOption != null ? correctOption.getOptionText() : null)
                    .correct(answer.getCorrect())
                    .marksAwarded(answer.getMarksAwarded())
                    .explanation(q.getExplanation())
                    .build());
        }

        return AttemptResultResponse.builder()
                .attemptId(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .status(attempt.getStatus().name())
                .scoreObtained(attempt.getScoreObtained())
                .totalMarks(attempt.getTotalMarks())
                .percentage(attempt.getPercentage())
                .passed(attempt.getPassed())
                .correctCount(attempt.getCorrectCount())
                .wrongCount(attempt.getWrongCount())
                .unansweredCount(attempt.getUnansweredCount())
                .answers(reviewItems)
                .build();
    }

    @Transactional(readOnly = true)
    public List<QuizAttempt> getStudentHistory(Long studentId) {
        return attemptRepository.findCompletedByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public Optional<QuizAttempt> getActiveAttempt(Long studentId, Long quizId) {
        return attemptRepository.findByStudentIdAndQuizIdAndStatus(
                studentId, quizId, QuizAttempt.AttemptStatus.IN_PROGRESS);
    }

    @Transactional(readOnly = true)
    public Map<Long, Long> getSavedAnswersMap(Long attemptId) {
        return answerRepository.findByAttemptId(attemptId).stream()
                .filter(a -> a.getSelectedOption() != null)
                .collect(Collectors.toMap(
                        a -> a.getQuestion().getId(),
                        a -> a.getSelectedOption().getId(),
                        (existing, replacement) -> replacement
                ));
    }

    @Transactional
    public List<Map<String, Object>> getActiveAttempts(Long studentId) {
        List<QuizAttempt> inProgress = attemptRepository.findActiveByStudentId(studentId);
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (QuizAttempt a : inProgress) {
            Quiz q = a.getQuiz();
            long elapsedSeconds = a.getStartedAt() != null
                    ? ChronoUnit.SECONDS.between(a.getStartedAt(), now)
                    : 0;
            long limitSeconds = (long) q.getTimeLimitMinutes() * 60;
            long remainingSeconds = Math.max(0, limitSeconds - elapsedSeconds);

            if (remainingSeconds <= 0) {
                try {
                    submitAttempt(a.getId(), studentId, true);
                } catch (Exception ignored) {}
                continue;
            }

            int answeredCount = answerRepository.findByAttemptId(a.getId()).size();
            long totalQuestions = questionRepository.countByQuizId(q.getId());

            Map<String, Object> map = new HashMap<>();
            map.put("attemptId", a.getId());
            map.put("quizId", q.getId());
            map.put("quizTitle", q.getTitle());
            map.put("categoryName", q.getCategory() != null ? q.getCategory().getName() : "General");
            map.put("startedAt", a.getStartedAt() != null ? a.getStartedAt().toString() : "");
            map.put("timeLimitMinutes", q.getTimeLimitMinutes());
            map.put("remainingSeconds", remainingSeconds);
            map.put("answeredCount", answeredCount);
            map.put("totalQuestions", totalQuestions);
            result.add(map);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAdminAllAttempts() {
        List<QuizAttempt> attempts = attemptRepository.findAll();
        // Sort descending by startedAt
        attempts.sort((a, b) -> {
            if (a.getStartedAt() == null || b.getStartedAt() == null) return 0;
            return b.getStartedAt().compareTo(a.getStartedAt());
        });

        List<Map<String, Object>> list = new ArrayList<>();
        for (QuizAttempt a : attempts) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("studentId", a.getStudent() != null ? a.getStudent().getId() : null);
            m.put("studentName", a.getStudent() != null
                    ? (a.getStudent().getFullName() != null && !a.getStudent().getFullName().isBlank()
                        ? a.getStudent().getFullName() : a.getStudent().getUsername())
                    : "Unknown");
            m.put("studentEmail", a.getStudent() != null ? a.getStudent().getEmail() : "");
            m.put("studentUsername", a.getStudent() != null ? a.getStudent().getUsername() : "");
            m.put("quizId", a.getQuiz() != null ? a.getQuiz().getId() : null);
            m.put("quizTitle", a.getQuiz() != null ? a.getQuiz().getTitle() : "Untitled");
            m.put("categoryName", (a.getQuiz() != null && a.getQuiz().getCategory() != null)
                    ? a.getQuiz().getCategory().getName() : "General");
            m.put("startedAt", a.getStartedAt() != null ? a.getStartedAt().toString() : "");
            m.put("submittedAt", a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : "");
            m.put("timeTakenSeconds", a.getTimeTakenSeconds() != null ? a.getTimeTakenSeconds() : 0);
            m.put("status", a.getStatus().name());
            m.put("scoreObtained", a.getScoreObtained() != null ? a.getScoreObtained() : 0);
            m.put("totalMarks", a.getTotalMarks() != null ? a.getTotalMarks() : 0);
            m.put("percentage", a.getPercentage() != null ? a.getPercentage() : 0.0);
            m.put("passed", a.getPassed() != null ? a.getPassed() : false);
            m.put("correctCount", a.getCorrectCount() != null ? a.getCorrectCount() : 0);
            m.put("wrongCount", a.getWrongCount() != null ? a.getWrongCount() : 0);
            m.put("unansweredCount", a.getUnansweredCount() != null ? a.getUnansweredCount() : 0);
            list.add(m);
        }
        return list;
    }

    @Transactional(readOnly = true)
    public AttemptResultResponse getAdminAttemptResult(Long attemptId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt", attemptId));

        List<AttemptAnswer> answers = answerRepository.findByAttemptId(attemptId);
        List<AttemptResultResponse.AnswerReviewItem> reviewItems = new ArrayList<>();

        for (AttemptAnswer answer : answers) {
            Question q = answer.getQuestion();
            QuestionOption correctOption = q.getOptions().stream()
                    .filter(QuestionOption::isCorrect)
                    .findFirst().orElse(null);

            reviewItems.add(AttemptResultResponse.AnswerReviewItem.builder()
                    .questionId(q.getId())
                    .questionText(q.getQuestionText())
                    .selectedOptionId(answer.getSelectedOption() != null
                            ? answer.getSelectedOption().getId() : null)
                    .selectedOptionText(answer.getSelectedOption() != null
                            ? answer.getSelectedOption().getOptionText() : null)
                    .correctOptionId(correctOption != null ? correctOption.getId() : null)
                    .correctOptionText(correctOption != null ? correctOption.getOptionText() : null)
                    .correct(answer.getCorrect())
                    .marksAwarded(answer.getMarksAwarded())
                    .explanation(q.getExplanation())
                    .build());
        }

        return AttemptResultResponse.builder()
                .attemptId(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .status(attempt.getStatus().name())
                .scoreObtained(attempt.getScoreObtained())
                .totalMarks(attempt.getTotalMarks())
                .percentage(attempt.getPercentage())
                .passed(attempt.getPassed())
                .correctCount(attempt.getCorrectCount())
                .wrongCount(attempt.getWrongCount())
                .unansweredCount(attempt.getUnansweredCount())
                .answers(reviewItems)
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdminAnalytics() {
        List<QuizAttempt> allAttempts = attemptRepository.findAll();
        List<QuizAttempt> completed = allAttempts.stream()
                .filter(a -> a.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS)
                .collect(Collectors.toList());

        long passCount = completed.stream().filter(a -> Boolean.TRUE.equals(a.getPassed())).count();
        long failCount = completed.size() - passCount;
        double overallPassRate = completed.isEmpty() ? 0.0 : Math.round(((double) passCount / completed.size()) * 1000.0) / 10.0;
        double avgRaw = completed.isEmpty() ? 0.0 : completed.stream()
                .mapToDouble(a -> a.getPercentage() != null ? a.getPercentage() : 0.0)
                .average().orElse(0.0);
        double avgScore = Math.round(avgRaw * 10.0) / 10.0;

        // Score Distribution
        int band0_20 = 0, band20_40 = 0, band40_60 = 0, band60_80 = 0, band80_100 = 0;
        for (QuizAttempt a : completed) {
            double p = a.getPercentage() != null ? a.getPercentage() : 0.0;
            if (p < 20.0) band0_20++;
            else if (p < 40.0) band20_40++;
            else if (p < 60.0) band40_60++;
            else if (p < 80.0) band60_80++;
            else band80_100++;
        }

        Map<String, Integer> scoreDist = new HashMap<>();
        scoreDist.put("0-20%", band0_20);
        scoreDist.put("20-40%", band20_40);
        scoreDist.put("40-60%", band40_60);
        scoreDist.put("60-80%", band60_80);
        scoreDist.put("80-100%", band80_100);

        // Group by Category
        Map<String, List<QuizAttempt>> byCat = completed.stream()
                .collect(Collectors.groupingBy(a -> (a.getQuiz() != null && a.getQuiz().getCategory() != null)
                        ? a.getQuiz().getCategory().getName() : "General"));

        List<Map<String, Object>> catStats = new ArrayList<>();
        byCat.forEach((catName, catAttempts) -> {
            long pCount = catAttempts.stream().filter(a -> Boolean.TRUE.equals(a.getPassed())).count();
            double cPassRate = catAttempts.isEmpty() ? 0.0 : Math.round(((double) pCount / catAttempts.size()) * 1000.0) / 10.0;
            double cAvgRaw = catAttempts.isEmpty() ? 0.0 : catAttempts.stream()
                    .mapToDouble(a -> a.getPercentage() != null ? a.getPercentage() : 0.0)
                    .average().orElse(0.0);
            double cAvgScore = Math.round(cAvgRaw * 10.0) / 10.0;

            Map<String, Object> cm = new HashMap<>();
            cm.put("categoryName", catName);
            cm.put("attemptCount", catAttempts.size());
            cm.put("passRate", cPassRate);
            cm.put("averageScore", cAvgScore);
            catStats.add(cm);
        });

        // Group by Quiz
        Map<String, List<QuizAttempt>> byQuiz = completed.stream()
                .collect(Collectors.groupingBy(a -> a.getQuiz() != null ? a.getQuiz().getTitle() : "Untitled"));

        List<Map<String, Object>> quizStats = new ArrayList<>();
        byQuiz.forEach((quizTitle, qAttempts) -> {
            long pCount = qAttempts.stream().filter(a -> Boolean.TRUE.equals(a.getPassed())).count();
            double qPassRate = qAttempts.isEmpty() ? 0.0 : Math.round(((double) pCount / qAttempts.size()) * 1000.0) / 10.0;
            double qAvgRaw = qAttempts.isEmpty() ? 0.0 : qAttempts.stream()
                    .mapToDouble(a -> a.getPercentage() != null ? a.getPercentage() : 0.0)
                    .average().orElse(0.0);
            double qAvgScore = Math.round(qAvgRaw * 10.0) / 10.0;

            Map<String, Object> qm = new HashMap<>();
            qm.put("quizTitle", quizTitle);
            qm.put("attemptCount", qAttempts.size());
            qm.put("passRate", qPassRate);
            qm.put("averageScore", qAvgScore);
            quizStats.add(qm);
        });

        Map<String, Object> result = new HashMap<>();
        result.put("totalAttempts", allAttempts.size());
        result.put("completedAttempts", completed.size());
        result.put("passCount", passCount);
        result.put("failCount", failCount);
        result.put("overallPassRate", overallPassRate);
        result.put("averageScore", avgScore);
        result.put("scoreDistribution", scoreDist);
        result.put("categoryStats", catStats);
        result.put("quizStats", quizStats);

        return result;
    }
}
