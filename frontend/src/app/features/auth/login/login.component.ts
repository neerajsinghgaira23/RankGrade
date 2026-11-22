import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AudioFxService } from '../../../core/services/audio-fx.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, IconComponent],
  template: `
    <div class="auth-page">
      <!-- Cybernetic Ambient Background -->
      <div class="auth-bg">
        <div class="cyber-grid"></div>
        <div class="glow-orb orb-cyan"></div>
        <div class="glow-orb orb-rose"></div>
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
          <span>GATEWAY: ONLINE</span>
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
                <h2 class="auth-title">Welcome Back</h2>
                <p class="auth-subtitle">Sign in to resume assessments and view telemetry</p>
              </div>

              <!-- Error Alert -->
              @if (error) {
                <div class="alert alert-error animate-shake">
                  <app-icon name="alert-circle" [size]="16" color="#FF1744" />
                  <span>{{ error }}</span>
                </div>
              }

              <!-- Login Form -->
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
                <!-- Username / Email Field -->
                <div class="form-group">
                  <label class="form-label" for="usernameOrEmail">
                    <span class="label-dot cyan-dot"></span>
                    EMAIL OR USERNAME
                  </label>
                  <div class="input-field-wrap">
                    <app-icon name="user" [size]="16" color="rgba(0, 210, 255, 0.7)" customClass="field-icon" />
                    <input
                      id="usernameOrEmail"
                      class="cyber-input"
                      type="text"
                      formControlName="usernameOrEmail"
                      placeholder="admin or student"
                      autocomplete="username"
                    />
                  </div>
                  @if (form.get('usernameOrEmail')?.invalid && form.get('usernameOrEmail')?.touched) {
                    <span class="error-text">
                      Username or email is required
                    </span>
                  }
                </div>

                <!-- Password Field -->
                <div class="form-group">
                  <label class="form-label" for="password">
                    <span class="label-dot rose-dot"></span>
                    SECURITY PASSWORD
                  </label>
                  <div class="input-field-wrap">
                    <app-icon name="lock" [size]="16" color="rgba(255, 45, 149, 0.7)" customClass="field-icon" />
                    <input
                      id="password"
                      class="cyber-input"
                      [type]="showPwd ? 'text' : 'password'"
                      formControlName="password"
                      placeholder="Enter account password"
                      autocomplete="current-password"
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
                    <span class="error-text">
                      Password is required
                    </span>
                  }
                </div>

                <!-- Cyber Demo Quick-Fill Section -->
                <div class="demo-helpers">
                  <div class="demo-header">
                    <app-icon name="zap" [size]="12" color="#00d2ff" />
                    <span class="demo-lbl">Instant Demo Access</span>
                  </div>
                  <div class="demo-buttons">
                    <button
                      type="button"
                      class="demo-chip chip-student"
                      (click)="fillDemo('student', 'student123')"
                    >
                      <app-icon name="user" [size]="13" />
                      <span>Student Pilot</span>
                    </button>
                    <button
                      type="button"
                      class="demo-chip chip-admin"
                      (click)="fillDemo('admin', 'admin123')"
                    >
                      <app-icon name="shield" [size]="13" />
                      <span>Admin Console</span>
                    </button>
                  </div>
                </div>

                <!-- Submit Action Button -->
                <button
                  id="loginBtn"
                  type="submit"
                  class="btn-cyber-submit"
                  [disabled]="loading || form.invalid"
                >
                  <div class="btn-shimmer"></div>
                  @if (loading) {
                    <app-icon name="refresh-cw" [size]="17" customClass="spin" />
                    <span>AUTHENTICATING TELEMETRY...</span>
                  } @else {
                    <app-icon name="log-in" [size]="17" />
                    <span>SIGN IN TO PLATFORM</span>
                  }
                </button>
              </form>

              <!-- Footer Switch -->
              <div class="auth-card-footer">
                <span class="footer-msg">Need an arena pass?</span>
                <a routerLink="/register" class="footer-link">
                  <span>Create free student account</span>
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
          linear-gradient(rgba(0, 210, 255, 0.035) 1px, transparent 1px),
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
      .orb-cyan {
        width: 550px;
        height: 550px;
        background: radial-gradient(circle, #00d2ff, transparent 70%);
        top: -120px;
        left: -80px;
      }
      .orb-rose {
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, #ff2d95, transparent 70%);
        bottom: -150px;
        right: -100px;
      }
      .orb-purple {
        width: 450px;
        height: 450px;
        background: radial-gradient(circle, #7928ca, transparent 70%);
        top: 40%;
        left: 35%;
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
        padding: 16px 32px;
        width: 100%;
        box-sizing: border-box;
      }
      .back-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 50px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        font-weight: 600;
        text-decoration: none;
        backdrop-filter: blur(10px);
        transition: all 0.25s ease;
      }
      .back-pill:hover {
        background: rgba(0, 210, 255, 0.1);
        border-color: rgba(0, 210, 255, 0.35);
        color: #00d2ff;
        transform: translateX(-3px);
      }
      .gateway-live-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 12px;
        border-radius: 50px;
        background: rgba(0, 230, 118, 0.08);
        border: 1px solid rgba(0, 230, 118, 0.25);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: #00E676;
      }
      .pulse-indicator {
        width: 7px;
        height: 7px;
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
        max-width: 440px;
        margin: 0 auto;
        display: flex;
        justify-content: center;
        animation: fadeInUp 0.4s ease;
      }
    .cyber-auth-card {
      position: relative;
      background: rgba(14, 18, 26, 0.88);
      border: 1px solid rgba(0, 210, 255, 0.22);
      border-radius: 20px;
      padding: 28px 28px;
      backdrop-filter: blur(28px);
      box-shadow:
        0 0 50px rgba(0, 210, 255, 0.1),
        0 24px 48px rgba(0, 0, 0, 0.75),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      animation: fadeInUp 0.5s ease;
      overflow: hidden;
    }
    .card-glow-rim {
      position: absolute;
      top: 0;
      left: 15%;
      right: 15%;
      height: 1px;
      background: linear-gradient(90deg, transparent, #00d2ff, #ff2d95, transparent);
      box-shadow: 0 0 12px #00d2ff;
    }

    /* ── Card Brand & Header ── */
    .card-brand-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 18px;
    }
    .auth-brand {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      text-decoration: none;
    }
    .logo-aura {
      position: absolute;
      width: 80px;
      height: 35px;
      background: radial-gradient(circle, rgba(0, 210, 255, 0.35), transparent 70%);
      filter: blur(12px);
    }
    .auth-logo-img {
      position: relative;
      z-index: 1;
      height: 46px;
      width: auto;
      filter: drop-shadow(0 4px 18px rgba(0, 210, 255, 0.35));
      transition: transform 0.25s ease;
    }
    .auth-brand:hover .auth-logo-img {
      transform: scale(1.05);
    }
    .auth-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 4px;
      letter-spacing: -0.01em;
    }
    .auth-subtitle {
      font-size: 0.82rem;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.35;
      max-width: 320px;
    }

    /* ── Alert Error ── */
    .alert-error {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 10px;
      background: rgba(255, 23, 68, 0.12);
      border: 1px solid rgba(255, 23, 68, 0.35);
      color: #FF5252;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 20px;
    }
    .animate-shake {
      animation: shake 0.4s ease;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-5px); }
      40%, 80% { transform: translateX(5px); }
    }

    /* ── Form Inputs ── */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .form-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.73rem;
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
      height: 48px;
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
      background: rgba(0, 210, 255, 0.06);
      border-color: #00d2ff;
      box-shadow: 0 0 20px rgba(0, 210, 255, 0.3), inset 0 0 8px rgba(0, 210, 255, 0.1);
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
      color: #00d2ff;
      background: rgba(255, 255, 255, 0.06);
    }
    .error-text {
      color: #FF5252;
      font-size: 0.76rem;
      font-weight: 500;
      padding-left: 2px;
    }

    /* ── Demo Helpers Chips ── */
    .demo-helpers {
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .demo-header {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .demo-lbl {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: rgba(255, 255, 255, 0.55);
    }
    .demo-buttons {
      display: flex;
      gap: 10px;
    }
    .demo-chip {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }
    .chip-student {
      background: rgba(0, 210, 255, 0.08);
      border-color: rgba(0, 210, 255, 0.3);
      color: #00d2ff;
    }
    .chip-student:hover {
      background: rgba(0, 210, 255, 0.2);
      box-shadow: 0 0 16px rgba(0, 210, 255, 0.35);
      transform: translateY(-1px);
      color: #FFFFFF;
    }
    .chip-admin {
      background: rgba(255, 45, 149, 0.08);
      border-color: rgba(255, 45, 149, 0.3);
      color: #ff5aae;
    }
    .chip-admin:hover {
      background: rgba(255, 45, 149, 0.2);
      box-shadow: 0 0 16px rgba(255, 45, 149, 0.35);
      transform: translateY(-1px);
      color: #FFFFFF;
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
      background: linear-gradient(135deg, #00d2ff 0%, #7928ca 50%, #ff2d95 100%);
      background-size: 200% 200%;
      border: none;
      border-radius: 12px;
      color: #FFFFFF;
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      cursor: pointer;
      box-shadow: 0 4px 25px rgba(0, 210, 255, 0.4);
      transition: all 0.3s ease;
      overflow: hidden;
      margin-top: 6px;
    }
    .btn-cyber-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 32px rgba(0, 210, 255, 0.6), 0 0 20px rgba(255, 45, 149, 0.4);
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
      margin-top: 24px;
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
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  showPwd = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private audioFx: AudioFxService
  ) {
    this.form = this.fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePassword(): void {
    this.showPwd = !this.showPwd;
    this.audioFx.playClick();
  }

  fillDemo(u: string, p: string): void {
    this.form.patchValue({
      usernameOrEmail: u,
      password: p
    });
    this.audioFx.playSelect();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    this.audioFx.playClick();

    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.audioFx.playCombo();
        const role = res.data.role;
        this.router.navigate([role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.audioFx.playWarning();
        this.error = err.error?.message || 'Invalid credentials. Please verify your details.';
      }
    });
  }
}
