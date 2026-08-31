import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { LucideChevronDown, LucideDynamicIcon, type LucideIcon } from '@lucide/angular';

let nextAuthInputId = 0;
let openAuthSelect: AuthInputComponent | null = null;

@Component({
  selector: 'app-auth-input',
  imports: [LucideDynamicIcon, LucideChevronDown],
  templateUrl: './auth-input.component.html',
  host: {
    class: 'relative block',
    '[class.z-50]': 'open()',
  },
})
export class AuthInputComponent implements ControlValueAccessor, OnInit {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly type = input<'text' | 'email' | 'tel' | 'select'>('text');
  readonly icon = input<LucideIcon | null>(null);
  readonly required = input(false);
  readonly showLabel = input(true);
  readonly errorMessage = input('');
  readonly submitted = input(false);
  readonly autocomplete = input('off');
  readonly options = input<readonly { value: string; label: string }[]>([]);
  readonly inputId = input(`auth-input-${++nextAuthInputId}`);
  readonly maxLength = input<number | null>(null);
  readonly inputMode = input<string | null>(null);
  readonly digitsOnly = input(false);
  readonly compact = input(false);

  readonly value = signal('');
  readonly disabled = signal(false);
  readonly open = signal(false);
  private readonly controlTick = signal(0);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly selectedLabel = computed(() => {
    const current = this.value();
    return this.options().find((option) => option.value === current)?.label ?? '';
  });

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
    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }
    if (control.hasError('fullName')) {
      return 'Enter your full name using letters and spaces.';
    }
    if (control.hasError('identifier')) {
      return 'Enter a valid email or 10-digit mobile number.';
    }
    if (control.hasError('mobile')) {
      return 'Enter a valid 10-digit mobile number.';
    }
    if (control.hasError('otp') || control.hasError('pattern')) {
      return 'Enter the 6-digit OTP.';
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

  toggleSelect(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled()) {
      return;
    }

    const next = !this.open();
    if (openAuthSelect && openAuthSelect !== this) {
      openAuthSelect.open.set(false);
    }
    this.open.set(next);
    openAuthSelect = next ? this : null;
    if (!next) {
      this.markTouched();
    }
  }

  chooseOption(event: Event, option: { value: string; label: string }): void {
    event.preventDefault();
    event.stopPropagation();
    this.value.set(option.value);
    this.onChange(option.value);
    this.open.set(false);
    openAuthSelect = null;
    this.markTouched();
  }

  keepOpen(event: Event): void {
    event.stopPropagation();
  }

  onInput(event: Event): void {
    const field = event.target as HTMLInputElement | HTMLSelectElement;
    let next = field.value;
    if (this.digitsOnly()) {
      next = next.replace(/\D/g, '');
    }
    const max = this.maxLength();
    if (max) {
      next = next.slice(0, max);
    }
    field.value = next;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.host.nativeElement.contains(event.target as Node)) {
      return;
    }
    if (this.open()) {
      this.open.set(false);
      this.markTouched();
    }
    if (openAuthSelect === this) {
      openAuthSelect = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    openAuthSelect = null;
    this.markTouched();
  }
}
