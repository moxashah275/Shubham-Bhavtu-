import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface LoginRequest {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobile: string;
  countryCode: string;
  password: string;
  gender?: string;
  religion?: string;
  motherTongue?: string;
  age?: string;
  maritalStatus?: string;
}

export type OtpPurpose = 'register' | 'login' | 'forgot';
export type OtpChannel = 'email' | 'mobile';

export interface OtpSession {
  purpose: OtpPurpose;
  channel: OtpChannel;
  email: string;
  mobile: string;
  countryCode: string;
  fullName: string;
  passwordHash: string;
  emailOtp: string;
  mobileOtp: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  expiresAt: number;
  resendAt: number;
  attempts: number;
  accountId: string;
  identifier: string;
  rememberMe: boolean;
}

export interface ResetSession {
  accountId: string;
  expiresAt: number;
}

export interface OtpChallenge {
  purpose: OtpPurpose;
  channel: OtpChannel;
  destination: string;
  previewOtp: string;
  resendIn: number;
}

export interface StoredAccount {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  mobile: string;
  countryCode: string;
  age: string;
  gender: string;
  maritalStatus: string;
  motherTongue: string;
  education: string;
  hobbies: string;
  state: string;
  city: string;
  religion: string;
  occupation: string;
  about: string;
  height: string;
  community: string;
  subCaste: string;
  manglik: string;
  diet: string;
  familyType: string;
  income: string;
  partnerLookingFor: string;
  partnerAgeFrom: string;
  partnerAgeTo: string;
  partnerReligion: string;
  partnerMaritalStatus: string;
  partnerEducation: string;
  partnerHeight: string;
  partnerDiet: string;
  partnerManglik: string;
  partnerState: string;
  partnerCity: string;
  educationSpec: string;
  otherEducation: string;
  occupationDetails: string;
  workAddress: string;
  religiousEducation: string;
  partnerRequirement: string;
  partnerHeightFrom: string;
  partnerHeightTo: string;
  partnerChildren: string;
  partnerDisability: string;
  profileSaved?: boolean;
}

export interface AuthUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  mobile: string;
  countryCode: string;
  age: string;
  gender: string;
  maritalStatus: string;
  motherTongue: string;
  education: string;
  hobbies: string;
  state: string;
  city: string;
  religion: string;
  occupation: string;
  about: string;
  height: string;
  community: string;
  subCaste: string;
  manglik: string;
  diet: string;
  familyType: string;
  income: string;
  partnerLookingFor: string;
  partnerAgeFrom: string;
  partnerAgeTo: string;
  partnerReligion: string;
  partnerMaritalStatus: string;
  partnerEducation: string;
  partnerHeight: string;
  partnerDiet: string;
  partnerManglik: string;
  partnerState: string;
  partnerCity: string;
  educationSpec: string;
  otherEducation: string;
  occupationDetails: string;
  workAddress: string;
  religiousEducation: string;
  partnerRequirement: string;
  partnerHeightFrom: string;
  partnerHeightTo: string;
  partnerChildren: string;
  partnerDisability: string;
  profileSaved?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface OtpVerifyResult {
  next: 'channel' | 'registered' | 'reset' | 'session';
  challenge?: OtpChallenge;
  response?: AuthResponse;
}

export type SocialProvider = 'google' | 'facebook';

const EMAIL_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export function isValidEmail(value: string): boolean {
  const email = value.trim();
  return EMAIL_PATTERN.test(email) && !email.includes('..');
}

export function emailValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }

  return isValidEmail(value) ? null : { email: true };
}

export function emailOrMobileValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }

  const mobile = /^[6-9]\d{9}$/;
  const digits = value.replace(/\D/g, '');
  if (value.includes('@') || /[a-zA-Z]/.test(value)) {
    return isValidEmail(value) ? null : { identifier: true };
  }

  return mobile.test(value) || /^\d{10,15}$/.test(digits) ? null : { identifier: true };
}

export function fullNameValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }

  return /^[a-zA-Z][a-zA-Z .']{1,59}$/.test(value) ? null : { fullName: true };
}

export function parseEmailOrMobile(value: string): { email: string; mobile: string } {
  const trimmed = value.trim();
  if (isValidEmail(trimmed)) {
    return { email: trimmed.toLowerCase(), mobile: '' };
  }

  const digits = trimmed.replace(/\D/g, '');
  if (/^[6-9]\d{9}$/.test(digits)) {
    return { email: '', mobile: digits };
  }

  return { email: '', mobile: '' };
}

export function toDisplayName(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function otpValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }

  return /^\d{6}$/.test(value) ? null : { otp: true };
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) {
    return email;
  }

  return `${user.slice(0, 1)}***@${domain}`;
}

export function maskMobile(mobile: string, countryCode: string): string {
  const digits = mobile.replace(/\D/g, '');
  const last = digits.slice(-4) || digits;
  return `${countryCode} ******${last}`;
}

export function matchFields(controlName: string, matchingControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const control = group.get(controlName);
    const matching = group.get(matchingControlName);

    if (!control || !matching) {
      return null;
    }

    if (!matching.value) {
      return null;
    }

    if (control.value !== matching.value) {
      matching.setErrors({ ...(matching.errors ?? {}), mismatch: true });
      return { mismatch: true };
    }

    if (matching.hasError('mismatch')) {
      const rest = { ...(matching.errors ?? {}) };
      delete rest['mismatch'];
      matching.setErrors(Object.keys(rest).length ? rest : null);
    }

    return null;
  };
}
