package com.rankgrade.config;

import com.rankgrade.entity.*;
import com.rankgrade.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data generation.");
            return;
        }

        log.info("Starting RankGrade seed data initialization...");

        // 1. Seed Users
        User admin = User.builder()
                .username("admin")
                .email("admin@rankgrade.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator")
                .role(User.Role.ADMIN)
                .active(true)
                .build();
        userRepository.save(admin);

        User student = User.builder()
                .username("student")
                .email("student@rankgrade.com")
                .password(passwordEncoder.encode("student123"))
                .fullName("Alex Chen")
                .role(User.Role.STUDENT)
                .active(true)
                .build();
        userRepository.save(student);

        // 2. Seed Categories
        Category catJava = Category.builder()
                .name("Core Java & OOP")
                .description("Object-oriented programming, collections, threads, and memory model.")
                .build();
        categoryRepository.save(catJava);

        Category catDb = Category.builder()
                .name("Database Systems & SQL")
                .description("Relational databases, indexing, normalization, and ACID transactions.")
                .build();
        categoryRepository.save(catDb);

        Category catWeb = Category.builder()
                .name("Web Technologies & Angular")
                .description("Full-stack engineering, REST architecture, TypeScript, and reactive state.")
                .build();
        categoryRepository.save(catWeb);

        // 3. Seed Sample Quiz 1: Core Java Masterclass
        Quiz javaQuiz = Quiz.builder()
                .title("Core Java Mastery Assessment")
                .description("Test your grasp of core OOP concepts, JVM architecture, garbage collection, and collections framework.")
                .category(catJava)
                .createdBy(admin)
                .timeLimitMinutes(15)
                .totalMarks(50)
                .passingMarks(40)
                .maxAttempts(0)
                .shuffleQuestions(true)
                .showResultImmediately(true)
                .status(Quiz.QuizStatus.PUBLISHED)
                .build();
        quizRepository.save(javaQuiz);

        // Questions for Java Quiz
        Question q1 = Question.builder()
                .quiz(javaQuiz)
                .questionText("Which of the following is NOT a Java primitive data type?")
                .marks(10)
                .questionOrder(1)
                .explanation("String is a class in java.lang, whereas boolean, int, and float are primitive types.")
                .build();
        q1.setOptions(List.of(
                QuestionOption.builder().question(q1).optionText("int").correct(false).optionOrder(1).build(),
                QuestionOption.builder().question(q1).optionText("String").correct(true).optionOrder(2).build(),
                QuestionOption.builder().question(q1).optionText("boolean").correct(false).optionOrder(3).build(),
                QuestionOption.builder().question(q1).optionText("float").correct(false).optionOrder(4).build()
        ));
        questionRepository.save(q1);

        Question q2 = Question.builder()
                .quiz(javaQuiz)
                .questionText("Which memory area in the JVM is shared among all running threads?")
                .marks(10)
                .questionOrder(2)
                .explanation("The Heap area and Method area (Metaspace) are shared across all threads; Stack memory is per-thread.")
                .build();
        q2.setOptions(List.of(
                QuestionOption.builder().question(q2).optionText("Program Counter (PC) Register").correct(false).optionOrder(1).build(),
                QuestionOption.builder().question(q2).optionText("JVM Stack").correct(false).optionOrder(2).build(),
                QuestionOption.builder().question(q2).optionText("Heap Memory").correct(true).optionOrder(3).build(),
                QuestionOption.builder().question(q2).optionText("Native Method Stack").correct(false).optionOrder(4).build()
        ));
        questionRepository.save(q2);

        Question q3 = Question.builder()
                .quiz(javaQuiz)
                .questionText("What does the 'final' keyword signify when applied to a class in Java?")
                .marks(10)
                .questionOrder(3)
                .explanation("A final class cannot be extended or subclassed by any other class.")
                .build();
        q3.setOptions(List.of(
                QuestionOption.builder().question(q3).optionText("The class cannot be instantiated").correct(false).optionOrder(1).build(),
                QuestionOption.builder().question(q3).optionText("The class cannot be subclassed/inherited").correct(true).optionOrder(2).build(),
                QuestionOption.builder().question(q3).optionText("All members of the class become private").correct(false).optionOrder(3).build(),
                QuestionOption.builder().question(q3).optionText("The class must implement Serializable").correct(false).optionOrder(4).build()
        ));
        questionRepository.save(q3);

        Question q4 = Question.builder()
                .quiz(javaQuiz)
                .questionText("Which collection implementation does NOT permit duplicate elements?")
                .marks(10)
                .questionOrder(4)
                .explanation("Set implementations like HashSet and TreeSet enforce uniqueness of elements.")
                .build();
        q4.setOptions(List.of(
                QuestionOption.builder().question(q4).optionText("ArrayList").correct(false).optionOrder(1).build(),
                QuestionOption.builder().question(q4).optionText("LinkedList").correct(false).optionOrder(2).build(),
                QuestionOption.builder().question(q4).optionText("HashSet").correct(true).optionOrder(3).build(),
                QuestionOption.builder().question(q4).optionText("Vector").correct(false).optionOrder(4).build()
        ));
        questionRepository.save(q4);

        Question q5 = Question.builder()
                .quiz(javaQuiz)
                .questionText("What is the time complexity of looking up a key in an ideal java.util.HashMap?")
                .marks(10)
                .questionOrder(5)
                .explanation("Hash-based lookups provide constant O(1) average time complexity under normal hashing distributions.")
                .build();
        q5.setOptions(List.of(
                QuestionOption.builder().question(q5).optionText("O(1)").correct(true).optionOrder(1).build(),
                QuestionOption.builder().question(q5).optionText("O(log n)").correct(false).optionOrder(2).build(),
                QuestionOption.builder().question(q5).optionText("O(n)").correct(false).optionOrder(3).build(),
                QuestionOption.builder().question(q5).optionText("O(n log n)").correct(false).optionOrder(4).build()
        ));
        questionRepository.save(q5);

        // 4. Seed Sample Quiz 2: SQL & Relational Databases
        Quiz dbQuiz = Quiz.builder()
                .title("SQL & Database Engineering")
                .description("Validate your database normalization, SQL queries, transaction isolation, and indexing prowess.")
                .category(catDb)
                .createdBy(admin)
                .timeLimitMinutes(10)
                .totalMarks(30)
                .passingMarks(50)
                .maxAttempts(3)
                .shuffleQuestions(true)
                .showResultImmediately(true)
                .status(Quiz.QuizStatus.PUBLISHED)
                .build();
        quizRepository.save(dbQuiz);

        Question dbQ1 = Question.builder()
                .quiz(dbQuiz)
                .questionText("Which SQL clause is used to filter aggregated grouped data?")
                .marks(10)
                .questionOrder(1)
                .explanation("HAVING is evaluated after GROUP BY, whereas WHERE filters row-level records before grouping.")
                .build();
        dbQ1.setOptions(List.of(
                QuestionOption.builder().question(dbQ1).optionText("WHERE").correct(false).optionOrder(1).build(),
                QuestionOption.builder().question(dbQ1).optionText("HAVING").correct(true).optionOrder(2).build(),
                QuestionOption.builder().question(dbQ1).optionText("GROUP BY").correct(false).optionOrder(3).build(),
                QuestionOption.builder().question(dbQ1).optionText("ORDER BY").correct(false).optionOrder(4).build()
        ));
        questionRepository.save(dbQ1);

        Question dbQ2 = Question.builder()
                .quiz(dbQuiz)
                .questionText("Which ACID property guarantees that database transactions are all-or-nothing?")
                .marks(10)
                .questionOrder(2)
                .explanation("Atomicity ensures all statements in a transaction complete successfully, or all changes are rolled back.")
                .build();
        dbQ2.setOptions(List.of(
                QuestionOption.builder().question(dbQ2).optionText("Atomicity").correct(true).optionOrder(1).build(),
                QuestionOption.builder().question(dbQ2).optionText("Consistency").correct(false).optionOrder(2).build(),
                QuestionOption.builder().question(dbQ2).optionText("Isolation").correct(false).optionOrder(3).build(),
                QuestionOption.builder().question(dbQ2).optionText("Durability").correct(false).optionOrder(4).build()
        ));
        questionRepository.save(dbQ2);

        Question dbQ3 = Question.builder()
                .quiz(dbQuiz)
                .questionText("Which normal form eliminates transitive dependencies on the primary key?")
                .marks(10)
                .questionOrder(3)
                .explanation("Third Normal Form (3NF) requires 2NF plus no transitive functional dependencies on candidate keys.")
                .build();
        dbQ3.setOptions(List.of(
                QuestionOption.builder().question(dbQ3).optionText("1NF").correct(false).optionOrder(1).build(),
                QuestionOption.builder().question(dbQ3).optionText("2NF").correct(false).optionOrder(2).build(),
                QuestionOption.builder().question(dbQ3).optionText("3NF").correct(true).optionOrder(3).build(),
                QuestionOption.builder().question(dbQ3).optionText("BCNF").correct(false).optionOrder(4).build()
        ));
        questionRepository.save(dbQ3);

        log.info("RankGrade initial seed data populated successfully!");
    }
}
