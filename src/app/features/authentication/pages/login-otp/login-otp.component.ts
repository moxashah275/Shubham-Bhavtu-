import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideLoaderCircle, LucideUser } from '@lucide/angular';
import { emailOrMobileValidator } from '../../../../core/models/auth.model';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthBrandPanelComponent } from '../../components/auth-brand-panel/auth-brand-panel.component';
import { AuthInputComponent } from '../../components/auth-input/auth-input.component';

@Component({
  selector: 'app-login-otp',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthBrandPanelComponent,
    AuthInputComponent,
    LucideArrowRight,
    LucideLoaderCircle,
  ],
  templateUrl: './login-otp.component.html',
})
export class LoginOtpComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly userIcon = LucideUser;
  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly identifierError = signal('');

  readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, emailOrMobileValidator]],
    rememberMe: [false],
  });

  ngOnInit(): void {
    const remembered = this.auth.getRememberedIdentifier();
    if (remembered) {
      this.form.patchValue({ identifier: remembered, rememberMe: true });
    }

    this.form.controls.identifier.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.identifierError.set(''));
  }

  submit(): void {
    this.submitted.set(true);
    this.identifierError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { identifier, rememberMe } = this.form.getRawValue();

    this.auth.sendLoginOtp(identifier, rememberMe).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl('/verify-otp');
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.identifierError.set(error.message || 'Unable to send OTP.');
      },
    });
  }
}
