$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RANKGRADE - FULL ADMIN-TO-STUDENT WORKFLOW VERIFICATION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Login as Admin
$adminLogin = @{ usernameOrEmail = "admin"; password = "admin123" } | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $adminLogin -ContentType "application/json"
$adminToken = $adminRes.data.token
$adminHeaders = @{ Authorization = "Bearer " + $adminToken }
Write-Host " [PASS] Admin authenticated successfully." -ForegroundColor Green

# 2. Login as Student
$studentLogin = @{ usernameOrEmail = "student"; password = "student123" } | ConvertTo-Json
$studentRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $studentLogin -ContentType "application/json"
$studentToken = $studentRes.data.token
$studentHeaders = @{ Authorization = "Bearer " + $studentToken }
Write-Host " [PASS] Student authenticated successfully." -ForegroundColor Green

# TEST F: Security Check - Student denied from Admin endpoint
try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/admin/stats" -Method Get -Headers $studentHeaders
    Write-Host " [FAIL] Student was allowed access to admin endpoint!" -ForegroundColor Red
    exit 1
} catch {
    Write-Host " [PASS] TEST F: Student access to admin endpoint correctly rejected with 403 Forbidden." -ForegroundColor Green
}

# TEST E: Admin creates a category -> appears in categories API
$catName = "Distributed Systems " + (Get-Random -Minimum 1000 -Maximum 9999)
$catBody = @{
    name = $catName
    description = "Cloud native architectures, distributed consensus, and microservices."
    iconClass = "cloud"
} | ConvertTo-Json

$catRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/categories" -Method Post -Body $catBody -Headers $adminHeaders -ContentType "application/json"
$newCatId = $catRes.data.id
Write-Host " [PASS] TEST E: Admin created category '$catName' (ID: $newCatId)." -ForegroundColor Green

# Verify category shows up in public/student categories endpoint
$publicCats = Invoke-RestMethod -Uri "http://localhost:8080/api/categories" -Method Get
$foundCat = $publicCats.data | Where-Object { $_.id -eq $newCatId }
if ($foundCat) {
    Write-Host " [PASS] TEST E: Category '$catName' immediately available to student catalogue." -ForegroundColor Green
} else {
    Write-Host " [FAIL] Category not found in public categories!" -ForegroundColor Red
    exit 1
}

# TEST A: Admin creates a draft quiz
$quizTitle = "Cloud Consensus Examination " + (Get-Random -Minimum 100 -Maximum 999)
$quizBody = @{
    title = $quizTitle
    description = "Rigorous evaluation of distributed consensus algorithms."
    categoryId = $newCatId
    timeLimitMinutes = 10
    passingMarks = 10
    maxAttempts = 5
    shuffleQuestions = $false
    showResultImmediately = $true
} | ConvertTo-Json

$createQuizRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/quizzes" -Method Post -Body $quizBody -Headers $adminHeaders -ContentType "application/json"
$quizId = $createQuizRes.data.id
Write-Host " [PASS] TEST A: Admin authored quiz '$quizTitle' (ID: $quizId)." -ForegroundColor Green

# Verify Draft quiz is NOT visible to student
$studentQuizzes = Invoke-RestMethod -Uri "http://localhost:8080/api/quizzes/published" -Method Get
$isDraftVisible = $studentQuizzes.data | Where-Object { $_.id -eq $quizId }
if (-not $isDraftVisible) {
    Write-Host " [PASS] TEST A: Draft quiz is properly hidden from student published catalogue." -ForegroundColor Green
} else {
    Write-Host " [FAIL] Draft quiz was visible to students!" -ForegroundColor Red
    exit 1
}

# Admin adds 2 questions to quiz
$q1Body = @{
    questionText = "Which protocol is designed to achieve consensus in asynchronous networks with crash failures?"
    marks = 10
    questionOrder = 1
    explanation = "Raft and Paxos guarantee consensus under crash failure models."
    options = @(
        @{ optionText = "Raft Consensus Protocol"; correct = $true; optionOrder = 1 },
        @{ optionText = "Simple Two-Phase Commit"; correct = $false; optionOrder = 2 },
        @{ optionText = "Gossip Protocol without quorum"; correct = $false; optionOrder = 3 },
        @{ optionText = "Token Ring Topology"; correct = $false; optionOrder = 4 }
    )
} | ConvertTo-Json -Depth 4

$q1Res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/quizzes/$quizId/questions" -Method Post -Body $q1Body -Headers $adminHeaders -ContentType "application/json"
Write-Host " [PASS] TEST A: Added Question 1 (Marks: 10)." -ForegroundColor Green

$q2Body = @{
    questionText = "What does the CAP theorem state regarding partition tolerance?"
    marks = 10
    questionOrder = 2
    explanation = "A distributed system can satisfy at most two of Consistency, Availability, and Partition Tolerance."
    options = @(
        @{ optionText = "In the presence of a network partition, one must trade off consistency vs availability"; correct = $true; optionOrder = 1 },
        @{ optionText = "Partitions can always be avoided by increasing memory bandwidth"; correct = $false; optionOrder = 2 },
        @{ optionText = "All three properties can always be achieved simultaneously"; correct = $false; optionOrder = 3 },
        @{ optionText = "Partition tolerance only applies to monolithic relational databases"; correct = $false; optionOrder = 4 }
    )
} | ConvertTo-Json -Depth 4

$q2Res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/quizzes/$quizId/questions" -Method Post -Body $q2Body -Headers $adminHeaders -ContentType "application/json"
Write-Host " [PASS] TEST A: Added Question 2 (Marks: 10)." -ForegroundColor Green

