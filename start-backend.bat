@echo off
title RankGrade Backend Server (Spring Boot)
cd /d "%~dp0backend"
echo ===================================================
echo Starting RankGrade Backend on http://localhost:8080
echo ===================================================
call mvnw.cmd spring-boot:run
pause
