import { Component, OnInit, OnDestroy, signal, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { QuizService } from '../../core/services/quiz.service';
import { AudioFxService } from '../../core/services/audio-fx.service';
import { Category, Quiz } from '../../core/models/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface BattleQuestion {
  id: number;
  text: string;
  category: string;
  options: { key: string; text: string; correct: boolean }[];
  explanation: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent, FooterComponent, IconComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar />

      <!-- Hero Section with 3D Background Canvas -->
      <section class="hero">
        <canvas #heroCanvas class="hero-3d-canvas"></canvas>
        <div class="hero-bg">
          <div class="cyber-grid"></div>
          <div class="glow-orb orb-1"></div>
          <div class="glow-orb orb-2"></div>
        </div>

        <div class="container hero-container">
          <!-- Left Hero Branding -->
          <div class="hero-content animate-fade-up">
            <h1 class="hero-title">
              Level Up Your Knowledge in a <br>
              <span class="text-gradient">3D Gaming Quiz Arena.</span>
            </h1>

            <p class="hero-desc">
              RankGrade transforms rigid online tests into an exhilarating esports-grade competitive arena.
              Real-time synchronized battle countdowns, combo multipliers, instant anti-cheat evaluation,
              and 3D neural telemetry powered by Spring Boot &amp; Angular 21.
            </p>

            <div class="hero-actions">
              <a routerLink="/register" class="btn btn-gamer-primary btn-lg">
                <app-icon name="zap" [size]="18" />
                <span>Enter Arena Free</span>
              </a>
              <button class="btn btn-gamer-outline btn-lg" (click)="start3DMiniBattle()">
                <app-icon name="crosshair" [size]="18" />
                <span>Play 3D Mini-Battle</span>
              </button>
            </div>

            <!-- Gaming Telemetry Micro-Badges -->
            <div class="hero-telemetry-ribbon">
              <div class="ht-item">
                <span class="ht-val">🔥 4x</span>
                <span class="ht-lbl">Combo Multiplier</span>
              </div>
              <div class="ht-divider"></div>
              <div class="ht-item">
                <span class="ht-val">0.0ms</span>
                <span class="ht-lbl">Key Leak Proof</span>
              </div>
              <div class="ht-divider"></div>
              <div class="ht-item">
                <span class="ht-val">3D HUD</span>
                <span class="ht-lbl">Spatial Telemetry</span>
              </div>
            </div>
          </div>

          <!-- Right: Interactive 3D Holographic Quiz Battle Terminal -->
          <div
            #battleCard
            class="hero-preview"
            (mousemove)="onCardMouseMove($event)"
            (mouseleave)="onCardMouseLeave()"
          >
            <div
              class="cyber-terminal-3d"
              [style.transform]="cardTransform"
            >
              <!-- Specular Glare Overlay -->
              <div class="specular-glare" [style.background]="glareBackground"></div>

              <!-- Top Holographic HUD Bar -->
              <div class="terminal-hud-header">
                <div class="pilot-profile">
                  <div class="pilot-avatar">
                    <app-icon name="cpu" [size]="16" color="#0099CC" />
                  </div>
                  <div class="pilot-info">
                    <div class="pilot-tag">
                      <span class="callsign">CYBER_PILOT_01</span>
                      <span class="tier-badge">DIAMOND II</span>
                    </div>
                    <div class="xp-track-mini">
                      <div class="xp-fill-mini" [style.width.%]="xpPercent()"></div>
                    </div>
                  </div>
                </div>

                <div class="hud-status-cluster">
                  <!-- Audio FX Toggle -->
                  <button
                    class="sfx-toggle-btn"
                    (click)="toggleSound($event)"
                    [title]="audioService.soundEnabled() ? 'Sound FX: ON' : 'Sound FX: MUTED'"
                  >
                    <app-icon [name]="audioService.soundEnabled() ? 'volume-2' : 'volume-x'" [size]="15" [color]="audioService.soundEnabled() ? '#00E676' : 'rgba(255,255,255,0.4)'" />
                  </button>

                  <div class="combo-pill" [class.active-combo]="streak() > 0">
                    <app-icon name="flame" [size]="14" [color]="streak() > 0 ? '#FF2D95' : 'rgba(255,255,255,0.4)'" />
                    <span>{{ streak() }}X STREAK</span>
                  </div>
                </div>
              </div>

              <!-- Interactive Battle Stage -->
              <div class="battle-stage-body">
                <!-- Floating XP Notification Burst -->
                @if (floatingXpText()) {
                  <div class="floating-xp-burst animate-pop">
                    {{ floatingXpText() }}
                  </div>
                }

                <div class="arena-question-header">
                  <div class="quest-meta">
                    <span class="quest-tag">
                      <app-icon name="target" [size]="12" color="#0099CC" />
                      {{ currentBattleQuestion.category }}
                    </span>
                    <span class="quest-num">CHALLENGE {{ activeQuestionIndex + 1 }} / {{ battleQuestions.length }}</span>
                  </div>
                  <div class="xp-badge-reward">
                    <app-icon name="sparkles" [size]="12" color="#FFB300" />
                    +150 XP
                  </div>
                </div>

                <!-- 3D Question Card -->
                <div class="hologram-question-box">
                  <p class="question-text">{{ currentBattleQuestion.text }}</p>
                </div>

                <!-- 3D Interactive Options Grid -->
                <div class="battle-options-grid">
                  @for (opt of currentBattleQuestion.options; track opt.key) {
                    <button
                      class="battle-option-btn"
                      [class.selected]="selectedOptionKey() === opt.key"
                      [class.correct]="revealed() && opt.correct"
                      [class.wrong]="revealed() && selectedOptionKey() === opt.key && !opt.correct"
                      [disabled]="revealed()"
                      (click)="onAnswerClick(opt)"
                    >
                      <span class="key-binder">{{ opt.key }}</span>
                      <span class="btn-text">{{ opt.text }}</span>
                      @if (revealed() && opt.correct) {
                        <span class="res-indicator success">
                          <app-icon name="check" [size]="14" color="#00E676" />
                        </span>
                      }
                      @if (revealed() && selectedOptionKey() === opt.key && !opt.correct) {
                        <span class="res-indicator danger">
                          <app-icon name="x" [size]="14" color="#FF1744" />
                        </span>
                      }
                    </button>
                  }
                </div>

                <!-- Live Result / Next Round Bar -->
                @if (revealed()) {
                  <div class="battle-feedback-bar animate-fade-in">
                    <div class="feedback-msg">
                      @if (wasCorrect()) {
                        <span class="msg-title success">⚡ CRITICAL HIT! +150 XP AWARDED</span>
                      } @else {
                        <span class="msg-title warning">🛡️ SHIELD DEFLECTION! STREAK RESET</span>
                      }
                      <span class="msg-sub">{{ currentBattleQuestion.explanation }}</span>
                    </div>
                    <button class="btn btn-gamer-next" (click)="nextBattleQuestion()">
                      <span>Next Challenge</span>
                      <app-icon name="arrow-right" [size]="14" />
                    </button>
                  </div>
                }

                <!-- Telemetry Progress Footer -->
                <div class="battle-hud-footer">
                  <div class="stat-pill">
                    <span class="sp-lbl">SPEED</span>
                    <span class="sp-val text-cerulean">1.4s</span>
                  </div>
                  <div class="stat-pill">
                    <span class="sp-lbl">ACCURACY</span>
                    <span class="sp-val text-success">96.8%</span>
                  </div>
                  <div class="stat-pill">
                    <span class="sp-lbl">TOTAL XP</span>
                    <span class="sp-val text-rose">{{ currentXp() }} XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3D Gaming Features Highlights Strip -->
      <section class="gaming-matrix-section">
        <div class="container">
          <div class="matrix-grid">
            <div class="matrix-card">
              <div class="mc-icon rose-glow">
                <app-icon name="gamepad" [size]="24" color="#FF2D95" />
              </div>
              <div class="mc-info">
                <h4>Esports Exam Engine</h4>
                <p>Hotkeys, combo multipliers, and synchronized countdown clock for zero distraction.</p>
              </div>
            </div>

            <div class="matrix-card">
              <div class="mc-icon cyan-glow">
                <app-icon name="shield" [size]="24" color="#0099CC" />
              </div>
              <div class="mc-info">
                <h4>Zero-Leak Anti-Cheat</h4>
                <p>Answers remain server-side in Spring Boot until submission is cryptographically confirmed.</p>
              </div>
            </div>

            <div class="matrix-card">
              <div class="mc-icon green-glow">
                <app-icon name="bar-chart" [size]="24" color="#00E676" />
              </div>
              <div class="mc-info">
                <h4>Longitudinal Telemetry</h4>
                <p>Chart.js longitudinal performance graphs, speed metrics, and weak-topic diagnostics.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4-Level Battle Architecture Workflow -->
      <section class="workflow-section">
        <div class="container">
          <div class="section-heading text-center">
            <span class="section-tag">
              <app-icon name="layers" [size]="14" color="#0099CC" />
              Tactical Examination Loop
            </span>
            <h2>How You <span class="text-gradient">Dominate Assessments</span></h2>
            <p>Engineered for high-stakes speed, fairness, and instant performance telemetry.</p>
          </div>

          <div class="workflow-grid">
            <div class="workflow-step card">
              <div class="step-num">LVL 01</div>
              <div class="step-icon">
                <app-icon name="search" [size]="24" color="#0099CC" />
              </div>
              <h3>Select Assessment Quest</h3>
              <p>Explore categorized assessments across Core Java, Database Engineering, and Software Design.</p>
            </div>

            <div class="workflow-step card">
              <div class="step-num">LVL 02</div>
              <div class="step-icon">
                <app-icon name="clock" [size]="24" color="#FF2D95" />
              </div>
              <h3>Timed 3D Exam Arena</h3>
              <p>Solve with responsive gamer hotkeys [1-4], question bookmark flags, and asynchronous auto-sync.</p>
            </div>

            <div class="workflow-step card">
              <div class="step-num">LVL 03</div>
              <div class="step-icon">
                <app-icon name="shield" [size]="24" color="#00E676" />
              </div>
              <h3>Server Evaluation Vault</h3>
              <p>Spring Boot grades responses server-side. Correct answer keys are never leaked to client inspection.</p>
            </div>

            <div class="workflow-step card">
              <div class="step-num">LVL 04</div>
              <div class="step-icon">
                <app-icon name="bar-chart" [size]="24" color="#0099CC" />
              </div>
              <h3>Deep Telemetry Radar</h3>
              <p>Inspect solution keys, question explanations, longitudinal score charts, and accuracy breakdowns.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Backend Categories -->
      @if (categories().length > 0) {
        <section class="categories-section">
          <div class="container">
            <div class="section-heading text-center">
              <span class="section-tag">
                <app-icon name="book" [size]="14" color="#FF2D95" />
                Curriculum Battlegrounds
              </span>
              <h2>Explore Knowledge <span class="text-gradient">Domains</span></h2>
              <p>Master curriculum-aligned domains designed for technical students and competitive candidates.</p>
            </div>

            <div class="categories-grid">
              @for (cat of categories(); track cat.id) {
                <div class="category-card card">
                  <div class="cat-icon-box">
                    <app-icon name="box" [size]="24" color="#007BA7" />
                  </div>
                  <h4>{{ cat.name }}</h4>
                  <p>{{ cat.description || 'Comprehensive quizzes covering fundamental and advanced paradigms.' }}</p>
                  <a routerLink="/student/quizzes" class="cat-link">
                    <span>Enter Subject Arena</span>
                    <app-icon name="arrow-right" [size]="14" />
                  </a>
                </div>
              }
            </div>
          </div>
        </section>
      }

      <!-- Platform Capabilities Section (Engineered For Academic Excellence - Fixed 1-Line Alignment) -->
      <section class="features-section">
        <div class="container container-wide">
          <div class="section-heading text-center">
            <span class="section-tag">
              <app-icon name="award" [size]="14" color="#00E676" />
              Platform Capabilities
            </span>
            <h2>Engineered For <span class="text-gradient">Academic Excellence</span></h2>
            <p>Every feature is crafted to give students and faculty complete assessment transparency.</p>
          </div>

          <div class="features-row-oneline">
            @for (f of features; track f.title) {
              <div class="feature-card-oneline">
                <div class="feature-icon-wrapper" [style.border-color]="f.glowColor" [style.background]="f.bgColor">
                  <app-icon [name]="f.iconName" [size]="20" [color]="f.color" />
                </div>
                <h4>{{ f.title }}</h4>
                <p>{{ f.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- 3D Mini-Battle Arena Interactive Modal -->
      @if (battleModalOpen()) {
        <div class="battle-modal-backdrop animate-fade-in" (click)="closeBattleModal()">
          <div class="battle-modal-frame" (click)="$event.stopPropagation()">
            <!-- Top Cyber Header -->
            <div class="bm-header">
              <div class="bm-title-group">
                <div class="bm-icon-glow">
                  <app-icon name="gamepad" [size]="20" color="#FF2D95" />
                </div>
                <div>
                  <h3 class="bm-title">3D CYBER QUIZ BATTLE</h3>
                  <span class="bm-sub">RAPID COMBAT ROUND • 30S ARENA</span>
                </div>
              </div>

              <div class="bm-header-controls">
                <!-- Sound Toggle -->
                <button class="bm-btn-sfx" (click)="audioService.toggleSound()">
                  <app-icon [name]="audioService.soundEnabled() ? 'volume-2' : 'volume-x'" [size]="16" [color]="audioService.soundEnabled() ? '#00E676' : 'rgba(255,255,255,0.4)'" />
                </button>

                <!-- Close Button -->
                <button class="bm-btn-close" (click)="closeBattleModal()">
                  <app-icon name="x" [size]="18" />
                </button>
              </div>
            </div>

            <!-- Battle Modal Body -->
            @if (!battleFinished()) {
              <div class="bm-body">
                <!-- HUD Status Ribbon -->
                <div class="bm-hud-strip">
                  <div class="bm-hud-timer" [class.danger]="battleTimer() <= 8">
                    <app-icon name="clock" [size]="16" [color]="battleTimer() <= 8 ? '#FF1744' : '#0099CC'" />
                    <span class="timer-num">{{ battleTimer() }}s</span>
                  </div>

                  <div class="bm-hud-progress">
                    <span>ROUND {{ activeModalQuestionIndex + 1 }} / {{ modalBattleQuestions.length }}</span>
                  </div>

                  <div class="bm-hud-streak" [class.active]="modalStreak() > 0">
                    <app-icon name="flame" [size]="15" [color]="modalStreak() > 0 ? '#FF2D95' : 'rgba(255,255,255,0.4)'" />
                    <span>{{ modalStreak() }}X STREAK</span>
                  </div>

                  <div class="bm-hud-xp">
                    <app-icon name="sparkles" [size]="14" color="#FFB300" />
                    <span>{{ modalXp() }} XP</span>
                  </div>
                </div>

                <!-- Floating Feedback Toast -->
                @if (modalToastText()) {
                  <div class="bm-floating-toast animate-pop">
                    {{ modalToastText() }}
                  </div>
                }

                <!-- Question Box -->
                <div class="bm-question-card">
                  <span class="bm-q-category">{{ currentModalQuestion.category }}</span>
                  <h2 class="bm-q-text">{{ currentModalQuestion.text }}</h2>
                </div>

                <!-- 4 3D Options Grid -->
                <div class="bm-options-grid">
                  @for (opt of currentModalQuestion.options; track opt.key) {
                    <button
                      class="bm-option-btn"
                      [class.selected]="modalSelectedKey() === opt.key"
                      [class.correct]="modalAnswerRevealed() && opt.correct"
                      [class.wrong]="modalAnswerRevealed() && modalSelectedKey() === opt.key && !opt.correct"
                      [disabled]="modalAnswerRevealed()"
                      (click)="onModalOptionClick(opt)"
                    >
                      <span class="bm-keycap">{{ opt.key }}</span>
                      <span class="bm-opt-text">{{ opt.text }}</span>
                      @if (modalAnswerRevealed() && opt.correct) {
                        <span class="bm-indicator success">
                          <app-icon name="check" [size]="16" color="#00E676" />
                        </span>
                      }
                      @if (modalAnswerRevealed() && modalSelectedKey() === opt.key && !opt.correct) {
                        <span class="bm-indicator danger">
                          <app-icon name="x" [size]="16" color="#FF1744" />
                        </span>
                      }
                    </button>
                  }
                </div>

                <div class="bm-footer-hint">
                  <span>Pro-tip: Press keys <strong>[1-4]</strong> or <strong>[A-D]</strong> to lock in options instantly!</span>
                </div>
              </div>
            } @else {
              <!-- Battle Victory / Summary Screen -->
              <div class="bm-victory-screen animate-fade-in">
                <div class="victory-trophy-wrap">
                  <app-icon name="trophy" [size]="48" color="#FFB300" />
                </div>
                <h2 class="victory-heading">BATTLE COMPLETE!</h2>
                <p class="victory-sub">You conquered the rapid-fire assessment combat round.</p>

                <div class="victory-stats-row">
                  <div class="vstat-card">
                    <span class="vstat-lbl">TOTAL XP</span>
                    <span class="vstat-val text-rose">+{{ modalXp() }}</span>
                  </div>
                  <div class="vstat-card">
                    <span class="vstat-lbl">MAX STREAK</span>
                    <span class="vstat-val text-cerulean">{{ modalMaxStreak() }}x</span>
                  </div>
                  <div class="vstat-card">
                    <span class="vstat-lbl">BATTLE RANK</span>
                    <span class="vstat-val text-success">S-TIER</span>
                  </div>
                </div>

                <div class="victory-actions">
                  <button class="btn btn-gamer-outline btn-lg" (click)="restartModalBattle()">
                    <app-icon name="refresh-cw" [size]="16" />
                    <span>Play Again</span>
                  </button>
                  <a routerLink="/register" class="btn btn-gamer-primary btn-lg" (click)="closeBattleModal()">
                    <app-icon name="zap" [size]="18" />
                    <span>Enter Full Arena</span>
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <app-footer />
    </div>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: calc(100vh - 70px);
      display: flex;
      align-items: center;
      padding: 60px 0 80px;
      overflow: hidden;
      perspective: 1200px;
    }
    .hero-3d-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      opacity: 0.65;
    }
    .hero-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
    .cyber-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(0, 153, 204, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 153, 204, 0.04) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(circle at 50% 50%, black 40%, transparent 80%);
    }
    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.22;
      pointer-events: none;
    }
    .orb-1 {
      width: 650px; height: 650px;
      background: radial-gradient(circle, #007BA7, transparent 70%);
      top: -150px; right: -100px;
    }
    .orb-2 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #FF2D95, transparent 70%);
      bottom: -100px; left: -100px;
    }

    .hero-container {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      align-items: center;
      gap: 48px;
    }
    .hero-content {
      max-width: 600px;
    }

    .gamer-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 45, 149, 0.08);
      border: 1px solid rgba(255, 45, 149, 0.3);
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 0.76rem;
      font-weight: 700;
      color: #FF5AAE;
      letter-spacing: 0.08em;
      margin-bottom: 20px;
      box-shadow: 0 0 15px rgba(255, 45, 149, 0.15);
    }
    .live-dot {
      width: 6px; height: 6px;
      background: #00E676;
      border-radius: 50%;
      box-shadow: 0 0 8px #00E676;
      animation: pulseDot 2s infinite ease-in-out;
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    .hero-title {
      font-size: clamp(2.3rem, 4.6vw, 3.6rem);
      line-height: 1.14;
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
    }
    .hero-desc {
      font-size: 1.02rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.7;
      margin-bottom: 32px;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 36px;
    }

    /* Gamer Buttons */
    .btn-gamer-primary {
      background: linear-gradient(135deg, #007BA7, #0099CC 45%, #FF2D95 100%);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 700;
      letter-spacing: 0.02em;
      box-shadow: 0 8px 24px rgba(0, 123, 167, 0.35), 0 0 20px rgba(255, 45, 149, 0.25);
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .btn-gamer-primary:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 30px rgba(0, 123, 167, 0.5), 0 0 30px rgba(255, 45, 149, 0.4);
      color: white;
    }
    .btn-gamer-outline {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: white;
      padding: 14px 24px;
      border-radius: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      backdrop-filter: blur(8px);
      transition: all 0.25s ease;
    }
    .btn-gamer-outline:hover {
      background: rgba(0, 153, 204, 0.12);
      border-color: #0099CC;
      color: #0099CC;
      transform: translateY(-2px);
    }

    /* Telemetry Ribbon */
    .hero-telemetry-ribbon {
      display: flex;
      align-items: center;
      gap: 20px;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.07);
      padding: 12px 20px;
      border-radius: 14px;
      width: fit-content;
    }
    .ht-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .ht-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: white;
    }
    .ht-lbl {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.5);
    }
    .ht-divider {
      width: 1px;
      height: 28px;
      background: rgba(255, 255, 255, 0.1);
    }

    /* ── 3D HOLOGRAPHIC BATTLE TERMINAL ─────────────────────── */
    .hero-preview {
      position: relative;
      perspective: 1200px;
      transform-style: preserve-3d;
    }
    .cyber-terminal-3d {
      position: relative;
      background: #0f1217;
      border: 1px solid rgba(0, 153, 204, 0.35);
      border-radius: 20px;
      box-shadow:
        0 25px 60px rgba(0, 0, 0, 0.8),
        0 0 40px rgba(0, 123, 167, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      overflow: hidden;
      transform-style: preserve-3d;
      transition: transform 0.15s ease-out;
    }
    .specular-glare {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 10;
      opacity: 0.65;
      mix-blend-mode: overlay;
      transition: background 0.08s ease-out;
    }

    /* Terminal HUD Header */
    .terminal-hud-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      transform: translateZ(10px);
    }
    .pilot-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .pilot-avatar {
      width: 36px; height: 36px;
      border-radius: 8px;
      background: rgba(0, 123, 167, 0.15);
      border: 1px solid rgba(0, 153, 204, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pilot-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .pilot-tag {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .callsign {
      font-size: 0.78rem;
      font-weight: 700;
      color: white;
      letter-spacing: 0.04em;
    }
    .tier-badge {
      font-size: 0.64rem;
      font-weight: 800;
      color: #0099CC;
      background: rgba(0, 153, 204, 0.12);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid rgba(0, 153, 204, 0.3);
    }
    .xp-track-mini {
      width: 130px;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }
    .xp-fill-mini {
      height: 100%;
      background: linear-gradient(90deg, #007BA7, #FF2D95);
      border-radius: 4px;
      transition: width 0.4s ease;
    }

    .hud-status-cluster {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sfx-toggle-btn {
      width: 32px; height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .sfx-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .combo-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.74rem;
      font-weight: 800;
      padding: 5px 10px;
      border-radius: 50px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;
    }
    .combo-pill.active-combo {
      background: rgba(255, 45, 149, 0.15);
      border-color: rgba(255, 45, 149, 0.4);
      color: #FF5AAE;
      box-shadow: 0 0 15px rgba(255, 45, 149, 0.25);
    }

    /* Battle Stage Body */
    .battle-stage-body {
      position: relative;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      transform: translateZ(25px);
    }

    .floating-xp-burst {
      position: absolute;
      top: 15px;
      right: 25px;
      z-index: 20;
      background: linear-gradient(135deg, #FF2D95, #FF5AAE);
      color: white;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.82rem;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 50px;
      box-shadow: 0 0 20px rgba(255, 45, 149, 0.6);
      pointer-events: none;
    }

    .arena-question-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .quest-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .quest-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #0099CC;
      background: rgba(0, 153, 204, 0.1);
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid rgba(0, 153, 204, 0.25);
    }
    .quest-num {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.45);
      font-weight: 600;
    }
    .xp-badge-reward {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #FFB300;
      background: rgba(255, 179, 0, 0.1);
      border: 1px solid rgba(255, 179, 0, 0.25);
      padding: 3px 8px;
      border-radius: 4px;
    }

    /* Question Box */
    .hologram-question-box {
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 3px solid #0099CC;
      border-radius: 12px;
      padding: 16px;
    }
    .question-text {
      font-size: 1.05rem;
      font-weight: 600;
      color: white;
      line-height: 1.45;
    }

    /* Options Grid */
    .battle-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .battle-option-btn {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 12px;
      padding: 12px 14px;
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.86rem;
      text-align: left;
      transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
      cursor: pointer;
    }
    .battle-option-btn:hover:not([disabled]) {
      background: rgba(0, 153, 204, 0.1);
      border-color: rgba(0, 153, 204, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 123, 167, 0.2);
    }
    .key-binder {
      width: 24px; height: 24px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
      font-family: 'Space Grotesk', sans-serif;
      color: white;
      flex-shrink: 0;
    }
    .btn-text { flex: 1; font-weight: 500; }

    /* Correct / Wrong States */
    .battle-option-btn.correct {
      background: rgba(0, 230, 118, 0.12) !important;
      border-color: #00E676 !important;
      color: #00E676 !important;
      box-shadow: 0 0 20px rgba(0, 230, 118, 0.3) !important;
    }
    .battle-option-btn.wrong {
      background: rgba(255, 23, 68, 0.12) !important;
      border-color: #FF1744 !important;
      color: #FF1744 !important;
      box-shadow: 0 0 20px rgba(255, 23, 68, 0.3) !important;
    }
    .res-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Feedback Bar */
    .battle-feedback-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 12px 16px;
    }
    .feedback-msg {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .msg-title {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.02em;
    }
    .msg-title.success { color: #00E676; }
    .msg-title.warning { color: #FF2D95; }
    .msg-sub {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.55);
    }
    .btn-gamer-next {
      background: #007BA7;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 0.78rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .btn-gamer-next:hover {
      background: #0099CC;
      transform: translateY(-1px);
    }

    /* HUD Footer */
    .battle-hud-footer {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 14px;
    }
    .stat-pill {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sp-lbl {
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.45);
      font-weight: 700;
      letter-spacing: 0.06em;
    }
    .sp-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.96rem;
      font-weight: 700;
    }
    .text-cerulean { color: #0099CC; }
    .text-rose { color: #FF2D95; }
    .text-success { color: #00E676; }

    /* ── GAMING MATRIX SECTION ──────────────────────────────── */
    .gaming-matrix-section {
      padding: 30px 0 60px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .matrix-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .matrix-card {
      background: #111419;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      transition: all 0.3s ease;
    }
    .matrix-card:hover {
      border-color: rgba(0, 153, 204, 0.35);
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
    }
    .mc-icon {
      width: 50px; height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .rose-glow {
      background: rgba(255, 45, 149, 0.12);
      border: 1px solid rgba(255, 45, 149, 0.3);
    }
    .cyan-glow {
      background: rgba(0, 123, 167, 0.12);
      border: 1px solid rgba(0, 123, 167, 0.3);
    }
    .green-glow {
      background: rgba(0, 230, 118, 0.12);
      border: 1px solid rgba(0, 230, 118, 0.3);
    }
    .mc-info h4 {
      font-size: 1.05rem;
      font-weight: 700;
      color: white;
      margin-bottom: 6px;
    }
    .mc-info p {
      font-size: 0.84rem;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.55;
    }

    /* ── WORKFLOW & CATEGORIES ──────────────────────────────── */
    .section-heading { margin-bottom: 48px; }
    .section-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #0099CC;
      background: rgba(0, 123, 167, 0.08);
      padding: 4px 14px;
      border-radius: 50px;
      border: 1px solid rgba(0, 123, 167, 0.2);
      margin-bottom: 12px;
    }
    .section-heading h2 {
      font-size: clamp(2rem, 4vw, 2.75rem);
      margin-bottom: 12px;
    }
    .section-heading p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.05rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .workflow-section {
      padding: 90px 0;
      background: #0b0d11;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .workflow-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
    }
    .workflow-step {
      position: relative;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #111419;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
    }
    .step-num {
      position: absolute;
      top: 20px; right: 24px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.3rem;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.12);
    }
    .step-icon {
      width: 52px; height: 52px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .workflow-step h3 { font-size: 1.15rem; color: white; }
    .workflow-step p { font-size: 0.88rem; color: rgba(255, 255, 255, 0.55); line-height: 1.6; }

    .categories-section {
      padding: 90px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    .category-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 28px;
      background: #111419;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
    }
    .cat-icon-box {
      width: 48px; height: 48px;
      border-radius: 12px;
      background: rgba(0, 123, 167, 0.12);
      border: 1px solid rgba(0, 123, 167, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;
    }
    .category-card h4 { font-size: 1.15rem; color: white; }
    .category-card p { font-size: 0.88rem; color: rgba(255, 255, 255, 0.55); line-height: 1.6; flex: 1; }
    .cat-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.88rem;
      font-weight: 600;
      color: #0099CC;
      margin-top: 8px;
    }
    .cat-link:hover { color: #FF2D95; }

    /* Animations */
    .animate-pop {
      animation: popUp 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes popUp {
      from { transform: scale(0.6) translateY(10px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.25s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Features Section (1-Line Balanced Alignment) ─── */
    .container-wide {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .features-section {
      padding: 90px 0;
      background: #090c10;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .features-row-oneline {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
      align-items: stretch;
    }
    .feature-card-oneline {
      background: #11141a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 24px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100%;
      transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
      position: relative;
    }
    .feature-card-oneline:hover {
      border-color: rgba(0, 153, 204, 0.45);
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 153, 204, 0.15);
    }
    .feature-icon-wrapper {
      width: 44px; height: 44px;
      border-radius: 12px;
      border: 1px solid transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .feature-card-oneline h4 {
      font-size: 0.96rem;
      font-weight: 700;
      color: white;
      line-height: 1.35;
    }
    .feature-card-oneline p {
      font-size: 0.81rem;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.55;
      flex: 1;
    }

    @media (max-width: 1240px) {
      .features-row-oneline {
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
    }
    @media (max-width: 768px) {
      .features-row-oneline {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
    }
    @media (max-width: 480px) {
      .features-row-oneline {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 992px) {
      .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .hero-content {
        max-width: 100%;
        margin: 0 auto;
      }
      .hero-actions { justify-content: center; }
      .hero-telemetry-ribbon { margin: 0 auto 30px; }
      .hero-preview { max-width: 580px; margin: 0 auto; }
      .matrix-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 576px) {
      .battle-options-grid { grid-template-columns: 1fr; }
      .battle-hud-footer { grid-template-columns: 1fr; }
    }

    /* ── 3D Mini-Battle Interactive Modal ─────────────────── */
    .battle-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(4, 7, 12, 0.88);
      backdrop-filter: blur(14px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .battle-modal-frame {
      max-width: 680px;
      width: 100%;
      background: #0d1117;
      border: 1.5px solid rgba(0, 153, 204, 0.4);
      border-radius: 24px;
      box-shadow:
        0 25px 80px rgba(0, 0, 0, 0.9),
        0 0 50px rgba(0, 123, 167, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes modalPop {
      from { transform: scale(0.9) translateY(20px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
    .bm-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .bm-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .bm-icon-glow {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: rgba(255, 45, 149, 0.12);
      border: 1px solid rgba(255, 45, 149, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(255, 45, 149, 0.25);
    }
    .bm-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: white;
      letter-spacing: 0.02em;
      margin: 0;
    }
    .bm-sub {
      font-size: 0.68rem;
      font-weight: 700;
      color: #0099CC;
      letter-spacing: 0.08em;
    }
    .bm-header-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .bm-btn-sfx, .bm-btn-close {
      width: 34px; height: 34px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .bm-btn-sfx:hover, .bm-btn-close:hover {
      background: rgba(255, 255, 255, 0.12);
      color: white;
    }

    /* Modal Body */
    .bm-body {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      position: relative;
    }
    .bm-hud-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.07);
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .bm-hud-timer {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #0099CC;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.95rem;
    }
    .bm-hud-timer.danger {
      color: #FF1744;
      animation: dangerPulse 1s infinite alternate;
    }
    .bm-hud-progress {
      color: rgba(255, 255, 255, 0.55);
      font-weight: 600;
    }
    .bm-hud-streak {
      display: flex;
      align-items: center;
      gap: 5px;
      color: rgba(255, 255, 255, 0.5);
    }
    .bm-hud-streak.active {
      color: #FF5AAE;
      text-shadow: 0 0 10px rgba(255, 45, 149, 0.5);
    }
    .bm-hud-xp {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #FFB300;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.95rem;
    }

    .bm-floating-toast {
      position: absolute;
      top: 15px;
      right: 35px;
      z-index: 20;
      background: linear-gradient(135deg, #007BA7, #FF2D95);
      color: white;
      font-size: 0.8rem;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 50px;
      box-shadow: 0 0 20px rgba(255, 45, 149, 0.5);
    }

    .bm-question-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 3px solid #0099CC;
      border-radius: 14px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .bm-q-category {
      font-size: 0.72rem;
      font-weight: 700;
      color: #0099CC;
      letter-spacing: 0.06em;
    }
    .bm-q-text {
      font-size: 1.15rem;
      font-weight: 700;
      color: white;
      line-height: 1.45;
      margin: 0;
    }

    .bm-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .bm-option-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 12px;
      padding: 14px 16px;
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.9rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .bm-option-btn:hover:not([disabled]) {
      background: rgba(0, 153, 204, 0.1);
      border-color: rgba(0, 153, 204, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 123, 167, 0.2);
    }
    .bm-keycap {
      width: 26px; height: 26px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.74rem;
      font-weight: 800;
      font-family: 'Space Grotesk', sans-serif;
      color: white;
      flex-shrink: 0;
    }
    .bm-opt-text { flex: 1; font-weight: 500; }
    .bm-option-btn.correct {
      background: rgba(0, 230, 118, 0.15) !important;
      border-color: #00E676 !important;
      color: #00E676 !important;
      box-shadow: 0 0 20px rgba(0, 230, 118, 0.35) !important;
    }
    .bm-option-btn.wrong {
      background: rgba(255, 23, 68, 0.15) !important;
      border-color: #FF1744 !important;
      color: #FF1744 !important;
      box-shadow: 0 0 20px rgba(255, 23, 68, 0.35) !important;
    }
    .bm-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bm-footer-hint {
      text-align: center;
      font-size: 0.76rem;
      color: rgba(255, 255, 255, 0.4);
    }
    .bm-footer-hint strong { color: #0099CC; }

    /* Victory Screen */
    .bm-victory-screen {
      padding: 44px 32px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .victory-trophy-wrap {
      width: 80px; height: 80px;
      border-radius: 20px;
      background: rgba(255, 179, 0, 0.12);
      border: 1px solid rgba(255, 179, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px rgba(255, 179, 0, 0.3);
      animation: popUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .victory-heading {
      font-size: 1.8rem;
      font-weight: 800;
      color: white;
      letter-spacing: -0.01em;
      margin: 0;
    }
    .victory-sub {
      font-size: 0.94rem;
      color: rgba(255, 255, 255, 0.65);
      max-width: 440px;
      margin: 0;
    }
    .victory-stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      width: 100%;
      margin: 16px 0;
    }
    .vstat-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .vstat-lbl {
      font-size: 0.68rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.45);
      letter-spacing: 0.06em;
    }
    .vstat-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.35rem;
      font-weight: 800;
    }
    .victory-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
    }
    @media (max-width: 600px) {
      .bm-options-grid { grid-template-columns: 1fr; }
      .victory-stats-row { grid-template-columns: 1fr; }
    }
  `]
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('battleCard') battleCardRef!: ElementRef<HTMLElement>;

  categories = signal<Category[]>([]);
  publishedQuizzes = signal<Quiz[]>([]);

  features = [
    {
      iconName: 'lock',
      color: '#0099CC',
      glowColor: 'rgba(0, 153, 204, 0.4)',
      bgColor: 'rgba(0, 153, 204, 0.12)',
      title: 'Stateless JWT & BCrypt',
      desc: 'Cryptographic session tokens with role-based Spring Security guards protecting student and admin endpoints.'
    },
    {
      iconName: 'clock',
      color: '#FF2D95',
      glowColor: 'rgba(255, 45, 149, 0.4)',
      bgColor: 'rgba(255, 45, 149, 0.12)',
      title: 'Synchronized Timers',
      desc: 'Server-anchored exam countdown timers prevent client tampering and guarantee precise submission enforcement.'
    },
    {
      iconName: 'shield',
      color: '#00E676',
      glowColor: 'rgba(0, 230, 118, 0.4)',
      bgColor: 'rgba(0, 230, 118, 0.12)',
      title: 'Zero Leak Architecture',
      desc: 'Correct option flags and solution keys are strictly purged from student examination payloads until grading completes.'
    },
    {
      iconName: 'bar-chart',
      color: '#0099CC',
      glowColor: 'rgba(0, 153, 204, 0.4)',
      bgColor: 'rgba(0, 153, 204, 0.12)',
      title: 'Granular Analytics',
      desc: 'Instant diagnostic report cards: accuracy, completion time, score trends, and question-by-question explanations.'
    },
    {
      iconName: 'award',
      color: '#FF2D95',
      glowColor: 'rgba(255, 45, 149, 0.4)',
      bgColor: 'rgba(255, 45, 149, 0.12)',
      title: 'Dynamic Evaluation',
      desc: 'Immediate marks calculation against passing thresholds with distinction tracking and category-wise analysis.'
    },
    {
      iconName: 'refresh-cw',
      color: '#00E676',
      glowColor: 'rgba(0, 230, 118, 0.4)',
      bgColor: 'rgba(0, 230, 118, 0.12)',
      title: 'Resilient Exam Sessions',
      desc: 'Live answers auto-saved asynchronously. Page refresh or network jitter restores your active attempt seamlessly.'
    }
  ];

  // 3D Parallax & Glare State
  cardTransform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  glareBackground = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15), transparent 60%)';

  // ── 3D Mini-Battle Arena Modal State ─────────────────────
  battleModalOpen = signal<boolean>(false);
  battleFinished = signal<boolean>(false);
  battleTimer = signal<number>(30);
  modalXp = signal<number>(0);
  modalStreak = signal<number>(0);
  modalMaxStreak = signal<number>(0);
  activeModalQuestionIndex = 0;
  modalSelectedKey = signal<string | null>(null);
  modalAnswerRevealed = signal<boolean>(false);
  modalToastText = signal<string | null>(null);
  private battleTimerInterval: any = null;

  modalBattleQuestions: BattleQuestion[] = [
    {
      id: 101,
      text: 'Which data structure operates strictly on a First-In-First-Out (FIFO) basis?',
      category: 'DATA STRUCTURES',
      options: [
        { key: 'A', text: 'Stack (LIFO)', correct: false },
        { key: 'B', text: 'Queue (FIFO)', correct: true },
        { key: 'C', text: 'Priority Queue', correct: false },
        { key: 'D', text: 'Binary Heap', correct: false }
      ],
      explanation: 'Queues maintain First-In-First-Out ordering of elements.'
    },
    {
      id: 102,
      text: 'Which HTTP status code signifies that a requested resource was NOT found?',
      category: 'WEB & NETWORKING',
      options: [
        { key: 'A', text: '200 OK', correct: false },
        { key: 'B', text: '403 Forbidden', correct: false },
        { key: 'C', text: '404 Not Found', correct: true },
        { key: 'D', text: '500 Server Error', correct: false }
      ],
      explanation: 'HTTP 404 indicates the server cannot find the requested URL.'
    },
    {
      id: 103,
      text: 'In Java, which collection interface guarantees NO duplicate elements?',
      category: 'CORE JAVA & OOP',
      options: [
        { key: 'A', text: 'List', correct: false },
        { key: 'B', text: 'Vector', correct: false },
        { key: 'C', text: 'Set', correct: true },
        { key: 'D', text: 'ArrayList', correct: false }
      ],
      explanation: 'The Java Set interface contract strictly forbids duplicate elements.'
    },
    {
      id: 104,
      text: 'What is the average time complexity of Binary Search on a sorted array?',
      category: 'ALGORITHMS',
      options: [
        { key: 'A', text: 'O(1)', correct: false },
        { key: 'B', text: 'O(log n)', correct: true },
        { key: 'C', text: 'O(n)', correct: false },
        { key: 'D', text: 'O(n²)', correct: false }
      ],
      explanation: 'Binary Search halves the search space each step, giving O(log n).'
    }
  ];

  get currentModalQuestion(): BattleQuestion {
    return this.modalBattleQuestions[this.activeModalQuestionIndex];
  }

  // Gamified Mini-Quiz State
  streak = signal<number>(3);
  currentXp = signal<number>(2850);
  xpPercent = signal<number>(75);
  selectedOptionKey = signal<string | null>(null);
  revealed = signal<boolean>(false);
  wasCorrect = signal<boolean>(false);
  floatingXpText = signal<string | null>(null);

  activeQuestionIndex = 0;
  battleQuestions: BattleQuestion[] = [
    {
      id: 1,
      text: 'Which data structure guarantees O(1) average key lookup?',
      category: 'DATA STRUCTURES',
      options: [
        { key: 'A', text: 'Balanced Binary Search Tree', correct: false },
        { key: 'B', text: 'Hash Table', correct: true },
        { key: 'C', text: 'Skip List', correct: false },
        { key: 'D', text: 'Red-Black Tree', correct: false }
      ],
      explanation: 'Hash Tables offer amortized O(1) lookup using hashing algorithms.'
    },
    {
      id: 2,
      text: 'In Java, which keyword prevents a method from being overridden?',
      category: 'CORE JAVA & OOP',
      options: [
        { key: 'A', text: 'static', correct: false },
        { key: 'B', text: 'final', correct: true },
        { key: 'C', text: 'const', correct: false },
        { key: 'D', text: 'synchronized', correct: false }
      ],
      explanation: 'Marking a method final in Java locks its implementation.'
    },
    {
      id: 3,
      text: 'What is the average time complexity of QuickSort?',
      category: 'ALGORITHMS',
      options: [
        { key: 'A', text: 'O(n log n)', correct: true },
        { key: 'B', text: 'O(n²)', correct: false },
        { key: 'C', text: 'O(n)', correct: false },
        { key: 'D', text: 'O(log n)', correct: false }
      ],
      explanation: 'QuickSort divides problem space, giving O(n log n) expected runtime.'
    }
  ];

  get currentBattleQuestion(): BattleQuestion {
    return this.battleQuestions[this.activeQuestionIndex];
  }

  // 3D Canvas Animation variables
  private animationFrameId: number | null = null;
  private mouseCanvasX = 0;
  private mouseCanvasY = 0;

  constructor(
    private auth: AuthService,
    private router: Router,
    private quizService: QuizService,
    public audioService: AudioFxService
  ) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.auth.isAdmin() ? '/admin/dashboard' : '/student/dashboard']);
    }
  }

  ngOnInit(): void {
    this.quizService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats || []),
      error: () => this.categories.set([])
    });

    this.quizService.getPublishedQuizzes().subscribe({
      next: (quizzes) => this.publishedQuizzes.set(quizzes || []),
      error: () => this.publishedQuizzes.set([])
    });
  }

  ngAfterViewInit(): void {
    this.init3DCanvas();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.battleTimerInterval) {
      clearInterval(this.battleTimerInterval);
    }
  }

  // Mouse Parallax for 3D Terminal Card
  onCardMouseMove(event: MouseEvent): void {
    if (!this.battleCardRef) return;
    const el = this.battleCardRef.nativeElement;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -10;
    const rotY = ((x - centerX) / centerX) * 10;

    this.cardTransform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    const glareX = ((x / rect.width) * 100).toFixed(1);
    const glareY = ((y / rect.height) * 100).toFixed(1);
    this.glareBackground = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(0, 153, 204, 0.25), rgba(255, 45, 149, 0.1) 40%, transparent 75%)`;
  }

  onCardMouseLeave(): void {
    this.cardTransform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    this.glareBackground = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 60%)';
  }

  toggleSound(event: MouseEvent): void {
    event.stopPropagation();
    this.audioService.toggleSound();
  }

  // Answer Selection in Mini-Battle
  onAnswerClick(option: { key: string; text: string; correct: boolean }): void {
    if (this.revealed()) return;
    this.selectedOptionKey.set(option.key);
    this.revealed.set(true);
    this.wasCorrect.set(option.correct);

    if (option.correct) {
      this.audioService.playCritical();
      this.streak.update((s) => s + 1);
      const xpEarned = 150 + this.streak() * 20;
      this.currentXp.update((x) => x + xpEarned);
      this.xpPercent.set(Math.min(100, Math.round((this.currentXp() % 1000) / 10)));
      this.floatingXpText.set(`+${xpEarned} XP! ${this.streak()}x STREAK!`);
    } else {
      this.audioService.playWarning();
      this.streak.set(0);
      this.floatingXpText.set('DEFLECTED! STREAK RESET');
    }

    setTimeout(() => {
      this.floatingXpText.set(null);
    }, 2000);
  }

  nextBattleQuestion(): void {
    this.audioService.playClick();
    this.activeQuestionIndex = (this.activeQuestionIndex + 1) % this.battleQuestions.length;
    this.selectedOptionKey.set(null);
    this.revealed.set(false);
  }

  @HostListener('window:keydown', ['$event'])
  handleGlobalHotkeys(event: KeyboardEvent): void {
    if (!this.battleModalOpen()) return;

    if (event.key === 'Escape') {
      this.closeBattleModal();
      return;
    }

    if (this.battleFinished() || this.modalAnswerRevealed()) return;

    let optIdx = -1;
    if (['1', 'a', 'A'].includes(event.key)) optIdx = 0;
    if (['2', 'b', 'B'].includes(event.key)) optIdx = 1;
    if (['3', 'c', 'C'].includes(event.key)) optIdx = 2;
    if (['4', 'd', 'D'].includes(event.key)) optIdx = 3;

    if (optIdx >= 0 && this.currentModalQuestion && this.currentModalQuestion.options[optIdx]) {
      this.onModalOptionClick(this.currentModalQuestion.options[optIdx]);
    }
  }

  start3DMiniBattle(): void {
    this.audioService.playCombo();
    this.battleModalOpen.set(true);
    this.battleFinished.set(false);
    this.battleTimer.set(30);
    this.modalXp.set(0);
    this.modalStreak.set(0);
    this.modalMaxStreak.set(0);
    this.activeModalQuestionIndex = 0;
    this.modalSelectedKey.set(null);
    this.modalAnswerRevealed.set(false);
    this.modalToastText.set(null);

    if (this.battleTimerInterval) clearInterval(this.battleTimerInterval);
    this.battleTimerInterval = setInterval(() => {
      if (this.battleTimer() > 1) {
        this.battleTimer.update((t) => t - 1);
        if (this.battleTimer() === 8) {
          this.audioService.playWarning();
        }
      } else {
        this.battleTimer.set(0);
        clearInterval(this.battleTimerInterval);
        this.finishModalBattle();
      }
    }, 1000);
  }

  closeBattleModal(): void {
    if (this.battleTimerInterval) clearInterval(this.battleTimerInterval);
    this.battleModalOpen.set(false);
  }

  onModalOptionClick(option: { key: string; text: string; correct: boolean }): void {
    if (this.modalAnswerRevealed() || this.battleFinished()) return;
    this.modalSelectedKey.set(option.key);
    this.modalAnswerRevealed.set(true);

    if (option.correct) {
      this.audioService.playCritical();
      this.modalStreak.update((s) => s + 1);
      if (this.modalStreak() > this.modalMaxStreak()) {
        this.modalMaxStreak.set(this.modalStreak());
      }
      const earned = 150 + this.modalStreak() * 50;
      this.modalXp.update((x) => x + earned);
      this.modalToastText.set(`+${earned} XP! ${this.modalStreak()}X STREAK!`);
    } else {
      this.audioService.playWarning();
      this.modalStreak.set(0);
      this.modalToastText.set('SHIELD DEFLECTED! STREAK RESET');
    }

    setTimeout(() => {
      this.modalToastText.set(null);
      if (this.activeModalQuestionIndex < this.modalBattleQuestions.length - 1) {
        this.activeModalQuestionIndex++;
        this.modalSelectedKey.set(null);
        this.modalAnswerRevealed.set(false);
      } else {
        this.finishModalBattle();
      }
    }, 750);
  }

  private finishModalBattle(): void {
    if (this.battleTimerInterval) clearInterval(this.battleTimerInterval);
    this.audioService.playCombo();
    this.battleFinished.set(true);
  }

  restartModalBattle(): void {
    this.start3DMiniBattle();
  }

  // Real-time 3D Particle & Wireframe Mesh Canvas
  private init3DCanvas(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle nodes for floating 3D matrix
    const particleCount = 45;
    const particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number; color: string }[] = [];
    const colors = ['#007BA7', '#0099CC', '#FF2D95', '#00E676'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * window.innerWidth,
        y: (Math.random() - 0.5) * window.innerHeight,
        z: Math.random() * 800 + 100,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.5,
        color: colors[i % colors.length]
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 400;

      angle += 0.003;

      // Draw interactive glowing 3D wireframe polyhedron cube
      const cubeSize = 130;
      const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
      ];

      const projected: { x: number; y: number }[] = [];
      vertices.forEach(([vx, vy, vz]) => {
        // Rotate in 3D around X and Y
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const cosB = Math.cos(angle * 0.7);
        const sinB = Math.sin(angle * 0.7);

        // Y-axis rotation
        const x1 = vx * cosA - vz * sinA;
        const z1 = vx * sinA + vz * cosA;

        // X-axis rotation
        const y1 = vy * cosB - z1 * sinB;
        const z2 = vy * sinB + z1 * cosB + 550;

        const scale = fov / z2;
        projected.push({
          x: (x1 * cubeSize) * scale + (canvas.width * 0.78),
          y: (y1 * cubeSize) * scale + (canvas.height * 0.42)
        });
      });

      // Connect cube edges
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];

      ctx.strokeStyle = 'rgba(0, 153, 204, 0.28)';
      ctx.lineWidth = 1.2;
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[j].x, projected[j].y);
        ctx.stroke();
      });

      // Draw glowing vertices
      projected.forEach((p, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#0099CC' : '#FF2D95';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render 3D Floating Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z <= 10) p.z = 800;
        if (p.z > 800) p.z = 10;
        if (Math.abs(p.x) > canvas.width / 2) p.vx *= -1;
        if (Math.abs(p.y) > canvas.height / 2) p.vy *= -1;

        const scale = fov / p.z;
        const screenX = cx + p.x * scale;
        const screenY = cy + p.y * scale;

        if (screenX >= 0 && screenX <= canvas.width && screenY >= 0 && screenY <= canvas.height) {
          const radius = Math.max(1, 2.5 * scale);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(1, scale * 1.2);
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }
}
