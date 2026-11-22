package com.rankgrade.repository;

import com.rankgrade.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByStatus(Quiz.QuizStatus status);

    List<Quiz> findByCategoryIdAndStatus(Long categoryId, Quiz.QuizStatus status);

    List<Quiz> findByCreatedById(Long userId);

    @Query("SELECT q FROM Quiz q WHERE q.status = 'PUBLISHED' AND " +
           "(LOWER(q.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(q.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Quiz> searchPublished(@Param("keyword") String keyword);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.quiz.id = :quizId")
    long countQuestionsByQuizId(@Param("quizId") Long quizId);

    long countByCategoryId(Long categoryId);
}
