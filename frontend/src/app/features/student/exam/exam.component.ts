import { Component, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AudioFxService } from '../../../core/services/audio-fx.service';
import { StartAttemptResponse, Question } from '../../../core/models/models';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [CommonModule, IconComponent, LoadingComponent],
  template: `
    <div class="exam-arena-page">
      <!-- 3D Gaming Ambient Grid -->
      <div class="arena-cyber-grid"></div>
      <div class="arena-glow-orb orb-cyan"></div>
      <div class="arena-glow-orb orb-rose"></div>

      <!-- Exam HUD Header -->
      <header class="exam-hud-header">
        <div class="brand-group">
          <div class="brand-badge-3d">
            <app-icon name="gamepad" [size]="18" color="#FF2D95" />
          </div>
          <div class="brand-info">
            <span class="brand-title">Rank<span class="brand-accent">Grade</span></span>
            <span class="battle-sub">3D CBT BATTLE ARENA</span>
          </div>
        </div>

        <div class="header-hud-center">
          <!-- 3D Pulsing Timer Reactor -->
          <div
            class="timer-reactor-3d"
            [class.danger]="remainingSeconds <= 120"
            [class.warning]="remainingSeconds <= 300 && remainingSeconds > 120"
          >
            <div class="reactor-core">
              <app-icon name="clock" [size]="16" [color]="remainingSeconds <= 120 ? '#FF1744' : '#0099CC'" />
              <span class="timer-digits">{{ formattedTime }}</span>
            </div>
            <div class="reactor-ring"></div>
          </div>

          <!-- Combo Streak HUD Indicator -->
          <div class="combo-hud-badge" [class.has-streak]="getAnsweredCount() > 0">
            <app-icon name="flame" [size]="15" [color]="getAnsweredCount() > 0 ? '#FF2D95' : 'rgba(255,255,255,0.4)'" />
            <span>{{ getAnsweredCount() }} LOCKED</span>
          </div>

          <!-- Sound FX Toggle -->
          <button
            class="arena-sound-btn"
            (click)="audioService.toggleSound()"
            [title]="audioService.soundEnabled() ? 'Audio FX: ON' : 'Audio FX: MUTED'"
          >
            <app-icon
              [name]="audioService.soundEnabled() ? 'volume-2' : 'volume-x'"
              [size]="15"
              [color]="audioService.soundEnabled() ? '#00E676' : 'rgba(255,255,255,0.4)'"
            />
          </button>

          <!-- Autosave Status -->
          <div class="autosave-indicator">
            @if (saveStatus() === 'saving') {
              <span class="save-status saving">
                <app-icon name="refresh-cw" [size]="12" customClass="spin" />
                Syncing...
              </span>
            } @else if (saveStatus() === 'saved') {
              <span class="save-status saved">
                <app-icon name="shield" [size]="12" color="#00E676" />
                Encrypted
              </span>
            } @else {
              <span class="save-status error">
                <app-icon name="alert-circle" [size]="12" color="#FF1744" />
                Sync Error
              </span>
            }
          </div>
        </div>

        <button class="btn btn-gamer-submit" (click)="confirmSubmit()">
          <app-icon name="check-circle" [size]="16" />
          <span>Finalize Battle</span>
        </button>
      </header>

      <!-- Main Battle Ground -->
      @if (loaded; as isLoaded) {
        <main class="exam-main-arena">
          <!-- Left: 3D Question Panel -->
          <section class="question-panel-3d">
            <!-- Corner Accents -->
            <div class="cyber-corner top-left"></div>
            <div class="cyber-corner top-right"></div>
            <div class="cyber-corner bottom-left"></div>
            <div class="cyber-corner bottom-right"></div>

            <!-- Floating Feedback Toast -->
            @if (floatingToast()) {
              <div class="floating-answer-toast animate-pop">
                {{ floatingToast() }}
              </div>
            }

            <div class="question-top-bar">
              <div class="q-progress-info">
                <span class="q-badge-gamer">NODE {{ currentIndex + 1 }} / {{ questions.length }}</span>
                <span class="q-marks-pill">{{ currentQuestion.marks }} Point{{ currentQuestion.marks > 1 ? 's' : '' }}</span>
                <span class="hotkey-tip">Hotkeys: [1-4] or [A-D]</span>
              </div>

              <!-- Flag for Review Button -->
              <button
                class="flag-btn-gamer"
                [class.flagged]="flaggedQuestions[currentQuestion.id]"
                (click)="toggleFlag(currentQuestion.id)"
                title="Mark this question for review (Shortcut: F)"
              >
                <app-icon name="flag" [size]="14" [color]="flaggedQuestions[currentQuestion.id] ? '#FFB300' : 'rgba(255,255,255,0.5)'" />
                <span>{{ flaggedQuestions[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review [F]' }}</span>
              </button>
            </div>

            <div class="question-body">
              <h2 class="q-text-3d">{{ currentQuestion.questionText }}</h2>

              <div class="options-grid-3d">
                @for (opt of currentQuestion.options; let optIdx = $index; track opt.id) {
                  <div
                    class="option-card-3d"
                    [class.selected]="selectedAnswers[currentQuestion.id] === opt.id"
                    (click)="selectOption(currentQuestion.id, opt.id)"
                  >
                    <span class="option-gamer-key">{{ getOptionLetter(opt.optionOrder) }}</span>
                    <span class="option-content-text">{{ opt.optionText }}</span>
                    @if (selectedAnswers[currentQuestion.id] === opt.id) {
                      <span class="selected-glow-mark">
                        <app-icon name="check" [size]="16" color="#00E676" />
                      </span>
                    }
                  </div>
                }
              </div>
            </div>

            <div class="question-footer-3d">
              <div class="footer-left">
                <button
                  class="btn btn-arena-nav"
                  [disabled]="currentIndex === 0"
                  (click)="navigate(currentIndex - 1)"
                >
                  <app-icon name="chevron-left" [size]="15" />
                  <span>Prev [←]</span>
                </button>

                @if (selectedAnswers[currentQuestion.id]) {
                  <button class="btn btn-ghost-gamer" (click)="clearChoice(currentQuestion.id)">
                    Clear Selection
                  </button>
                }
              </div>

              <div class="footer-right">
                @if (currentIndex < questions.length - 1) {
                  <button class="btn btn-arena-primary" (click)="navigate(currentIndex + 1)">
                    <span>Next Node [→]</span>
                    <app-icon name="chevron-right" [size]="15" />
                  </button>
                } @else {
                  <button class="btn btn-gamer-submit" (click)="confirmSubmit()">
                    <app-icon name="check-circle" [size]="16" />
                    <span>Review &amp; Submit</span>
                  </button>
                }
              </div>
            </div>
          </section>

          <!-- Right: Tactical Node Matrix (Palette) -->
          <aside class="palette-panel-3d">
            <div class="palette-header">
              <app-icon name="box" [size]="18" color="#0099CC" />
              <h3>Tactical Node Matrix</h3>
            </div>

            <div class="palette-grid-3d">
              @for (q of questions; let i = $index; track q.id) {
                <button
                  class="node-btn-3d"
                  [class.current]="currentIndex === i"
                  [class.answered]="selectedAnswers[q.id]"
                  [class.flagged]="flaggedQuestions[q.id]"
                  (click)="navigate(i)"
                >
                  <span class="node-num">{{ i + 1 }}</span>
                  @if (flaggedQuestions[q.id]) {
                    <span class="node-flag-dot"></span>
                  }
                </button>
              }
            </div>

            <div class="palette-legend-3d">
              <div class="leg-item"><span class="leg-indicator answered"></span><span>Locked In</span></div>
              <div class="leg-item"><span class="leg-indicator unanswered"></span><span>Pending</span></div>
              <div class="leg-item"><span class="leg-indicator flagged"></span><span>Marked Review</span></div>
              <div class="leg-item"><span class="leg-indicator current"></span><span>Active Node</span></div>
            </div>

            <div class="palette-summary-3d">
              <div class="ps-row">
                <span>Completed Nodes:</span>
                <strong class="text-success">{{ getAnsweredCount() }} / {{ questions.length }}</strong>
              </div>
              <div class="ps-row">
                <span>Remaining:</span>
                <strong class="text-rose">{{ questions.length - getAnsweredCount() }}</strong>
              </div>
              <div class="ps-row">
                <span>Under Review:</span>
                <strong class="text-warning">{{ getFlaggedCount() }}</strong>
              </div>
            </div>
          </aside>
        </main>
      } @else {
        <app-loading label="Initializing 3D tactical exam session..." [height]="'400px'" />
      }

      <!-- Submit Confirmation Modal -->
      @if (showModal) {
        <div class="modal-backdrop">
          <div class="modal-card-3d">
            <div class="modal-icon-wrap">
              <app-icon name="shield" [size]="28" color="#0099CC" />
            </div>
            <h3>Finalize &amp; Submit Assessment</h3>
            <p>Confirm submission of your examination to the Spring Boot grading server.</p>

            <div class="modal-stats-grid">
              <div class="mstat-card">
                <span class="mstat-lbl">Locked</span>
                <span class="mstat-val text-success">{{ getAnsweredCount() }}</span>
              </div>
              <div class="mstat-card">
                <span class="mstat-lbl">Unattempted</span>
                <span class="mstat-val text-rose">{{ questions.length - getAnsweredCount() }}</span>
              </div>
              <div class="mstat-card">
                <span class="mstat-lbl">Flagged</span>
                <span class="mstat-val text-warning">{{ getFlaggedCount() }}</span>
              </div>
            </div>

            @if (questions.length - getAnsweredCount() > 0) {
              <div class="unanswered-warning">
                <app-icon name="alert-triangle" [size]="16" color="#FFB300" />
                <span>Notice: {{ questions.length - getAnsweredCount() }} unattempted question(s) will receive zero points.</span>
              </div>
            }

            <div class="modal-actions">
              <button class="btn btn-arena-nav" (click)="showModal = false" [disabled]="submitting">
                Resume Battle
              </button>
              <button class="btn btn-gamer-submit" (click)="doSubmit()" [disabled]="submitting">
                @if (submitting) {
                  Evaluating Telemetry...
                } @else {
                  Confirm Submission
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .exam-arena-page {
      position: relative;
      min-height: 100vh;
      background: #080a0e;
      color: white;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      perspective: 1200px;
    }
    .arena-cyber-grid {
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(0, 153, 204, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 153, 204, 0.03) 1px, transparent 1px);
      background-size: 35px 35px;
      pointer-events: none;
      z-index: 0;
    }
    .arena-glow-orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(140px);
      opacity: 0.18;
      pointer-events: none;
      z-index: 0;
    }
    .orb-cyan {
      width: 600px; height: 600px;
      background: radial-gradient(circle, #007BA7, transparent 70%);
      top: -150px; left: -100px;
    }
    .orb-rose {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #FF2D95, transparent 70%);
      bottom: -100px; right: -100px;
    }

    /* ── Exam HUD Header ────────────────────────────────────── */
    .exam-hud-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(13, 16, 23, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(0, 153, 204, 0.25);
      padding: 12px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-badge-3d {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: rgba(255, 45, 149, 0.12);
      border: 1px solid rgba(255, 45, 149, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(255, 45, 149, 0.25);
    }
    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      font-family: 'Space Grotesk', sans-serif;
      color: white;
      letter-spacing: -0.02em;
    }
    .brand-accent { color: #0099CC; }
    .battle-sub {
      display: block;
      font-size: 0.62rem;
      font-weight: 700;
      color: #FF5AAE;
      letter-spacing: 0.08em;
    }

    .header-hud-center {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    /* 3D Timer Reactor */
    .timer-reactor-3d {
      position: relative;
      display: flex;
      align-items: center;
      background: rgba(0, 153, 204, 0.08);
      border: 1px solid rgba(0, 153, 204, 0.3);
      padding: 6px 14px;
      border-radius: 50px;
      box-shadow: 0 0 15px rgba(0, 123, 167, 0.2);
    }
    .reactor-core {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .timer-digits {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0099CC;
      letter-spacing: 0.04em;
    }
    .timer-reactor-3d.warning {
      background: rgba(255, 179, 0, 0.1);
      border-color: #FFB300;
      box-shadow: 0 0 15px rgba(255, 179, 0, 0.3);
    }
    .timer-reactor-3d.warning .timer-digits { color: #FFB300; }
    .timer-reactor-3d.danger {
      background: rgba(255, 23, 68, 0.15);
      border-color: #FF1744;
      box-shadow: 0 0 20px rgba(255, 23, 68, 0.4);
      animation: dangerPulse 1s infinite alternate;
    }
    .timer-reactor-3d.danger .timer-digits { color: #FF1744; }
    @keyframes dangerPulse {
      from { transform: scale(1); }
      to { transform: scale(1.04); }
    }

    .combo-hud-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 6px 12px;
      border-radius: 50px;
      font-size: 0.74rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.6);
    }
    .combo-hud-badge.has-streak {
      background: rgba(255, 45, 149, 0.12);
      border-color: rgba(255, 45, 149, 0.35);
      color: #FF5AAE;
      box-shadow: 0 0 12px rgba(255, 45, 149, 0.2);
    }

    .arena-sound-btn {
      width: 32px; height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .arena-sound-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .save-status {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .save-status.saved { color: #00E676; }
    .save-status.saving { color: #0099CC; }
    .save-status.error { color: #FF1744; }

    .btn-gamer-submit {
      background: linear-gradient(135deg, #007BA7, #FF2D95);
      color: white;
      border: none;
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 0.84rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 15px rgba(255, 45, 149, 0.3);
      transition: all 0.2s ease;
    }
    .btn-gamer-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 45, 149, 0.45);
    }

    /* ── Main Layout ────────────────────────────────────────── */
    .exam-main-arena {
      position: relative;
      z-index: 1;
      max-width: 1300px;
      width: 100%;
      margin: 0 auto;
      padding: 32px 24px;
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 28px;
      align-items: start;
    }

    /* ── 3D Question Panel ──────────────────────────────────── */
    .question-panel-3d {
      position: relative;
      background: #0f1218;
      border: 1px solid rgba(0, 153, 204, 0.25);
      border-radius: 20px;
      padding: 32px;
      box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.7),
        0 0 30px rgba(0, 123, 167, 0.15);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Cyber Corner Accents */
    .cyber-corner {
      position: absolute;
      width: 12px; height: 12px;
      border-color: #0099CC;
      pointer-events: none;
    }
    .top-left { top: -1px; left: -1px; border-top: 2px solid #0099CC; border-left: 2px solid #0099CC; }
    .top-right { top: -1px; right: -1px; border-top: 2px solid #0099CC; border-right: 2px solid #0099CC; }
    .bottom-left { bottom: -1px; left: -1px; border-bottom: 2px solid #0099CC; border-left: 2px solid #0099CC; }
    .bottom-right { bottom: -1px; right: -1px; border-bottom: 2px solid #0099CC; border-right: 2px solid #0099CC; }

    .floating-answer-toast {
      position: absolute;
      top: 20px; right: 28px;
      z-index: 20;
      background: linear-gradient(135deg, #007BA7, #0099CC);
      color: white;
      font-size: 0.78rem;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 50px;
      box-shadow: 0 0 16px rgba(0, 153, 204, 0.5);
    }

    .question-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .q-progress-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .q-badge-gamer {
      background: rgba(0, 153, 204, 0.15);
      border: 1px solid rgba(0, 153, 204, 0.35);
      color: #0099CC;
      font-size: 0.78rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.04em;
    }
    .q-marks-pill {
      font-size: 0.76rem;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 600;
    }
    .hotkey-tip {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.35);
    }

    .flag-btn-gamer {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.65);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .flag-btn-gamer:hover { background: rgba(255, 255, 255, 0.08); color: white; }
    .flag-btn-gamer.flagged {
      background: rgba(255, 179, 0, 0.12);
      border-color: rgba(255, 179, 0, 0.35);
      color: #FFB300;
    }

    .q-text-3d {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.5;
      color: white;
      margin-bottom: 24px;
    }

    /* 3D Options Grid */
    .options-grid-3d {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .option-card-3d {
      position: relative;
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(255, 255, 255, 0.02);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 14px 18px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    }
    .option-card-3d:hover {
      background: rgba(0, 153, 204, 0.08);
      border-color: rgba(0, 153, 204, 0.35);
      transform: translateX(4px);
    }
    .option-card-3d.selected {
      background: rgba(0, 123, 167, 0.16);
      border-color: #0099CC;
      box-shadow: 0 0 20px rgba(0, 123, 167, 0.25);
      transform: translateX(6px);
    }
    .option-gamer-key {
      width: 32px; height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.84rem;
      font-family: 'Space Grotesk', sans-serif;
      color: white;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .option-card-3d.selected .option-gamer-key {
      background: #007BA7;
      border-color: #0099CC;
      color: white;
      box-shadow: 0 0 10px #0099CC;
    }
    .option-content-text {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.45;
      flex: 1;
    }
    .selected-glow-mark {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Footer Buttons */
    .question-footer-3d {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .footer-left, .footer-right { display: flex; gap: 10px; }
    .btn-arena-nav {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.8);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-arena-nav:hover:not([disabled]) {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    .btn-arena-nav[disabled] { opacity: 0.4; cursor: not-allowed; }
    .btn-ghost-gamer {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.82rem;
      cursor: pointer;
      padding: 8px 12px;
    }
    .btn-ghost-gamer:hover { color: #FF1744; }
    .btn-arena-primary {
      background: #007BA7;
      color: white;
      border: none;
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 0.84rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-arena-primary:hover {
      background: #0099CC;
      transform: translateY(-1px);
    }

    /* ── Tactical Matrix Aside ──────────────────────────────── */
    .palette-panel-3d {
      background: #0f1218;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    }
    .palette-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .palette-header h3 {
      font-size: 1.05rem;
      color: white;
      font-weight: 700;
      margin: 0;
    }
    .palette-grid-3d {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .node-btn-3d {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
      color: rgba(255, 255, 255, 0.7);
      font-weight: 800;
      font-size: 0.82rem;
      font-family: 'Space Grotesk', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .node-btn-3d:hover {
      border-color: rgba(0, 153, 204, 0.5);
      color: white;
      transform: scale(1.05);
    }
    .node-btn-3d.answered {
      background: rgba(0, 230, 118, 0.15);
      border-color: rgba(0, 230, 118, 0.4);
      color: #00E676;
    }
    .node-btn-3d.current {
      box-shadow: 0 0 0 2px #0099CC, 0 0 12px rgba(0, 153, 204, 0.5);
      color: white;
    }
    .node-flag-dot {
      position: absolute;
      top: 4px; right: 4px;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #FFB300;
      box-shadow: 0 0 6px #FFB300;
    }

    .palette-legend-3d {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.5);
    }
    .leg-item { display: flex; align-items: center; gap: 6px; }
    .leg-indicator { width: 9px; height: 9px; border-radius: 3px; }
    .leg-indicator.answered { background: #00E676; }
    .leg-indicator.unanswered { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); }
    .leg-indicator.flagged { background: #FFB300; }
    .leg-indicator.current { border: 2px solid #0099CC; }

    .palette-summary-3d {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.65);
    }
    .ps-row { display: flex; justify-content: space-between; }
    .text-success { color: #00E676; }
    .text-rose { color: #FF2D95; }
    .text-warning { color: #FFB300; }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(10px);
      padding: 20px;
    }
    .modal-card-3d {
      padding: 36px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      border-radius: 20px;
      background: #111419;
      border: 1px solid rgba(0, 153, 204, 0.3);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 123, 167, 0.25);
    }
    .modal-icon-wrap {
      width: 56px; height: 56px;
      border-radius: 14px;
      background: rgba(0, 123, 167, 0.15);
      border: 1px solid rgba(0, 153, 204, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px auto;
    }
    .modal-card-3d h3 { font-size: 1.35rem; color: white; margin-bottom: 8px; }
    .modal-card-3d p { font-size: 0.88rem; color: rgba(255, 255, 255, 0.6); margin-bottom: 24px; }
    .modal-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .mstat-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .mstat-lbl { font-size: 0.68rem; text-transform: uppercase; color: rgba(255, 255, 255, 0.45); font-weight: 700; }
    .mstat-val { font-size: 1.25rem; font-weight: 800; font-family: 'Space Grotesk', sans-serif; }
    .unanswered-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 179, 0, 0.1);
      border: 1px solid rgba(255, 179, 0, 0.25);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 0.8rem;
      color: #FFB300;
      text-align: left;
      margin-bottom: 24px;
    }
    .modal-actions { display: flex; gap: 12px; justify-content: center; }

    @keyframes popUp {
      from { transform: scale(0.6) translateY(10px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
    .animate-pop { animation: popUp 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

    @media (max-width: 900px) {
      .exam-main-arena { grid-template-columns: 1fr; }
    }
  `]
})
export class ExamComponent implements OnInit, OnDestroy {
  attemptId: number = 0;
  questions: Question[] = [];
  currentIndex: number = 0;
  selectedAnswers: { [key: number]: number } = {};
  flaggedQuestions: { [key: number]: boolean } = {};
  remainingSeconds: number = 0;
  timerInterval: any = null;
  loaded: boolean = false;
  showModal: boolean = false;
  submitting: boolean = false;
  floatingToast = signal<string | null>(null);

