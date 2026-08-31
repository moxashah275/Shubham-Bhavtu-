import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideLoaderCircle, LucideUser } from '@lucide/angular';
import { emailOrMobileValidator, type SocialProvider } from '../../../../core/models/auth.model';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthBrandPanelComponent } from '../../components/auth-brand-panel/auth-brand-panel.component';
import { AuthDividerComponent } from '../../components/auth-divider/auth-divider.component';
import { AuthInputComponent } from '../../components/auth-input/auth-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { SocialLoginComponent } from '../../components/social-login/social-login.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthBrandPanelComponent,
    AuthDividerComponent,
    AuthInputComponent,
    PasswordInputComponent,
    SocialLoginComponent,
    LucideArrowRight,
    LucideLoaderCircle,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly userIcon = LucideUser;
  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly identifierError = signal('');
  readonly passwordError = signal('');
  readonly lockoutError = signal('');
  readonly notRegisteredError = signal('');
  readonly successMessage = signal<string | null>(null);

  private messageTimer: ReturnType<typeof setTimeout> | undefined;

  readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, emailOrMobileValidator]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.messageTimer));
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('registered') === '1') {
      this.showSuccess('You have successfully registered. Please login.');
      void this.router.navigate([], { relativeTo: this.route, replaceUrl: true });
    }

    if (this.route.snapshot.queryParamMap.get('reset') === '1') {
      this.showSuccess('Your password has been reset. Please login.');
      void this.router.navigate([], { relativeTo: this.route, replaceUrl: true });
    }

    const remembered = this.auth.getRememberedIdentifier();
    if (remembered) {
      this.form.patchValue({ identifier: remembered, rememberMe: true });
    }

    this.form.controls.identifier.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.identifierError.set(''));
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.passwordError.set(''));
  }

  submit(): void {
    this.submitted.set(true);
    this.clearFieldErrors();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { identifier, password, rememberMe } = this.form.getRawValue();

    this.auth.login({ identifier, password, rememberMe }).subscribe({
      next: () => {
        this.loading.set(false);
        this.goAfterLogin();
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.showLoginError(error.message || 'Incorrect password.');
      },
    });
  }

  loginWithSocial(provider: SocialProvider): void {
    this.loading.set(true);
    this.clearFieldErrors();
    this.auth.socialLogin(provider).subscribe({
      next: () => {
        this.loading.set(false);
        this.goAfterLogin();
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.showLoginError(error.message || 'Unable to login. Please try again.');
      },
    });
  }

  private goAfterLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
    const safe =
      returnUrl.startsWith('/') && !returnUrl.startsWith('//') && returnUrl !== '/matches' && returnUrl !== '/login'
        ? returnUrl
        : '/dashboard';
    void this.router.navigateByUrl(safe);
  }

  private showSuccess(message: string): void {
    this.clearFieldErrors();
    this.successMessage.set(message);
    this.scheduleHide(() => this.successMessage.set(null));
  }

  private showLoginError(message: string): void {
    this.successMessage.set(null);
    this.clearFieldErrors();

    if (message.toLowerCase().includes('not registered')) {
      this.notRegisteredError.set(message);
    } else if (message.toLowerCase().includes('password')) {
      this.passwordError.set(message);
    } else if (message.toLowerCase().includes('attempt')) {
      this.lockoutError.set(message);
    } else {
      this.identifierError.set(message);
    }

    this.scheduleHide(() => this.clearFieldErrors());
  }

  private clearFieldErrors(): void {
    this.identifierError.set('');
    this.passwordError.set('');
    this.lockoutError.set('');
    this.notRegisteredError.set('');
  }

  private scheduleHide(hide: () => void): void {
    clearTimeout(this.messageTimer);
    this.messageTimer = setTimeout(hide, 5000);
  }
}
