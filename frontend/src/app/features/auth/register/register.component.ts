import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AudioFxService } from '../../../core/services/audio-fx.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, IconComponent],
  template: `
    <div class="auth-page">
      <!-- Cybernetic Ambient Background -->
      <div class="auth-bg">
        <div class="cyber-grid"></div>
        <div class="glow-orb orb-rose"></div>
        <div class="glow-orb orb-cyan"></div>
        <div class="glow-orb orb-purple"></div>
        <div class="cyber-scanline"></div>
      </div>

      <!-- Top Utility Header Bar -->
      <header class="auth-header-bar">
        <a routerLink="/" class="back-pill" title="Return to RankGrade Home">
          <app-icon name="arrow-left" [size]="15" />
          <span>Back to Arena Home</span>
        </a>
        <div class="gateway-live-pill">
          <span class="pulse-indicator"></span>
          <span>STUDENT PASS: 100% FREE</span>
        </div>
      </header>

      <!-- Main Centered Auth Container -->
      <main class="auth-stage-container">
        <div class="auth-card-wrap">
          <div class="cyber-auth-card">
            <!-- Radiant Border Aura -->
            <div class="card-glow-rim"></div>

              <!-- Logo & Brand Header -->
              <div class="card-brand-header">
                <a routerLink="/" class="auth-brand" title="RankGrade Home">
                  <div class="logo-aura"></div>
                  <img src="assets/images/rankgrade-logo-dark.png" alt="RankGrade Logo" class="auth-logo-img" />
                </a>
                <h2 class="auth-title">Create Account</h2>
                <p class="auth-subtitle">Join candidates sharpening their skills with real-time telemetry</p>
              </div>

              <!-- Error Alert -->
              @if (error) {
                <div class="alert alert-error animate-shake">
                  <app-icon name="alert-circle" [size]="16" color="#FF1744" />
                  <span>{{ error }}</span>
                </div>
              }

              <!-- Success Alert -->
              @if (success) {
                <div class="alert alert-success animate-pop">
                  <app-icon name="check-circle" [size]="16" color="#00E676" />
                  <span>{{ success }}</span>
                </div>
              }

              <!-- Registration Form -->
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
                <!-- Full Legal Name -->
                <div class="form-group">
                  <label class="form-label" for="fullName">
                    <span class="label-dot cyan-dot"></span>
                    FULL LEGAL NAME
                  </label>
                  <div class="input-field-wrap">
                    <app-icon name="user" [size]="16" color="rgba(0, 210, 255, 0.7)" customClass="field-icon" />
                    <input
                      id="fullName"
                      class="cyber-input"
                      type="text"
                      formControlName="fullName"
                      placeholder="e.g. John Doe"
                      autocomplete="name"
                    />
                  </div>
                  @if (form.get('fullName')?.invalid && form.get('fullName')?.touched) {
                    <span class="error-text">Full legal name is required</span>
                  }
                </div>

                <!-- Username -->
                <div class="form-group">
                  <label class="form-label" for="username">
                    <span class="label-dot purple-dot"></span>
                    PILOT USERNAME
                  </label>
                  <div class="input-field-wrap">
                    <app-icon name="user" [size]="16" color="rgba(168, 85, 247, 0.7)" customClass="field-icon" />
                    <input
                      id="username"
                      class="cyber-input"
                      type="text"
                      formControlName="username"
                      placeholder="e.g. cyber_pilot_01"
                      autocomplete="username"
                    />
                  </div>
                  @if (form.get('username')?.invalid && form.get('username')?.touched) {
                    <span class="error-text">Username must be at least 3 characters</span>
                  }
                </div>

                <!-- Email Address -->
                <div class="form-group">
                  <label class="form-label" for="email">
                    <span class="label-dot green-dot"></span>
                    EMAIL ADDRESS
                  </label>
                  <div class="input-field-wrap">
                    <app-icon name="mail" [size]="16" color="rgba(0, 230, 118, 0.7)" customClass="field-icon" />
                    <input
                      id="email"
                      class="cyber-input"
                      type="email"
                      formControlName="email"
                      placeholder="pilot@university.edu"
                      autocomplete="email"
                    />
                  </div>
                  @if (form.get('email')?.invalid && form.get('email')?.touched) {
                    <span class="error-text">Valid email address is required</span>
                  }
                </div>

                <!-- Create Password -->
                <div class="form-group">
                  <label class="form-label" for="password">
                    <span class="label-dot rose-dot"></span>
                    CREATE PASSWORD
                  </label>
                  <div class="input-field-wrap">
                    <app-icon name="lock" [size]="16" color="rgba(255, 45, 149, 0.7)" customClass="field-icon" />
                    <input
                      id="password"
                      class="cyber-input"
                      [type]="showPwd ? 'text' : 'password'"
                      formControlName="password"
                      placeholder="Minimum 6 characters"
                      autocomplete="new-password"
                    />
                    <button
                      type="button"
                      class="pwd-toggle-btn"
                      (click)="togglePassword()"
                      [title]="showPwd ? 'Hide password' : 'Show password'"
                    >
                      <app-icon [name]="showPwd ? 'lock' : 'eye'" [size]="15" />
                    </button>
                  </div>
                  @if (form.get('password')?.invalid && form.get('password')?.touched) {
                    <span class="error-text">Password must be at least 6 characters</span>
                  }
                </div>

                <!-- Submit Action Button -->
                <button
                  id="registerBtn"
                  type="submit"
                  class="btn-cyber-submit"
                  [disabled]="loading || form.invalid"
                >
                  <div class="btn-shimmer"></div>
                  @if (loading) {
                    <app-icon name="refresh-cw" [size]="17" customClass="spin" />
                    <span>INITIALIZING WORKSPACE...</span>
                  } @else {
                    <app-icon name="zap" [size]="17" />
                    <span>CREATE FREE STUDENT ACCOUNT</span>
                  }
                </button>
              </form>

              <!-- Footer Switch -->
              <div class="auth-card-footer">
                <span class="footer-msg">Already have an arena account?</span>
                <a routerLink="/login" class="footer-link">
                  <span>Sign in to arena</span>
                  <app-icon name="arrow-right" [size]="13" />
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    `,
    styles: [`
      .auth-page {
        min-height: 100vh;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: #08090D;
        color: #FFFFFF;
        overflow: hidden;
      }

      /* ── Futuristic Background Elements ── */
      .auth-bg {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
      }
      .cyber-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255, 45, 149, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 210, 255, 0.035) 1px, transparent 1px);
        background-size: 44px 44px;
        mask-image: radial-gradient(circle at 50% 40%, black 50%, transparent 85%);
      }
      .glow-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(130px);
        opacity: 0.22;
      }
      .orb-rose {
        width: 580px;
        height: 580px;
        background: radial-gradient(circle, #ff2d95, transparent 70%);
        top: -120px;
        right: -80px;
      }
      .orb-cyan {
        width: 580px;
        height: 580px;
        background: radial-gradient(circle, #00d2ff, transparent 70%);
        bottom: -150px;
        left: -100px;
      }
      .orb-purple {
        width: 480px;
        height: 480px;
        background: radial-gradient(circle, #7928ca, transparent 70%);
        top: 35%;
        right: 35%;
        opacity: 0.15;
      }
      .cyber-scanline {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to bottom,
          transparent 50%,
          rgba(0, 0, 0, 0.25) 51%
        );
        background-size: 100% 4px;
        opacity: 0.25;
      }

      /* ── Top Bar ── */
      .auth-header-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 32px;
        width: 100%;
        box-sizing: border-box;
      }
      .back-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 50px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.78rem;
        font-weight: 600;
        text-decoration: none;
        backdrop-filter: blur(10px);
        transition: all 0.25s ease;
      }
      .back-pill:hover {
        background: rgba(255, 45, 149, 0.1);
        border-color: rgba(255, 45, 149, 0.35);
        color: #ff5aae;
        transform: translateX(-3px);
      }
      .gateway-live-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 10px;
        border-radius: 50px;
        background: rgba(0, 230, 118, 0.08);
        border: 1px solid rgba(0, 230, 118, 0.25);
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: #00E676;
      }
      .pulse-indicator {
        width: 6px;
        height: 6px;
        background: #00E676;
        border-radius: 50%;
        box-shadow: 0 0 8px #00E676;
        animation: pulseGreen 2s infinite ease-in-out;
      }
      @keyframes pulseGreen {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.85); }
      }

      /* ── Main Centered Auth Container ── */
      .auth-stage-container {
        position: relative;
        z-index: 5;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 20px;
      }
      .auth-card-wrap {
        width: 100%;
        max-width: 430px;
        margin: 0 auto;
        display: flex;
        justify-content: center;
        animation: fadeInUp 0.4s ease;
      }
      .cyber-auth-card {
        width: 100%;
        position: relative;
        background: rgba(14, 18, 26, 0.88);
        border: 1px solid rgba(255, 45, 149, 0.22);
        border-radius: 20px;
        padding: 16px 24px;
        backdrop-filter: blur(28px);
        box-shadow:
          0 0 50px rgba(255, 45, 149, 0.1),
          0 24px 48px rgba(0, 0, 0, 0.75),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        animation: fadeInUp 0.4s ease;
        overflow: hidden;
      }
    .card-glow-rim {
      position: absolute;
      top: 0;
      left: 15%;
      right: 15%;
      height: 1px;
      background: linear-gradient(90deg, transparent, #ff2d95, #00d2ff, transparent);
      box-shadow: 0 0 12px #ff2d95;
    }

    /* ── Card Brand & Header ── */
    .card-brand-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 10px;
    }
    .auth-brand {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;
      text-decoration: none;
    }
    .logo-aura {
      position: absolute;
      width: 60px;
      height: 25px;
      background: radial-gradient(circle, rgba(255, 45, 149, 0.35), transparent 70%);
      filter: blur(8px);
    }
    .auth-logo-img {
      position: relative;
      z-index: 1;
      height: 36px;
      width: auto;
      filter: drop-shadow(0 4px 18px rgba(255, 45, 149, 0.35));
      transition: transform 0.25s ease;
    }
    .auth-brand:hover .auth-logo-img {
      transform: scale(1.05);
    }
    .auth-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 2px;
      letter-spacing: -0.01em;
    }
    .auth-subtitle {
      font-size: 0.76rem;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.25;
      max-width: 300px;
    }

    /* ── Alerts ── */
    .alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 10px;
    }
    .alert-error {
      background: rgba(255, 23, 68, 0.12);
      border: 1px solid rgba(255, 23, 68, 0.35);
      color: #FF5252;
    }
    .alert-success {
      background: rgba(0, 230, 118, 0.12);
      border: 1px solid rgba(0, 230, 118, 0.35);
      color: #00E676;
    }
    .animate-shake {
      animation: shake 0.4s ease;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-5px); }
      40%, 80% { transform: translateX(5px); }
    }
    .animate-pop {
      animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes pop {
      0% { transform: scale(0.92); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    /* ── Form Inputs ── */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .form-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      color: rgba(255, 255, 255, 0.7);
    }
    .label-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
    }
    .cyan-dot { background: #00d2ff; box-shadow: 0 0 6px #00d2ff; }
    .purple-dot { background: #a855f7; box-shadow: 0 0 6px #a855f7; }
    .green-dot { background: #00E676; box-shadow: 0 0 6px #00E676; }
    .rose-dot { background: #ff2d95; box-shadow: 0 0 6px #ff2d95; }

    .input-field-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .field-icon {
      position: absolute;
      left: 12px;
      pointer-events: none;
      z-index: 2;
    }
    .cyber-input {
      width: 100%;
      height: 38px;
      padding: 0 38px 0 36px;
      background: rgba(255, 255, 255, 0.04);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #FFFFFF;
      font-family: 'Outfit', sans-serif;
      font-size: 0.88rem;
      transition: all 0.25s ease;
      outline: none;
    }
    .cyber-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
      font-size: 0.82rem;
    }
    .cyber-input:focus {
      background: rgba(255, 45, 149, 0.05);
      border-color: #ff2d95;
      box-shadow: 0 0 16px rgba(255, 45, 149, 0.3), inset 0 0 6px rgba(255, 45, 149, 0.1);
    }
    .pwd-toggle-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 6px;
      transition: all 0.2s ease;
      z-index: 2;
    }
    .pwd-toggle-btn:hover {
      color: #ff5aae;
      background: rgba(255, 255, 255, 0.06);
    }
    .error-text {
      color: #FF5252;
      font-size: 0.7rem;
      font-weight: 500;
      padding-left: 2px;
    }

    /* ── Cyber Submit Button ── */
    .btn-cyber-submit {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 44px;
      background: linear-gradient(135deg, #ff2d95 0%, #7928ca 50%, #00d2ff 100%);
      background-size: 200% 200%;
      border: none;
      border-radius: 10px;
      color: #FFFFFF;
      font-size: 0.88rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(255, 45, 149, 0.4);
      transition: all 0.3s ease;
      overflow: hidden;
      margin-top: 4px;
    }
    .btn-cyber-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 28px rgba(255, 45, 149, 0.6), 0 0 16px rgba(0, 210, 255, 0.4);
      background-position: 100% 100%;
    }
    .btn-cyber-submit:active:not(:disabled) {
      transform: translateY(0);
    }
    .btn-cyber-submit:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none;
    }
    .btn-shimmer {
      position: absolute;
      top: 0;
      left: -100%;
      width: 60%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.25),
        transparent
      );
      transform: skewX(-20deg);
      transition: 0.6s ease;
    }
    .btn-cyber-submit:hover:not(:disabled) .btn-shimmer {
      left: 140%;
    }

    /* ── Card Footer ── */
    .auth-card-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 12px;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.55);
      flex-wrap: wrap;
    }

    /* ── Alerts ── */
    .alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 18px;
    }
    .alert-error {
      background: rgba(255, 23, 68, 0.12);
      border: 1px solid rgba(255, 23, 68, 0.35);
      color: #FF5252;
    }
    .alert-success {
      background: rgba(0, 230, 118, 0.12);
      border: 1px solid rgba(0, 230, 118, 0.35);
      color: #00E676;
    }
    .animate-shake {
      animation: shake 0.4s ease;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-5px); }
      40%, 80% { transform: translateX(5px); }
    }
    .animate-pop {
      animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes pop {
      0% { transform: scale(0.92); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    /* ── Form Inputs ── */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      color: rgba(255, 255, 255, 0.7);
    }
    .label-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
    }
    .cyan-dot { background: #00d2ff; box-shadow: 0 0 6px #00d2ff; }
    .purple-dot { background: #a855f7; box-shadow: 0 0 6px #a855f7; }
    .green-dot { background: #00E676; box-shadow: 0 0 6px #00E676; }
    .rose-dot { background: #ff2d95; box-shadow: 0 0 6px #ff2d95; }

    .input-field-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .field-icon {
      position: absolute;
      left: 14px;
      pointer-events: none;
      z-index: 2;
    }
    .cyber-input {
      width: 100%;
      height: 46px;
      padding: 0 44px 0 42px;
      background: rgba(255, 255, 255, 0.04);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: #FFFFFF;
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      transition: all 0.25s ease;
      outline: none;
    }
    .cyber-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
      font-size: 0.9rem;
    }
    .cyber-input:focus {
      background: rgba(255, 45, 149, 0.05);
      border-color: #ff2d95;
      box-shadow: 0 0 20px rgba(255, 45, 149, 0.3), inset 0 0 8px rgba(255, 45, 149, 0.1);
    }
    .pwd-toggle-btn {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 6px;
      transition: all 0.2s ease;
      z-index: 2;
    }
    .pwd-toggle-btn:hover {
      color: #ff5aae;
      background: rgba(255, 255, 255, 0.06);
    }
    .error-text {
      color: #FF5252;
      font-size: 0.75rem;
      font-weight: 500;
      padding-left: 2px;
    }

    /* ── Cyber Submit Button ── */
    .btn-cyber-submit {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      height: 52px;
      background: linear-gradient(135deg, #ff2d95 0%, #7928ca 50%, #00d2ff 100%);
      background-size: 200% 200%;
      border: none;
      border-radius: 12px;
      color: #FFFFFF;
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      cursor: pointer;
      box-shadow: 0 4px 25px rgba(255, 45, 149, 0.4);
      transition: all 0.3s ease;
      overflow: hidden;
      margin-top: 6px;
    }
    .btn-cyber-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 32px rgba(255, 45, 149, 0.6), 0 0 20px rgba(0, 210, 255, 0.4);
      background-position: 100% 100%;
    }
    .btn-cyber-submit:active:not(:disabled) {
      transform: translateY(0);
    }
    .btn-cyber-submit:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none;
    }
    .btn-shimmer {
      position: absolute;
      top: 0;
      left: -100%;
      width: 60%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.25),
        transparent
      );
      transform: skewX(-20deg);
      transition: 0.6s ease;
    }
    .btn-cyber-submit:hover:not(:disabled) .btn-shimmer {
      left: 140%;
    }

    /* ── Card Footer ── */
    .auth-card-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 22px;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.55);
      flex-wrap: wrap;
    }
    .footer-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #00d2ff;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .footer-link:hover {
      color: #ff5aae;
      transform: translateX(2px);
    }

    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  showPwd = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private audioFx: AudioFxService
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPwd = !this.showPwd;
    this.audioFx.playClick();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    this.success = null;
    this.audioFx.playClick();

    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.audioFx.playCombo();
        this.success = 'Account initialized! Redirecting to student battle workspace...';
        setTimeout(() => this.router.navigate(['/student/dashboard']), 1200);
      },
      error: (err) => {
        this.loading = false;
        this.audioFx.playWarning();
        this.error = err.error?.message || 'Registration failed. Username or email may already be registered.';
      }
    });
  }
}
