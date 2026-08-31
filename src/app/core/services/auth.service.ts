import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, from, of, switchMap, tap } from 'rxjs';
import { hashSecret, isSha256Hex, sanitizeText } from '../security/crypto-secret';
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  OtpChallenge,
  OtpChannel,
  OtpSession,
  OtpVerifyResult,
  RegisterRequest,
  ResetSession,
  SocialProvider,
  StoredAccount,
  maskEmail,
  maskMobile,
  parseEmailOrMobile,
  toDisplayName,
} from '../models/auth.model';
import { DEFAULT_COUNTRY_CODE } from '../data/country-codes';
import { getProfileCompletion } from '../profile/profile-completion';

const TOKEN_KEY = 'gathbandhan.auth.token';
const USER_KEY = 'gathbandhan.auth.user';
const REMEMBER_KEY = 'gathbandhan.auth.remember';
const ACCOUNTS_KEY = 'gathbandhan.auth.accounts';
const PROFILES_KEY = 'gathbandhan.profiles';
const FAIL_KEY = 'gathbandhan.auth.fails';
const OTP_KEY = 'gathbandhan.auth.otp';
const RESET_KEY = 'gathbandhan.auth.reset';
const DATA_VERSION_KEY = 'gathbandhan.data.version';
const DATA_VERSION = '3-email-mobile-login';
const MAX_LOGIN_TRIES = 5;
const MAX_OTP_TRIES = 5;
const LOCK_MS = 60_000;
const OTP_TTL_MS = 5 * 60_000;
const OTP_RESEND_MS = 30_000;
const NOT_REGISTERED_MESSAGE = 'You are not registered. Please register first.';

function resetLegacyAuthData(): void {
  try {
    if (localStorage.getItem(DATA_VERSION_KEY) === DATA_VERSION) {
      return;
    }

    const keys = [TOKEN_KEY, USER_KEY, REMEMBER_KEY, ACCOUNTS_KEY, PROFILES_KEY, FAIL_KEY, OTP_KEY, RESET_KEY];
    for (const key of keys) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
    localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION);
  } catch {
    // Private browsing can block storage.
  }
}

resetLegacyAuthData();

function emptyProfile(): Pick<
  StoredAccount,
  | 'mobile'
  | 'countryCode'
  | 'age'
  | 'gender'
  | 'maritalStatus'
  | 'motherTongue'
  | 'education'
  | 'hobbies'
  | 'state'
  | 'city'
  | 'religion'
  | 'occupation'
  | 'about'
  | 'height'
  | 'community'
  | 'subCaste'
  | 'manglik'
  | 'diet'
  | 'familyType'
  | 'income'
  | 'partnerLookingFor'
  | 'partnerAgeFrom'
  | 'partnerAgeTo'
  | 'partnerReligion'
  | 'partnerMaritalStatus'
  | 'partnerEducation'
  | 'partnerHeight'
  | 'partnerDiet'
  | 'partnerManglik'
  | 'partnerState'
  | 'partnerCity'
  | 'educationSpec'
  | 'otherEducation'
  | 'occupationDetails'
  | 'workAddress'
  | 'religiousEducation'
  | 'partnerRequirement'
  | 'partnerHeightFrom'
  | 'partnerHeightTo'
  | 'partnerChildren'
  | 'partnerDisability'
  | 'profileSaved'
