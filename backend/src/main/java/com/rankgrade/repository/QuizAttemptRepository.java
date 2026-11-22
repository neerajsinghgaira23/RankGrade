package com.rankgrade.repository;

import com.rankgrade.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    @Query("SELECT qa FROM QuizAttempt qa JOIN FETCH qa.quiz WHERE qa.student.id = :studentId ORDER BY qa.startedAt DESC")
    List<QuizAttempt> findByStudentIdOrderByStartedAtDesc(@Param("studentId") Long studentId);

    List<QuizAttempt> findByStudentIdAndQuizId(Long studentId, Long quizId);

    Optional<QuizAttempt> findByStudentIdAndQuizIdAndStatus(
            Long studentId, Long quizId, QuizAttempt.AttemptStatus status);

    long countByStudentIdAndQuizId(Long studentId, Long quizId);

    @Query("SELECT qa FROM QuizAttempt qa JOIN FETCH qa.quiz WHERE qa.student.id = :studentId " +
           "AND qa.status IN ('SUBMITTED', 'AUTO_SUBMITTED', 'EVALUATED') " +
           "ORDER BY qa.submittedAt DESC")
    List<QuizAttempt> findCompletedByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT qa FROM QuizAttempt qa JOIN FETCH qa.quiz q LEFT JOIN FETCH q.category WHERE qa.student.id = :studentId " +
           "AND qa.status = 'IN_PROGRESS' ORDER BY qa.startedAt DESC")
    List<QuizAttempt> findActiveByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT AVG(qa.percentage) FROM QuizAttempt qa WHERE qa.student.id = :studentId " +
           "AND qa.status IN ('SUBMITTED', 'AUTO_SUBMITTED', 'EVALUATED')")
    Double findAveragePercentageByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(qa) FROM QuizAttempt qa WHERE qa.student.id = :studentId " +
           "AND qa.passed = true")
    long countPassedByStudentId(@Param("studentId") Long studentId);
}