  saveStatus = signal<'saved' | 'saving' | 'error'>('saved');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    public audioService: AudioFxService
  ) {}

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.showModal || !this.loaded) return;

    // Navigation hotkeys
    if ((event.key === 'ArrowRight' || event.key === 'n' || event.key === 'N') && this.currentIndex < this.questions.length - 1) {
      this.navigate(this.currentIndex + 1);
    } else if ((event.key === 'ArrowLeft' || event.key === 'p' || event.key === 'P') && this.currentIndex > 0) {
      this.navigate(this.currentIndex - 1);
    } else if (event.key === 'f' || event.key === 'F') {
      if (this.currentQuestion) {
        this.toggleFlag(this.currentQuestion.id);
      }
    } else if (['1', '2', '3', '4', 'a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(event.key)) {
      // Hotkey option selection
      let optIdx = -1;
      if (['1', 'a', 'A'].includes(event.key)) optIdx = 0;
      if (['2', 'b', 'B'].includes(event.key)) optIdx = 1;
      if (['3', 'c', 'C'].includes(event.key)) optIdx = 2;
      if (['4', 'd', 'D'].includes(event.key)) optIdx = 3;

      if (this.currentQuestion && this.currentQuestion.options && this.currentQuestion.options[optIdx]) {
        this.selectOption(this.currentQuestion.id, this.currentQuestion.options[optIdx].id);
      }
    }
  }

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    if (!quizId) {
      this.router.navigate(['/student/quizzes']);
      return;
    }

    this.quizService.startAttempt(quizId).subscribe({
      next: (resp: StartAttemptResponse) => {
        this.attemptId = resp.attemptId;
        this.questions = resp.questions;

        // Restore saved answers if resuming an existing in-progress attempt
        if (resp.savedAnswers) {
          Object.keys(resp.savedAnswers).forEach((qIdStr) => {
            const qId = Number(qIdStr);
            this.selectedAnswers[qId] = resp.savedAnswers![qIdStr];
          });
        }

        // Calculate accurate remaining time based on startedAt
        if (resp.startedAt) {
          const startedTime = new Date(resp.startedAt).getTime();
          const elapsedSecs = Math.floor((Date.now() - startedTime) / 1000);
          const totalSecs = resp.timeLimitMinutes * 60;
          this.remainingSeconds = Math.max(0, totalSecs - elapsedSecs);
        } else {
          this.remainingSeconds = resp.timeLimitMinutes * 60;
        }

        this.loaded = true;
        this.startTimer();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to start quiz examination.');
        this.router.navigate(['/student/quizzes']);
      }
    });
  }

  get currentQuestion(): Question {
    return this.questions[this.currentIndex] || {} as Question;
  }

  get formattedTime(): string {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        if (this.remainingSeconds === 120 || this.remainingSeconds === 60) {
          this.audioService.playWarning();
        }
      } else {
        clearInterval(this.timerInterval);
        this.autoSubmit();
      }
    }, 1000);
  }

  toggleFlag(questionId: number): void {
    this.flaggedQuestions[questionId] = !this.flaggedQuestions[questionId];
    this.audioService.playClick();
  }

  selectOption(questionId: number, optionId: number): void {
    const isNew = this.selectedAnswers[questionId] !== optionId;
    this.selectedAnswers[questionId] = optionId;
    this.saveStatus.set('saving');

    if (isNew) {
      this.audioService.playSelect();
      this.floatingToast.set(`NODE ${this.currentIndex + 1} LOCKED IN!`);
      setTimeout(() => this.floatingToast.set(null), 1400);
    }

    this.quizService.saveAnswer(this.attemptId, questionId, optionId).subscribe({
      next: () => this.saveStatus.set('saved'),
      error: () => this.saveStatus.set('error')
    });
  }

  clearChoice(questionId: number): void {
    delete this.selectedAnswers[questionId];
    this.saveStatus.set('saving');
    this.audioService.playClick();

    this.quizService.saveAnswer(this.attemptId, questionId, null).subscribe({
      next: () => this.saveStatus.set('saved'),
      error: () => this.saveStatus.set('error')
    });
  }

  navigate(idx: number): void {
    if (idx >= 0 && idx < this.questions.length) {
      this.currentIndex = idx;
      this.audioService.playClick();
    }
  }

  getOptionLetter(order: number): string {
    return String.fromCharCode(64 + order);
  }

  getAnsweredCount(): number {
    return Object.keys(this.selectedAnswers).length;
  }

  getFlaggedCount(): number {
    return Object.values(this.flaggedQuestions).filter(Boolean).length;
  }

  confirmSubmit(): void {
    this.audioService.playClick();
    this.showModal = true;
  }

  autoSubmit(): void {
    this.showModal = false;
    this.doSubmit();
  }

  doSubmit(): void {
    if (this.submitting) return;
    this.submitting = true;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.audioService.playCombo();

    this.quizService.submitAttempt(this.attemptId).subscribe({
      next: () => {
        this.router.navigate(['/student/result', this.attemptId]);
      },
      error: (err) => {
        alert(err.error?.message || 'Error submitting test.');
        this.submitting = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