> {
  return {
    mobile: '',
    countryCode: DEFAULT_COUNTRY_CODE,
    age: '',
    gender: '',
    maritalStatus: '',
    motherTongue: '',
    education: '',
    hobbies: '',
    state: '',
    city: '',
    religion: '',
    occupation: '',
    about: '',
    height: '',
    community: '',
    subCaste: '',
    manglik: '',
    diet: '',
    familyType: '',
    income: '',
    partnerLookingFor: '',
    partnerAgeFrom: '',
    partnerAgeTo: '',
    partnerReligion: '',
    partnerMaritalStatus: '',
    partnerEducation: '',
    partnerHeight: '',
    partnerDiet: '',
    partnerManglik: '',
    partnerState: '',
    partnerCity: '',
    educationSpec: '',
    otherEducation: '',
    occupationDetails: '',
    workAddress: '',
    religiousEducation: '',
    partnerRequirement: '',
    partnerHeightFrom: '',
    partnerHeightTo: '',
    partnerChildren: '',
    partnerDisability: '',
    profileSaved: false,
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<AuthUser | null>(this.readUser());
  private readonly sessionToken = signal<string | null>(this.readToken());
  private readonly otpSession = signal<OtpSession | null>(this.readOtpSession());

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.sessionToken() && this.currentUser()));
  readonly fullName = computed(() => this.currentUser()?.fullName ?? 'Member');
  readonly firstName = computed(() => this.currentUser()?.fullName.split(/\s+/)[0] ?? 'Member');
  readonly profileCompletion = computed(() => getProfileCompletion(this.currentUser()));
  readonly hasSavedProfile = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return false;
    }
    if (user.profileSaved) {
      return true;
    }
    return Boolean(
      user.age ||
        user.gender ||
        user.city ||
        user.about ||
        user.occupation ||
        user.hobbies,
    );
  });

  login(payload: LoginRequest): Observable<AuthResponse> {
    return from(this.authenticate(payload)).pipe(
      switchMap((response) => of(response).pipe(delay(600))),
      tap((response) => this.persistSession(response, payload.rememberMe, payload.identifier)),
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return from(this.createAccount(payload)).pipe(switchMap((response) => of(response).pipe(delay(700))));
  }

  startRegistration(payload: RegisterRequest): Observable<OtpChallenge> {
    return from(this.beginRegistration(payload)).pipe(switchMap((challenge) => of(challenge).pipe(delay(700))));
  }

  sendLoginOtp(identifier: string, rememberMe: boolean): Observable<OtpChallenge> {
    return from(this.beginLoginOtp(identifier, rememberMe)).pipe(
      switchMap((challenge) => of(challenge).pipe(delay(600))),
    );
  }

  sendForgotOtp(identifier: string): Observable<OtpChallenge> {
    return from(this.beginForgotOtp(identifier)).pipe(switchMap((challenge) => of(challenge).pipe(delay(600))));
  }

  verifyOtp(code: string): Observable<OtpVerifyResult> {
    return from(this.confirmOtp(code)).pipe(switchMap((result) => of(result).pipe(delay(600))));
  }

  resendOtp(): Observable<OtpChallenge> {
    return from(this.refreshOtp()).pipe(switchMap((challenge) => of(challenge).pipe(delay(500))));
  }

  resetPassword(password: string): Observable<void> {
    return from(this.applyResetPassword(password)).pipe(switchMap(() => of(undefined).pipe(delay(700))));
  }

  getOtpChallenge(): OtpChallenge | null {
    return this.toChallenge(this.otpSession());
  }

  hasOtpSession(): boolean {
    return Boolean(this.otpSession());
  }

  hasResetSession(): boolean {
    const reset = this.readResetSession();
    return Boolean(reset && reset.expiresAt > Date.now());
  }

  otpResendIn(): number {
    const session = this.otpSession();
    if (!session) {
      return 0;
    }
    return Math.max(0, Math.ceil((session.resendAt - Date.now()) / 1000));
  }

  socialLogin(provider: SocialProvider): Observable<AuthResponse> {
    const isGoogle = provider === 'google';
    const response = this.toResponse({
      id: crypto.randomUUID(),
      fullName: isGoogle ? 'Google Member' : 'Facebook Member',
      username: isGoogle ? 'google.member' : 'facebook.member',
      email: isGoogle ? 'member@gmail.com' : 'member@facebook.com',
      password: '',
      ...emptyProfile(),
    });

    return of(response).pipe(
      delay(700),
      tap((value) => this.persistSession(value, true)),
    );
  }

  logout(): void {
    this.currentUser.set(null);
    this.sessionToken.set(null);
    this.safeRemove(TOKEN_KEY);
    this.safeRemove(USER_KEY);
    this.removeSession(TOKEN_KEY);
    this.removeSession(USER_KEY);
    this.safeRemove(REMEMBER_KEY);
    this.clearOtpSession();
    this.clearResetSession();
  }

  getRememberedIdentifier(): string {
    return this.safeGet(REMEMBER_KEY) ?? '';
  }

  hasRegisteredEmail(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      return false;
    }
    return this.readAccounts().some((item) => item.email.toLowerCase() === normalized);
  }

  hasRegisteredMobile(mobile: string): boolean {
    const digits = mobile.replace(/\D/g, '');
    if (!digits) {
      return false;
    }
    return this.readAccounts().some((item) => item.mobile === digits);
  }

  updateProfile(details: Omit<AuthUser, 'id' | 'email' | 'username'> & { fullName: string }): void {
    const current = this.currentUser();
    if (!current) {
      return;
    }

    const next: AuthUser = {
      ...current,
      ...details,
      fullName: sanitizeText(details.fullName, 60),
      countryCode: sanitizeText(details.countryCode, 6) || DEFAULT_COUNTRY_CODE,
      mobile: sanitizeText(details.mobile, 15),
      occupation: sanitizeText(details.occupation, 80),
      hobbies: sanitizeText(details.hobbies, 120),
      about: sanitizeText(details.about, 500),
      id: current.id,
      email: current.email,
      username: current.username,
    };

    this.currentUser.set(next);
    this.writeSession(USER_KEY, JSON.stringify(next), Boolean(this.safeGet(REMEMBER_KEY)));

    const accounts = this.readAccounts().map((account) =>
      account.id === current.id
        ? {
            ...account,
            fullName: next.fullName,
            countryCode: next.countryCode,
            mobile: next.mobile,
            age: next.age,
            gender: next.gender,
            maritalStatus: next.maritalStatus,
            motherTongue: next.motherTongue,
            education: next.education,
            hobbies: next.hobbies,
            state: next.state,
            city: next.city,
            religion: next.religion,
            occupation: next.occupation,
            about: next.about,
            height: next.height,
            community: next.community,
            subCaste: next.subCaste,
            manglik: next.manglik,
            diet: next.diet,
            familyType: next.familyType,
            income: next.income,
            partnerLookingFor: next.partnerLookingFor,
            partnerAgeFrom: next.partnerAgeFrom,
            partnerAgeTo: next.partnerAgeTo,
            partnerReligion: next.partnerReligion,
            partnerMaritalStatus: next.partnerMaritalStatus,
            partnerEducation: next.partnerEducation,
            partnerHeight: next.partnerHeight,
            partnerDiet: next.partnerDiet,
            partnerManglik: next.partnerManglik,
            partnerState: next.partnerState,
            partnerCity: next.partnerCity,
            educationSpec: next.educationSpec,
            otherEducation: next.otherEducation,
            occupationDetails: next.occupationDetails,
            workAddress: next.workAddress,
            religiousEducation: next.religiousEducation,
            partnerRequirement: next.partnerRequirement,
            partnerHeightFrom: next.partnerHeightFrom,
            partnerHeightTo: next.partnerHeightTo,
            partnerChildren: next.partnerChildren,
            partnerDisability: next.partnerDisability,
            profileSaved: next.profileSaved,
          }
        : account,
    );
    this.writeAccounts(accounts);
    this.writeProfileJson(next);
  }

  clearProfile(): void {
    const current = this.currentUser();
    if (!current) {
      return;
    }

    this.updateProfile({
      fullName: current.fullName,
      ...emptyProfile(),
      mobile: current.mobile,
      countryCode: current.countryCode,
      profileSaved: false,
    });
    this.removeProfileJson(current.id);
  }

  private async authenticate(payload: LoginRequest): Promise<AuthResponse> {
    this.assertUnlocked();

    const identifier = payload.identifier.trim().toLowerCase();
    const digits = payload.identifier.trim().replace(/\D/g, '');
    const password = payload.password;

    if (!identifier || !password) {
      throw new Error('Please enter your details to continue.');
    }

    const accounts = this.readAccounts();
    const account = accounts.find((item) => this.matchesLogin(item, identifier, digits));

    if (!account) {
      this.recordFailure();
      throw new Error(NOT_REGISTERED_MESSAGE);
    }

    if (!(await this.passwordMatches(account, password))) {
      this.recordFailure();
      throw new Error('Incorrect password.');
    }

    this.clearFailures();

    if (!isSha256Hex(account.password)) {
      account.password = await hashSecret(password, account.email || account.mobile);
      this.writeAccounts(accounts.map((item) => (item.id === account.id ? account : item)));
    }

    return this.toResponse(account);
  }

  private async createAccount(payload: RegisterRequest): Promise<AuthResponse> {
    const fullName = toDisplayName(sanitizeText(payload.fullName, 60));
    const email = payload.email.trim().toLowerCase();
    const mobile = payload.mobile.trim().replace(/\D/g, '');
    const countryCode = payload.countryCode.trim() || DEFAULT_COUNTRY_CODE;
    const password = payload.password;

    if (!fullName || !email || !mobile || !password) {
      throw new Error('Please complete your profile details.');
    }

    const accounts = this.readAccounts();
    const exists = accounts.some(
      (item) => item.email.toLowerCase() === email || (item.mobile && item.mobile === mobile),
    );

    if (exists) {
      throw new Error('An account with this email or mobile number already exists.');
    }

    const account: StoredAccount = {
      id: crypto.randomUUID(),
      fullName,
      username: fullName,
      email,
      password: await hashSecret(password, email),
      ...emptyProfile(),
      mobile,
      countryCode,
      gender: payload.gender?.trim() ?? '',
      religion: payload.religion?.trim() ?? '',
      motherTongue: payload.motherTongue?.trim() ?? '',
      age: payload.age?.trim() ?? '',
      maritalStatus: payload.maritalStatus?.trim() ?? '',
    };

    this.writeAccounts([...accounts, account]);
    return this.toResponse(account);
  }

  private async beginRegistration(payload: RegisterRequest): Promise<OtpChallenge> {
    const fullName = toDisplayName(sanitizeText(payload.fullName, 60));
    const email = payload.email.trim().toLowerCase();
    const mobile = payload.mobile.trim().replace(/\D/g, '');
    const countryCode = payload.countryCode.trim() || DEFAULT_COUNTRY_CODE;
    const password = payload.password;

    if (!fullName || !email || !mobile || !password) {
      throw new Error('Please complete your profile details.');
    }

    const accounts = this.readAccounts();
    const exists = accounts.some(
      (item) => item.email.toLowerCase() === email || (item.mobile && item.mobile === mobile),
    );

    if (exists) {
      throw new Error('An account with this email or mobile number already exists.');
    }

    const now = Date.now();
    const session: OtpSession = {
      purpose: 'register',
      channel: 'email',
      email,
      mobile,
      countryCode,
      fullName,
      passwordHash: await hashSecret(password, email),
      emailOtp: this.generateOtp(),
      mobileOtp: this.generateOtp(),
      emailVerified: false,
      mobileVerified: false,
      expiresAt: now + OTP_TTL_MS,
      resendAt: now + OTP_RESEND_MS,
      attempts: 0,
      accountId: '',
      identifier: email,
      rememberMe: false,
    };

    this.writeOtpSession(session);
    return this.requireChallenge(session);
  }

  private async beginLoginOtp(identifier: string, rememberMe: boolean): Promise<OtpChallenge> {
    this.assertUnlocked();
    const account = this.findAccount(identifier);
    if (!account) {
      this.recordFailure();
      throw new Error(NOT_REGISTERED_MESSAGE);
    }

    this.clearFailures();
    return this.requireChallenge(this.createAccountOtpSession('login', account, identifier, rememberMe));
  }

  private async beginForgotOtp(identifier: string): Promise<OtpChallenge> {
    const account = this.findAccount(identifier);
    if (!account) {
      throw new Error(NOT_REGISTERED_MESSAGE);
    }

    return this.requireChallenge(this.createAccountOtpSession('forgot', account, identifier, false));
  }

  private async confirmOtp(code: string): Promise<OtpVerifyResult> {
    const session = this.requireLiveSession();
    const otp = code.replace(/\D/g, '');

    if (otp.length !== 6) {
      throw new Error('Enter the 6-digit OTP.');
    }

    const expected = session.channel === 'email' ? session.emailOtp : session.mobileOtp;
    if (otp !== expected) {
      session.attempts += 1;
      if (session.attempts >= MAX_OTP_TRIES) {
        this.clearOtpSession();
        throw new Error('Too many incorrect OTPs. Please request a new one.');
      }

      this.writeOtpSession(session);
      throw new Error('Incorrect OTP.');
    }

    if (session.channel === 'email') {
      session.emailVerified = true;
    } else {
      session.mobileVerified = true;
    }
    session.attempts = 0;
    this.writeOtpSession(session);

    if (session.purpose === 'register' && session.channel === 'email' && !session.mobileVerified) {
      session.channel = 'mobile';
      session.expiresAt = Date.now() + OTP_TTL_MS;
      session.resendAt = Date.now() + OTP_RESEND_MS;
      this.writeOtpSession(session);
      return { next: 'channel', challenge: this.requireChallenge(session) };
    }

    if (session.purpose === 'register') {
      const response = await this.completePendingRegistration(session);
      return { next: 'registered', response };
    }

    if (session.purpose === 'forgot') {
      this.writeResetSession({ accountId: session.accountId, expiresAt: Date.now() + OTP_TTL_MS });
      this.clearOtpSession();
      return { next: 'reset' };
    }

    const account = this.readAccounts().find((item) => item.id === session.accountId);
    if (!account) {
      this.clearOtpSession();
      throw new Error('Unable to login. Please try again.');
    }

    const response = this.toResponse(account);
    this.persistSession(response, session.rememberMe, session.identifier);
    this.clearOtpSession();
    return { next: 'session', response };
  }

  private async refreshOtp(): Promise<OtpChallenge> {
    const session = this.readOtpSession();
    if (!session) {
      throw new Error('Your OTP session has expired. Please start again.');
    }

    if (Date.now() < session.resendAt) {
      throw new Error(`Please wait ${Math.ceil((session.resendAt - Date.now()) / 1000)} seconds before resending.`);
    }

    const now = Date.now();
    if (session.channel === 'email') {
      session.emailOtp = this.generateOtp();
    } else {
      session.mobileOtp = this.generateOtp();
    }
    session.expiresAt = now + OTP_TTL_MS;
    session.resendAt = now + OTP_RESEND_MS;
    session.attempts = 0;
    this.writeOtpSession(session);
    return this.requireChallenge(session);
  }

  private async applyResetPassword(password: string): Promise<void> {
    const reset = this.readResetSession();
    if (!reset || reset.expiresAt <= Date.now()) {
      this.clearResetSession();
      throw new Error('Your reset link has expired. Please try again.');
    }

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }

    const accounts = this.readAccounts();
    const account = accounts.find((item) => item.id === reset.accountId);
    if (!account) {
      this.clearResetSession();
      throw new Error('Unable to reset password. Please try again.');
    }

    account.password = await hashSecret(password, account.email || account.mobile);
    this.writeAccounts(accounts);
    this.clearResetSession();
  }

  private async completePendingRegistration(session: OtpSession): Promise<AuthResponse> {
    const accounts = this.readAccounts();
    const exists = accounts.some(
      (item) => item.email.toLowerCase() === session.email || (item.mobile && item.mobile === session.mobile),
    );

    if (exists) {
      this.clearOtpSession();
      throw new Error('An account with this email or mobile number already exists.');
    }

    const account: StoredAccount = {
      id: crypto.randomUUID(),
      fullName: session.fullName,
      username: session.fullName,
      email: session.email,
      password: session.passwordHash,
      ...emptyProfile(),
      mobile: session.mobile,
      countryCode: session.countryCode,
    };

    this.writeAccounts([...accounts, account]);
    this.clearOtpSession();
    return this.toResponse(account);
  }

  private createAccountOtpSession(
    purpose: 'login' | 'forgot',
    account: StoredAccount,
    identifier: string,
    rememberMe: boolean,
  ): OtpSession {
    const parsed = parseEmailOrMobile(identifier);
    const channel: OtpChannel = parsed.email ? 'email' : 'mobile';
    const now = Date.now();
    const otp = this.generateOtp();
    const session: OtpSession = {
      purpose,
      channel,
      email: account.email,
      mobile: account.mobile,
      countryCode: account.countryCode || DEFAULT_COUNTRY_CODE,
      fullName: account.fullName,
      passwordHash: '',
      emailOtp: channel === 'email' ? otp : '',
      mobileOtp: channel === 'mobile' ? otp : '',
      emailVerified: false,
      mobileVerified: false,
      expiresAt: now + OTP_TTL_MS,
      resendAt: now + OTP_RESEND_MS,
      attempts: 0,
      accountId: account.id,
      identifier: identifier.trim(),
      rememberMe,
    };
    this.writeOtpSession(session);
    return session;
  }

  private findAccount(identifier: string): StoredAccount | undefined {
    const normalized = identifier.trim().toLowerCase();
    const digits = identifier.trim().replace(/\D/g, '');
    return this.readAccounts().find((item) => this.matchesLogin(item, normalized, digits));
  }

  private generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private requireLiveSession(): OtpSession {
    const session = this.readOtpSession();
    if (!session || session.expiresAt <= Date.now()) {
      this.clearOtpSession();
      throw new Error('Your OTP has expired. Please request a new one.');
    }
    return session;
  }

  private requireChallenge(session: OtpSession): OtpChallenge {
    const challenge = this.toChallenge(session);
    if (!challenge) {
      throw new Error('Unable to send OTP. Please try again.');
    }
    return challenge;
  }

  private toChallenge(session: OtpSession | null): OtpChallenge | null {
    if (!session) {
      return null;
    }

    return {
      purpose: session.purpose,
      channel: session.channel,
      destination:
        session.channel === 'email'
          ? maskEmail(session.email)
          : maskMobile(session.mobile, session.countryCode),
      previewOtp: session.channel === 'email' ? session.emailOtp : session.mobileOtp,
      resendIn: Math.max(0, Math.ceil((session.resendAt - Date.now()) / 1000)),
    };
  }

  private readOtpSession(): OtpSession | null {
    const raw = this.readSession(OTP_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as OtpSession;
    } catch {
      this.clearOtpSession();
      return null;
    }
  }

  private writeOtpSession(session: OtpSession): void {
    this.otpSession.set(session);
    this.writeSession(OTP_KEY, JSON.stringify(session), false);
  }

  private clearOtpSession(): void {
    this.otpSession.set(null);
    this.removeSession(OTP_KEY);
  }

  private readResetSession(): ResetSession | null {
    const raw = this.readSession(RESET_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as ResetSession;
    } catch {
      this.clearResetSession();
      return null;
    }
  }

  private writeResetSession(session: ResetSession): void {
    this.writeSession(RESET_KEY, JSON.stringify(session), false);
  }

  private clearResetSession(): void {
    this.removeSession(RESET_KEY);
  }

  private matchesLogin(account: StoredAccount, identifier: string, digits: string): boolean {
    if (account.email && account.email.toLowerCase() === identifier) {
      return true;
    }

    if (!account.mobile || digits.length < 10) {
      return false;
    }

    return account.mobile === digits || account.mobile === digits.slice(-10);
  }

  private async passwordMatches(account: StoredAccount, password: string): Promise<boolean> {
    const hashed = await hashSecret(password, account.email || account.mobile);
    if (account.password === hashed) {
      return true;
    }
    return !isSha256Hex(account.password) && account.password === password;
  }

  private assertUnlocked(): void {
    const until = this.readFails().until;
    if (until && Date.now() < until) {
      throw new Error('Too many attempts. Please wait a minute and try again.');
    }
  }

  private recordFailure(): void {
    const current = this.readFails();
    const count = current.count + 1;
    const until = count >= MAX_LOGIN_TRIES ? Date.now() + LOCK_MS : 0;
    this.safeSet(FAIL_KEY, JSON.stringify({ count, until }));
  }

  private clearFailures(): void {
    this.safeRemove(FAIL_KEY);
  }

  private readFails(): { count: number; until: number } {
    const raw = this.safeGet(FAIL_KEY);
    if (!raw) {
      return { count: 0, until: 0 };
    }
    try {
      const parsed = JSON.parse(raw) as { count?: number; until?: number };
      return { count: parsed.count ?? 0, until: parsed.until ?? 0 };
    } catch {
      return { count: 0, until: 0 };
    }
  }

  private persistSession(response: AuthResponse, rememberMe: boolean, identifier = ''): void {
    this.currentUser.set(response.user);
    this.sessionToken.set(response.token);

    this.safeRemove(TOKEN_KEY);
    this.safeRemove(USER_KEY);
    this.writeSession(TOKEN_KEY, response.token, rememberMe);
    this.writeSession(USER_KEY, JSON.stringify(response.user), rememberMe);

    if (rememberMe) {
      this.safeSet(REMEMBER_KEY, identifier.trim() || response.user.email);
    } else {
      this.safeRemove(REMEMBER_KEY);
    }
  }

  private toResponse(account: StoredAccount): AuthResponse {
    const user: AuthUser = {
      id: account.id,
      fullName: account.fullName,
      username: account.username,
      email: account.email,
      mobile: account.mobile ?? '',
      countryCode: account.countryCode || DEFAULT_COUNTRY_CODE,
      age: account.age ?? '',
      gender: account.gender ?? '',
      maritalStatus: account.maritalStatus ?? '',
      motherTongue: account.motherTongue ?? '',
      education: account.education ?? '',
      hobbies: account.hobbies ?? '',
      state: account.state ?? '',
      city: account.city ?? '',
      religion: account.religion ?? '',
      occupation: account.occupation ?? '',
      about: account.about ?? '',
      height: account.height ?? '',
      community: account.community ?? '',
      subCaste: account.subCaste ?? '',
      manglik: account.manglik ?? '',
      diet: account.diet ?? '',
      familyType: account.familyType ?? '',
      income: account.income ?? '',
      partnerLookingFor: account.partnerLookingFor ?? '',
      partnerAgeFrom: account.partnerAgeFrom ?? '',
      partnerAgeTo: account.partnerAgeTo ?? '',
      partnerReligion: account.partnerReligion ?? '',
      partnerMaritalStatus: account.partnerMaritalStatus ?? '',
      partnerEducation: account.partnerEducation ?? '',
      partnerHeight: account.partnerHeight ?? '',
      partnerDiet: account.partnerDiet ?? '',
      partnerManglik: account.partnerManglik ?? '',
      partnerState: account.partnerState ?? '',
      partnerCity: account.partnerCity ?? '',
      educationSpec: account.educationSpec ?? '',
      otherEducation: account.otherEducation ?? '',
      occupationDetails: account.occupationDetails ?? '',
      workAddress: account.workAddress ?? '',
      religiousEducation: account.religiousEducation ?? '',
      partnerRequirement: account.partnerRequirement ?? '',
      partnerHeightFrom: account.partnerHeightFrom ?? '',
      partnerHeightTo: account.partnerHeightTo ?? '',
      partnerChildren: account.partnerChildren ?? '',
      partnerDisability: account.partnerDisability ?? '',
      profileSaved: account.profileSaved ?? false,
    };

    return {
      user,
      token: crypto.randomUUID(),
    };
  }

  private readAccounts(): StoredAccount[] {
    const raw = this.safeGet(ACCOUNTS_KEY);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as StoredAccount[];
    } catch {
      this.safeRemove(ACCOUNTS_KEY);
      return [];
    }
  }

  private writeAccounts(accounts: StoredAccount[]): void {
    this.safeSet(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  private writeProfileJson(user: AuthUser): void {
    const raw = this.safeGet(PROFILES_KEY);
    let all: Record<string, Omit<AuthUser, 'id'>> = {};
    if (raw) {
      try {
        all = JSON.parse(raw) as Record<string, Omit<AuthUser, 'id'>>;
      } catch {
        all = {};
      }
    }

    const { id, ...profile } = user;
    all[id] = profile;
    this.safeSet(PROFILES_KEY, JSON.stringify(all, null, 2));
  }

  private removeProfileJson(userId: string): void {
    const raw = this.safeGet(PROFILES_KEY);
    if (!raw) {
      return;
    }

    try {
      const all = JSON.parse(raw) as Record<string, unknown>;
      delete all[userId];
      this.safeSet(PROFILES_KEY, JSON.stringify(all, null, 2));
    } catch {
      this.safeRemove(PROFILES_KEY);
    }
  }

  private readToken(): string | null {
    return this.readSession(TOKEN_KEY);
  }

  private readUser(): AuthUser | null {
    const raw = this.readSession(USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      return { ...emptyProfile(), ...parsed };
    } catch {
      this.safeRemove(USER_KEY);
      this.removeSession(USER_KEY);
      return null;
    }
  }

  private writeSession(key: string, value: string, rememberMe: boolean): void {
    try {
      if (rememberMe) {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, value);
        localStorage.removeItem(key);
      }
    } catch {
      // Private browsing can block storage. Auth still works in-memory.
    }
  }

  private readSession(key: string): string | null {
    try {
      return sessionStorage.getItem(key) ?? localStorage.getItem(key);
    } catch {
      return this.safeGet(key);
    }
  }

  private removeSession(key: string): void {
    try {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    } catch {
      this.safeRemove(key);
    }
  }

  private safeGet(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private safeSet(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Private browsing can block storage. Auth still works in-memory.
    }
  }

  private safeRemove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage failures.
    }
  }
}
