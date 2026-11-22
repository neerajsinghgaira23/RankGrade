-- ==============================================================================
-- RankGrade - Database Schema (MySQL 8.0+)
-- BCA Final-Year Project: Online Quiz and Performance Analyzer
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `rankgrade_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `rankgrade_db`;

-- 1. Users Table (Students & Administrators)
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100),
    `role` VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_username` (`username`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Categories Table (Curriculum Subject Domains)
CREATE TABLE IF NOT EXISTS `categories` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT,
    `icon_class` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Quizzes Table
CREATE TABLE IF NOT EXISTS `quizzes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `category_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `time_limit_minutes` INT NOT NULL DEFAULT 15,
    `total_marks` INT NOT NULL DEFAULT 100,
    `passing_marks` INT DEFAULT 40,
    `status` VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    `max_attempts` INT DEFAULT 1,
    `shuffle_questions` BOOLEAN DEFAULT FALSE,
    `show_result_immediately` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_quiz_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_quiz_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_quiz_status` (`status`),
    INDEX `idx_quiz_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS `questions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `quiz_id` BIGINT NOT NULL,
    `question_text` TEXT NOT NULL,
    `marks` INT NOT NULL DEFAULT 1,
    `question_order` INT DEFAULT 1,
    `explanation` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_question_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
    INDEX `idx_question_quiz` (`quiz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Question Options Table (Multiple Choices)
CREATE TABLE IF NOT EXISTS `question_options` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `question_id` BIGINT NOT NULL,
    `option_text` TEXT NOT NULL,
    `is_correct` BOOLEAN NOT NULL DEFAULT FALSE,
    `option_order` INT NOT NULL DEFAULT 1,
    CONSTRAINT `fk_option_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
    INDEX `idx_option_question` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS `quiz_attempts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `quiz_id` BIGINT NOT NULL,
    `student_id` BIGINT NOT NULL,
    `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `submitted_at` TIMESTAMP NULL,
    `time_taken_seconds` INT DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    `score_obtained` INT DEFAULT 0,
    `total_marks` INT DEFAULT 0,
    `percentage` DOUBLE DEFAULT 0.0,
    `passed` BOOLEAN DEFAULT FALSE,
    CONSTRAINT `fk_attempt_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_attempt_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_attempt_student` (`student_id`),
    INDEX `idx_attempt_quiz` (`quiz_id`),
    INDEX `idx_attempt_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Attempt Answers Table (Telemetry & Answers Recorded per Attempt)
CREATE TABLE IF NOT EXISTS `attempt_answers` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `attempt_id` BIGINT NOT NULL,
    `question_id` BIGINT NOT NULL,
    `selected_option_id` BIGINT NULL,
    `is_correct` BOOLEAN DEFAULT FALSE,
    `marks_awarded` INT DEFAULT 0,
    `answered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_answer_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_answer_option` FOREIGN KEY (`selected_option_id`) REFERENCES `question_options` (`id`) ON DELETE SET NULL,
    UNIQUE KEY `uk_attempt_question` (`attempt_id`, `question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
