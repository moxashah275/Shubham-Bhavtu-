import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideKeyRound, LucideLoaderCircle } from '@lucide/angular';
import { OtpChallenge, otpValidator } from '../../../../core/models/auth.model';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthBrandPanelComponent } from '../../components/auth-brand-panel/auth-brand-panel.component';
import { AuthInputComponent } from '../../components/auth-input/auth-input.component';

@Component({
  selector: 'app-verify-otp',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthBrandPanelComponent,
    AuthInputComponent,
    LucideArrowRight,
    LucideLoaderCircle,
  ],
  templateUrl: './verify-otp.component.html',
})
export class VerifyOtpComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly otpIcon = LucideKeyRound;
  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly resending = signal(false);
  readonly otpError = signal('');
  readonly challenge = signal<OtpChallenge | null>(this.auth.getOtpChallenge());
  readonly resendIn = signal(this.auth.otpResendIn());

  private timer: ReturnType<typeof setInterval> | undefined;

  readonly form = this.fb.nonNullable.group({
    otp: ['', [Validators.required, otpValidator]],
  });

  readonly imageSrc = computed(() =>
    this.challenge()?.purpose === 'register'
      ? '/assets/images/authentication/register-couple.webp'
      : '/assets/images/authentication/login-couple.webp',
  );

  readonly imageAlt = computed(() =>
    this.challenge()?.purpose === 'register'
      ? 'Joined hands with henna and gold bangles, a quiet promise of togetherness'
      : 'A couple sharing a warm, quiet moment together',
  );

  readonly heading = computed(() => {
    const challenge = this.challenge();
    if (challenge?.purpose === 'register' && challenge.channel === 'email') {
      return 'Verify your email';
    }
    if (challenge?.purpose === 'register' && challenge.channel === 'mobile') {
      return 'Verify your mobile';
    }
    return 'Verify OTP';
  });

  readonly subtitle = computed(() => {
    const challenge = this.challenge();
    if (!challenge) {
      return 'Enter the 6-digit OTP to continue.';
    }
    return challenge.channel === 'email'
      ? `Enter the OTP sent to ${challenge.destination}.`
      : `Enter the OTP sent to ${challenge.destination}.`;
  });

  readonly backLink = computed(() => {
    const purpose = this.challenge()?.purpose;
    if (purpose === 'register') {
      return '/register';
    }
    if (purpose === 'forgot') {
      return '/forgot-password';
    }
    if (purpose === 'login') {
      return '/login-otp';
    }
    return '/login';
  });

  readonly backLabel = computed(() => {
    const purpose = this.challenge()?.purpose;
    if (purpose === 'register') {
      return 'Back to Register';
    }
    if (purpose === 'forgot') {
      return 'Back to Forgot Password';
    }
    return 'Back to Login';
  });

  constructor() {
    this.destroyRef.onDestroy(() => clearInterval(this.timer));
  }

  ngOnInit(): void {
    if (!this.challenge()) {
      void this.router.navigateByUrl('/login');
      return;
    }

    this.startResendTimer();
    this.form.controls.otp.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.otpError.set(''));
  }

  submit(): void {
    this.submitted.set(true);
    this.otpError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.auth.verifyOtp(this.form.controls.otp.value).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (result.next === 'channel' && result.challenge) {
          this.challenge.set(result.challenge);
          this.resendIn.set(result.challenge.resendIn);
          this.submitted.set(false);
          this.form.reset({ otp: '' });
          this.startResendTimer();
          return;
        }

        if (result.next === 'registered') {
          void this.router.navigate(['/login'], { queryParams: { registered: '1' } });
          return;
        }

        if (result.next === 'reset') {
          void this.router.navigateByUrl('/reset-password');
          return;
        }

        void this.router.navigateByUrl('/dashboard');
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.otpError.set(error.message || 'Incorrect OTP.');
      },
    });
  }

  resend(): void {
    if (this.resendIn() > 0 || this.resending()) {
      return;
    }

    this.resending.set(true);
    this.otpError.set('');
    this.auth.resendOtp().subscribe({
      next: (challenge) => {
        this.resending.set(false);
        this.challenge.set(challenge);
        this.resendIn.set(challenge.resendIn);
        this.submitted.set(false);
        this.form.reset({ otp: '' });
        this.startResendTimer();
      },
      error: (error: Error) => {
        this.resending.set(false);
        this.otpError.set(error.message || 'Unable to resend OTP.');
      },
    });
  }

  private startResendTimer(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      const remaining = this.auth.otpResendIn();
      this.resendIn.set(remaining);
      if (remaining <= 0) {
        clearInterval(this.timer);
      }
    }, 500);
  }
}
