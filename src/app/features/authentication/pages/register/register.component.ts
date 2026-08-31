import { Component, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideChevronDown,
  LucideLoaderCircle,
  LucideMail,
  LucideUser,
} from '@lucide/angular';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '../../../../core/data/country-codes';
import { emailValidator, fullNameValidator, matchFields } from '../../../../core/models/auth.model';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthBrandPanelComponent } from '../../components/auth-brand-panel/auth-brand-panel.component';
import { AuthInputComponent } from '../../components/auth-input/auth-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthBrandPanelComponent,
    AuthInputComponent,
    PasswordInputComponent,
    LucideArrowRight,
    LucideChevronDown,
    LucideLoaderCircle,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly userIcon = LucideUser;
  readonly mailIcon = LucideMail;
  readonly countryCodes = COUNTRY_CODES;

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly formError = signal<string | null>(null);
  readonly countryMenuOpen = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      fullName: ['', [Validators.required, fullNameValidator]],
      email: ['', [Validators.required, emailValidator]],
      countryCode: [DEFAULT_COUNTRY_CODE, Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
    },
    { validators: matchFields('password', 'confirmPassword') },
  );

  mobileMaxLength(): number {
    return this.form.controls.countryCode.value === '+91' ? 10 : 15;
  }

  onMobileInput(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, this.mobileMaxLength());
    this.form.controls.mobile.setValue(digits, { emitEvent: true });
  }

  toggleCountryMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.countryMenuOpen.update((open) => !open);
  }

  selectCountryCode(code: string): void {
    this.form.controls.countryCode.setValue(code);
    this.countryMenuOpen.set(false);
  }

  @HostListener('document:click')
  closeCountryMenu(): void {
    this.countryMenuOpen.set(false);
  }

  submit(): void {
    this.submitted.set(true);
    this.formError.set(null);

    const mobile = this.form.controls.mobile.value;
    if (this.form.controls.countryCode.value === '+91' && !/^[6-9]\d{9}$/.test(mobile)) {
      this.form.controls.mobile.setErrors({ ...(this.form.controls.mobile.errors ?? {}), mobile: true });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const value = this.form.getRawValue();

    this.auth
      .register({
        fullName: value.fullName.trim(),
        email: value.email.trim(),
        mobile: value.mobile.trim(),
        countryCode: value.countryCode,
        password: value.password,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          void this.router.navigate(['/login'], { queryParams: { registered: '1' } });
        },
        error: (error: Error) => {
          this.loading.set(false);
          this.formError.set(error.message || 'Unable to create your profile. Please try again.');
        },
      });
  }
}