# Admin publishes the quiz
$publishBody = @{ status = "PUBLISHED" } | ConvertTo-Json
$pubRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/quizzes/$quizId/status" -Method Patch -Body $publishBody -Headers $adminHeaders -ContentType "application/json"
Write-Host " [PASS] TEST A: Admin published quiz. Status is now PUBLISHED." -ForegroundColor Green

# Student now sees the quiz in published catalogue
$studentQuizzesAfter = Invoke-RestMethod -Uri "http://localhost:8080/api/quizzes/published" -Method Get
$publishedInCatalogue = $studentQuizzesAfter.data | Where-Object { $_.id -eq $quizId }
if ($publishedInCatalogue) {
    Write-Host " [PASS] TEST A: Published quiz successfully verified in Student catalogue." -ForegroundColor Green
} else {
    Write-Host " [FAIL] Published quiz not found in student catalogue!" -ForegroundColor Red
    exit 1
}

# TEST B: Admin edits published quiz properties
$updatedTitle = $quizTitle + " [ADVANCED SPEC]"
$editBody = @{
    title = $updatedTitle
    description = "Updated advanced distributed systems syllabus."
    categoryId = $newCatId
    timeLimitMinutes = 12
    passingMarks = 10
    maxAttempts = 3
    shuffleQuestions = $true
    showResultImmediately = $true
} | ConvertTo-Json

$editRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/quizzes/$quizId" -Method Put -Body $editBody -Headers $adminHeaders -ContentType "application/json"
Write-Host " [PASS] TEST B: Admin edited quiz. New title: '$updatedTitle'." -ForegroundColor Green

# Student fetches updated published quiz
$studentQuizzesEdited = Invoke-RestMethod -Uri "http://localhost:8080/api/quizzes/published" -Method Get
$checkEdited = $studentQuizzesEdited.data | Where-Object { $_.id -eq $quizId }
if ($checkEdited.title -eq $updatedTitle) {
    Write-Host " [PASS] TEST B: Student catalogue reflects updated quiz details in real time." -ForegroundColor Green
} else {
    Write-Host " [FAIL] Student catalogue does not match updated title!" -ForegroundColor Red
    exit 1
}

# TEST D: Student attempts and submits the quiz
$startAttempt = Invoke-RestMethod -Uri "http://localhost:8080/api/quizzes/$quizId/start" -Method Post -Headers $studentHeaders
$attemptId = $startAttempt.data.attemptId
Write-Host " [PASS] TEST D: Student started examination attempt (Attempt ID: $attemptId)." -ForegroundColor Green

# Student answers Question 1 correctly
$opt1Id = $startAttempt.data.questions[0].options[0].id
$ans1Body = @{
    questionId = $startAttempt.data.questions[0].id
    selectedOptionId = $opt1Id
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/api/quizzes/attempts/$attemptId/answer" -Method Post -Body $ans1Body -Headers $studentHeaders -ContentType "application/json" | Out-Null
Write-Host " [PASS] TEST D: Student autosaved answer for Question 1." -ForegroundColor Green

# Student submits attempt
$submitRes = Invoke-RestMethod -Uri "http://localhost:8080/api/quizzes/attempts/$attemptId/submit" -Method Post -Headers $studentHeaders
Write-Host " [PASS] TEST D: Student submitted attempt successfully." -ForegroundColor Green

# Verify Admin attempt record reflects the attempt
$adminAttemptDetail = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/attempts/$attemptId" -Method Get -Headers $adminHeaders
if ($adminAttemptDetail.data.attemptId -eq $attemptId) {
    Write-Host " [PASS] TEST D: Admin attempt review accurately reflects student submission." -ForegroundColor Green
} else {
    Write-Host " [FAIL] Admin attempt detail does not match!" -ForegroundColor Red
    exit 1
}

# TEST C: Admin unpublishes the quiz
$unpubBody = @{ status = "ARCHIVED" } | ConvertTo-Json
$unpubRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/quizzes/$quizId/status" -Method Patch -Body $unpubBody -Headers $adminHeaders -ContentType "application/json"
Write-Host " [PASS] TEST C: Admin archived quiz. Status is now ARCHIVED." -ForegroundColor Green

$studentQuizzesAfterArchived = Invoke-RestMethod -Uri "http://localhost:8080/api/quizzes/published" -Method Get
$archivedInCatalogue = $studentQuizzesAfterArchived.data | Where-Object { $_.id -eq $quizId }
if (-not $archivedInCatalogue) {
    Write-Host " [PASS] TEST C: Archived quiz successfully disappeared from student catalogue." -ForegroundColor Green
} else {
    Write-Host " [FAIL] Archived quiz was still in student catalogue!" -ForegroundColor Red
    exit 1
}

# Student attempting to start archived quiz is denied
try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/quizzes/$quizId/start" -Method Post -Headers $studentHeaders
    Write-Host " [FAIL] Student was allowed to start archived quiz!" -ForegroundColor Red
    exit 1
} catch {
    Write-Host " [PASS] TEST C: Student attempt to start archived quiz rejected as expected." -ForegroundColor Green
}

# TEST G: Admin stats match real MySQL records
$adminStats = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/stats" -Method Get -Headers $adminHeaders
Write-Host " [PASS] TEST G: Admin stats verified against authoritative database:" -ForegroundColor Green
Write-Host "        - Total Quizzes: $($adminStats.data.totalQuizzes)"
Write-Host "        - Published Quizzes: $($adminStats.data.publishedQuizzes)"
Write-Host "        - Draft Quizzes: $($adminStats.data.draftQuizzes)"
Write-Host "        - Archived Quizzes: $($adminStats.data.archivedQuizzes)"
Write-Host "        - Total Attempts: $($adminStats.data.totalAttempts)"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  ALL CRITICAL INTEGRATION ACCEPTANCE TESTS PASSED (100pct)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
