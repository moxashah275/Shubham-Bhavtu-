import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideLoaderCircle } from '@lucide/angular';
import { matchFields } from '../../../../core/models/auth.model';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthBrandPanelComponent } from '../../components/auth-brand-panel/auth-brand-panel.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthBrandPanelComponent,
    PasswordInputComponent,
    LucideArrowRight,
    LucideLoaderCircle,
  ],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: matchFields('password', 'confirmPassword') },
  );

  submit(): void {
    this.submitted.set(true);
    this.formError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.auth.resetPassword(this.form.controls.password.value).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/login'], { queryParams: { reset: '1' } });
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.formError.set(error.message || 'Unable to reset password. Please try again.');
      },
    });
  }
}
