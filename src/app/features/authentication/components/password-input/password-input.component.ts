import { Component, DestroyRef, computed, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { LucideDynamicIcon, LucideEye, LucideEyeOff, LucideLock } from '@lucide/angular';

let nextPasswordId = 0;

@Component({
  selector: 'app-password-input',
  imports: [LucideDynamicIcon, LucideLock],
  templateUrl: './password-input.component.html',
  host: {
    class: 'block',
  },
})
export class PasswordInputComponent implements ControlValueAccessor, OnInit {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  readonly label = input('Password');
  readonly placeholder = input('Enter your password');
  readonly required = input(false);
  readonly errorMessage = input('');
  readonly submitted = input(false);
  readonly autocomplete = input('off');
  readonly inputId = input(`auth-password-${++nextPasswordId}`);
  readonly compact = input(false);

  readonly visible = signal(false);
  readonly value = signal('');
  readonly disabled = signal(false);
  readonly suggestionsLocked = signal(true);
  private readonly controlTick = signal(0);
  readonly visibilityIcon = computed(() => (this.visible() ? LucideEyeOff : LucideEye));

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly showError = computed(() => {
    this.controlTick();
    if (this.errorMessage()) {
      return true;
    }
    const control = this.ngControl?.control;
    return Boolean(control?.invalid && this.submitted());
  });

  readonly resolvedError = computed(() => {
    this.controlTick();
    if (this.errorMessage()) {
      return this.errorMessage();
    }

    const control = this.ngControl?.control;
    if (!control || !this.showError()) {
      return '';
    }

    if (control.hasError('required')) {
      return `${this.label()} is required.`;
    }
    if (control.hasError('minlength')) {
      return 'Password must be at least 8 characters.';
    }
    if (control.hasError('mismatch')) {
      return 'Passwords do not match.';
    }
    return 'Please check this field.';
  });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.ngControl?.control?.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.controlTick.update((value) => value + 1));
  }

  unlockSuggestions(event: FocusEvent): void {
    this.suggestionsLocked.set(false);
    const field = event.target as HTMLInputElement;
    field.removeAttribute('readonly');
  }

  toggleVisibility(): void {
    this.visible.update((value) => !value);
  }

  onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
    this.controlTick.update((value) => value + 1);
  }

  markTouched(): void {
    this.onTouched();
    this.controlTick.update((value) => value + 1);
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
