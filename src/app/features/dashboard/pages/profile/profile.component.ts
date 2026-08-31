import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideBriefcase,
  LucideCheck,
  LucideChevronDown,
  LucideGraduationCap,
  LucideHeart,
  LucideMapPin,
  LucideMessagesSquare,
  LucidePencil,
  LucideSparkles,
  LucideUsers,
} from '@lucide/angular';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '../../../../core/data/country-codes';
import { INDIA_LOCATIONS, STATE_OPTIONS } from '../../../../core/data/india-locations';
import { AGE_OPTIONS, LOOKING_FOR_OPTIONS, lookingForLabel } from '../../../../core/data/partner-search-options';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SearchSelectComponent, SearchSelectOption } from '../../../../shared/search/search-select.component';
import profileOptions from '../../../../../assets/data/profile-options.json';

type ProfileStep = 'basics' | 'life' | 'education' | 'partner' | 'about';

@Component({
  selector: 'app-profile-page',
  imports: [
    ReactiveFormsModule,
    SearchSelectComponent,
    LucideBriefcase,
    LucideCheck,
    LucideChevronDown,
    LucideGraduationCap,
    LucideHeart,
    LucideMapPin,
    LucideMessagesSquare,
    LucidePencil,
    LucideSparkles,
    LucideUsers,
  ],
  templateUrl: './profile.component.html',
  host: {
    '(document:click)': 'countryMenuOpen.set(false)',
  },
})
export class ProfilePageComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly user = this.auth.user;
  readonly hasSavedProfile = this.auth.hasSavedProfile;
  readonly filling = signal(false);
  readonly stepIndex = signal(0);
  readonly stepError = signal('');
  readonly countryMenuOpen = signal(false);
  readonly initials = computed(() => {
    const parts = (this.user()?.fullName ?? 'Member').trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? 'G';
    const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? '';
    return `${first}${second}`.toUpperCase();
  });
  readonly profileId = computed(() => {
    const id = this.user()?.id ?? 'member';
    const digits = id.replace(/\D/g, '').slice(-6).padStart(6, '0');
    const prefix = (this.user()?.fullName ?? 'GB')
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 2)
      .toUpperCase()
      .padEnd(2, 'G');
    return `${prefix}-${digits}`;
  });
  readonly cityOptions = signal<SearchSelectOption[]>([]);
  readonly partnerCityOptions = signal<SearchSelectOption[]>([]);
  readonly steps: { id: ProfileStep; label: string; caption: string }[] = [
    { id: 'basics', label: 'Basic', caption: 'Who you are' },
    { id: 'life', label: 'Family', caption: 'Where you live' },
    { id: 'education', label: 'Education', caption: 'Study and work' },
    { id: 'partner', label: 'Partner', caption: 'Who you seek' },
    { id: 'about', label: 'About', caption: 'Your story' },
  ];
  readonly currentStep = computed(() => this.steps[this.stepIndex()]);
  readonly isLastStep = computed(() => this.stepIndex() === this.steps.length - 1);
  readonly linePercent = computed(() => (this.stepIndex() / (this.steps.length - 1)) * 100);

  readonly locationLine = computed(() => {
    const user = this.user();
    if (!user) {
      return '';
    }
    const parts = [user.city, user.state, user.city || user.state ? 'India' : ''].filter(Boolean);
    return parts.join(', ');
  });

  readonly countryCodes = COUNTRY_CODES;
  readonly ageOptions: SearchSelectOption[] = [
    { value: 'below-18', label: 'Below 18' },
    ...Array.from({ length: 43 }, (_, index) => {
      const year = String(18 + index);
      return { value: year, label: year };
    }),
  ];
  readonly genderOptions = this.toOptions(profileOptions.genders);
  readonly maritalOptions = this.toOptions(profileOptions.maritalStatuses);
  readonly religionOptions = this.toOptions(profileOptions.religions);
  readonly motherTongueOptions = this.toOptions(profileOptions.motherTongues);
  readonly educationOptions = this.toOptions(profileOptions.educations);
  readonly heightOptions = this.toOptions(profileOptions.heights);
  readonly communityOptions = this.toOptions(profileOptions.communities);
  readonly subCasteOptions = this.toOptions(profileOptions.subCastes);
  readonly dietOptions = this.toOptions(profileOptions.diets);
  readonly manglikOptions = this.toOptions(profileOptions.manglikOptions);
  readonly incomeOptions = this.toOptions(profileOptions.incomes);
  readonly familyTypeOptions = this.toOptions(profileOptions.familyTypes);
  readonly stateOptions = this.toOptions(STATE_OPTIONS);
  readonly lookingForOptions = LOOKING_FOR_OPTIONS;
  readonly partnerAgeOptions = AGE_OPTIONS;
  readonly educationSpecOptions = this.toOptions(profileOptions.educationSpecs);
  readonly yesNoOptions = this.toOptions(profileOptions.yesNo);

  readonly form = this.fb.nonNullable.group({
    fullName: [this.auth.user()?.fullName ?? '', Validators.required],
    email: [{ value: this.auth.user()?.email ?? '', disabled: true }],
    countryCode: [this.auth.user()?.countryCode || DEFAULT_COUNTRY_CODE],
    mobile: [this.auth.user()?.mobile ?? '', [Validators.pattern(/^$|^\d{6,15}$/)]],
    age: [this.auth.user()?.age ?? ''],
    gender: [this.auth.user()?.gender ?? ''],
    maritalStatus: [this.auth.user()?.maritalStatus ?? ''],
    motherTongue: [this.auth.user()?.motherTongue ?? ''],
    religion: [this.auth.user()?.religion ?? ''],
    education: [this.auth.user()?.education ?? ''],
    occupation: [this.auth.user()?.occupation ?? ''],
    hobbies: [this.auth.user()?.hobbies ?? ''],
    state: [this.auth.user()?.state ?? ''],
    city: [this.auth.user()?.city ?? ''],
    about: [this.auth.user()?.about ?? ''],
    height: [this.auth.user()?.height ?? ''],
    community: [this.auth.user()?.community ?? ''],
    subCaste: [this.auth.user()?.subCaste ?? ''],
    manglik: [this.auth.user()?.manglik ?? ''],
    income: [this.auth.user()?.income ?? ''],
    diet: [this.auth.user()?.diet ?? ''],
    familyType: [this.auth.user()?.familyType ?? ''],
    partnerLookingFor: [this.auth.user()?.partnerLookingFor ?? ''],
    partnerAgeFrom: [this.auth.user()?.partnerAgeFrom ?? ''],
    partnerAgeTo: [this.auth.user()?.partnerAgeTo ?? ''],
    partnerReligion: [this.auth.user()?.partnerReligion ?? ''],
    partnerMaritalStatus: [this.auth.user()?.partnerMaritalStatus ?? ''],
    partnerEducation: [this.auth.user()?.partnerEducation ?? ''],
    partnerHeight: [this.auth.user()?.partnerHeight ?? ''],
    partnerDiet: [this.auth.user()?.partnerDiet ?? ''],
    partnerManglik: [this.auth.user()?.partnerManglik ?? ''],
    partnerState: [this.auth.user()?.partnerState ?? ''],
    partnerCity: [this.auth.user()?.partnerCity ?? ''],
    educationSpec: [this.auth.user()?.educationSpec ?? ''],
    otherEducation: [this.auth.user()?.otherEducation ?? ''],
    occupationDetails: [this.auth.user()?.occupationDetails ?? ''],
    workAddress: [this.auth.user()?.workAddress ?? ''],
    religiousEducation: [this.auth.user()?.religiousEducation ?? ''],
    partnerRequirement: [this.auth.user()?.partnerRequirement ?? ''],
    partnerHeightFrom: [this.auth.user()?.partnerHeightFrom ?? ''],
    partnerHeightTo: [this.auth.user()?.partnerHeightTo ?? ''],
    partnerChildren: [this.auth.user()?.partnerChildren ?? ''],
    partnerDisability: [this.auth.user()?.partnerDisability ?? ''],
  });

  constructor() {
    this.cityOptions.set(this.citiesFor(this.form.controls.state.value));
    this.partnerCityOptions.set(this.citiesFor(this.form.controls.partnerState.value));
    if (!this.hasSavedProfile()) {
      this.startProfile();
    }
  }

  isStepDone(index: number): boolean {
    return this.isStepComplete(index);
  }

  canOpenStep(index: number): boolean {
    const firstOpen = this.steps.findIndex((_, step) => !this.isStepComplete(step));
    const cap = firstOpen === -1 ? this.steps.length - 1 : firstOpen;
    return index <= cap;
  }

  mobileMaxLength(): number {
    return this.form.controls.countryCode.value === '+91' ? 10 : 15;
  }

  toggleCountryMenu(event: Event): void {
    event.stopPropagation();
    this.countryMenuOpen.update((open) => !open);
  }

  selectCountryCode(code: string): void {
    this.onCountryCodeChange(code);
    this.countryMenuOpen.set(false);
  }

  onCountryCodeChange(code: string): void {
    this.form.controls.countryCode.setValue(code);
    const mobile = this.form.controls.mobile.value.replace(/\D/g, '').slice(0, this.mobileMaxLength());
    this.form.controls.mobile.setValue(mobile);
  }

  onMobileInput(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, this.mobileMaxLength());
    this.form.controls.mobile.setValue(digits);
  }

  setField(
    name:
      | 'age'
      | 'gender'
      | 'maritalStatus'
      | 'motherTongue'
      | 'religion'
      | 'education'
      | 'city'
      | 'height'
      | 'community'
      | 'subCaste'
      | 'manglik'
      | 'income'
      | 'diet'
      | 'familyType'
      | 'partnerLookingFor'
      | 'partnerAgeFrom'
      | 'partnerAgeTo'
      | 'partnerReligion'
      | 'partnerMaritalStatus'
      | 'partnerEducation'
      | 'partnerHeight'
      | 'partnerDiet'
      | 'partnerManglik'
      | 'partnerCity'
      | 'educationSpec'
      | 'partnerRequirement'
      | 'partnerHeightFrom'
      | 'partnerHeightTo'
      | 'partnerChildren'
      | 'partnerDisability',
    value: string,
  ): void {
    this.form.controls[name].setValue(value);
    this.stepError.set('');
  }

  onStateChange(state: string): void {
    this.form.controls.state.setValue(state);
    this.cityOptions.set(this.citiesFor(state));
    if (!this.cityOptions().some((option) => option.value === this.form.controls.city.value)) {
      this.form.controls.city.setValue('');
    }
    this.stepError.set('');
  }

  onPartnerStateChange(state: string): void {
    this.form.controls.partnerState.setValue(state);
    this.partnerCityOptions.set(this.citiesFor(state));
    if (!this.partnerCityOptions().some((option) => option.value === this.form.controls.partnerCity.value)) {
      this.form.controls.partnerCity.setValue('');
    }
    this.stepError.set('');
  }

  displayLookingFor(): string {
    return lookingForLabel(this.user()?.partnerLookingFor ?? '') || this.display(this.user()?.partnerLookingFor);
  }

  displayPartnerAge(): string {
    const from = this.user()?.partnerAgeFrom?.trim() ?? '';
    const to = this.user()?.partnerAgeTo?.trim() ?? '';
    if (from && to) {
      return `${from} – ${to} yrs`;
    }
    return this.display(from || to);
  }

  displayPartnerHeight(): string {
    const from = this.user()?.partnerHeightFrom?.trim() || this.user()?.partnerHeight?.trim() || '';
    const to = this.user()?.partnerHeightTo?.trim() ?? '';
    if (from && to) {
      return `${from} to ${to}`;
    }
    return this.display(from || to);
  }

  displayPartnerLocation(): string {
    const user = this.user();
    const parts = [user?.partnerCity, user?.partnerState].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  }

  display(value: string | undefined): string {
    const text = value?.trim() ?? '';
    return text || '—';
  }

  displayAge(): string {
    const age = this.user()?.age;
    if (!age) {
      return '—';
    }
    if (age === 'below-18') {
      return 'Below 18';
    }
    return `${age} yrs`;
  }

  displayMobile(): string {
    const user = this.user();
    const mobile = user?.mobile?.trim() ?? '';
    if (!mobile) {
      return '—';
    }
    return `${user?.countryCode || DEFAULT_COUNTRY_CODE} ${mobile}`;
  }

  startProfile(): void {
    const user = this.user();
    if (user) {
      this.form.patchValue({
        fullName: user.fullName ?? '',
        email: user.email ?? '',
        countryCode: user.countryCode || DEFAULT_COUNTRY_CODE,
        mobile: user.mobile ?? '',
        age: user.age ?? '',
        gender: user.gender ?? '',
        maritalStatus: user.maritalStatus ?? '',
        motherTongue: user.motherTongue ?? '',
        religion: user.religion ?? '',
        education: user.education ?? '',
        occupation: user.occupation ?? '',
        hobbies: user.hobbies ?? '',
        state: user.state ?? '',
        city: user.city ?? '',
        about: user.about ?? '',
        height: user.height ?? '',
        community: user.community ?? '',
        subCaste: user.subCaste ?? '',
        manglik: user.manglik ?? '',
        income: user.income ?? '',
        diet: user.diet ?? '',
        familyType: user.familyType ?? '',
        partnerLookingFor: user.partnerLookingFor ?? '',
        partnerAgeFrom: user.partnerAgeFrom ?? '',
        partnerAgeTo: user.partnerAgeTo ?? '',
        partnerReligion: user.partnerReligion ?? '',
        partnerMaritalStatus: user.partnerMaritalStatus ?? '',
        partnerEducation: user.partnerEducation ?? '',
        partnerHeight: user.partnerHeight ?? '',
        partnerDiet: user.partnerDiet ?? '',
        partnerManglik: user.partnerManglik ?? '',
        partnerState: user.partnerState ?? '',
        partnerCity: user.partnerCity ?? '',
        educationSpec: user.educationSpec ?? '',
        otherEducation: user.otherEducation ?? '',
        occupationDetails: user.occupationDetails ?? '',
        workAddress: user.workAddress ?? '',
        religiousEducation: user.religiousEducation ?? '',
        partnerRequirement: user.partnerRequirement ?? '',
        partnerHeightFrom: user.partnerHeightFrom ?? '',
        partnerHeightTo: user.partnerHeightTo ?? '',
        partnerChildren: user.partnerChildren ?? '',
        partnerDisability: user.partnerDisability ?? '',
      });
      this.cityOptions.set(this.citiesFor(user.state));
      this.partnerCityOptions.set(this.citiesFor(user.partnerState));
    }
    this.stepError.set('');
    this.stepIndex.set(0);
    this.filling.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editProfile(): void {
    this.startProfile();
  }

  goBack(): void {
    this.stepError.set('');
    if (this.stepIndex() === 0) {
      if (this.hasSavedProfile()) {
        this.filling.set(false);
        return;
      }
      void this.router.navigateByUrl('/dashboard');
      return;
    }
    this.stepIndex.update((index) => index - 1);
  }

  goNext(): void {
    if (!this.isStepComplete(this.stepIndex())) {
      this.stepError.set('Please fill this section before going next.');
      return;
    }
    this.stepError.set('');
    this.stepIndex.update((index) => Math.min(index + 1, this.steps.length - 1));
  }

  goToStep(index: number): void {
    if (!this.canOpenStep(index)) {
      this.stepError.set('Please fill the earlier section first.');
      return;
    }
    this.stepError.set('');
    this.stepIndex.set(index);
  }

  save(): void {
    if (!this.isLastStep()) {
      this.goNext();
      return;
    }

    const incomplete = this.steps.findIndex((_, index) => !this.isStepComplete(index));
    if (incomplete !== -1) {
      this.stepIndex.set(incomplete);
      this.stepError.set('Please fill every section before saving.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.stepError.set('Please check the contact details.');
      this.stepIndex.set(0);
      return;
    }

    const firstSave = !this.auth.user()?.profileSaved;
    const value = this.form.getRawValue();
    this.auth.updateProfile({
      fullName: value.fullName.trim(),
      countryCode: value.countryCode,
      mobile: value.mobile.trim(),
      age: value.age,
      gender: value.gender,
      maritalStatus: value.maritalStatus,
      motherTongue: value.motherTongue,
      education: value.education,
      hobbies: value.hobbies.trim(),
      state: value.state,
      city: value.city,
      religion: value.religion,
      occupation: value.occupation.trim(),
      about: value.about.trim(),
      height: value.height,
      community: value.community,
      subCaste: value.subCaste,
      manglik: value.manglik,
      diet: value.diet,
      familyType: value.familyType,
      income: value.income,
      partnerLookingFor: value.partnerLookingFor,
      partnerAgeFrom: value.partnerAgeFrom,
      partnerAgeTo: value.partnerAgeTo,
      partnerReligion: value.partnerReligion,
      partnerMaritalStatus: value.partnerMaritalStatus,
      partnerEducation: value.partnerEducation,
      partnerHeight: value.partnerHeight,
      partnerDiet: value.partnerDiet,
      partnerManglik: value.partnerManglik,
      partnerState: value.partnerState,
      partnerCity: value.partnerCity,
      educationSpec: value.educationSpec,
      otherEducation: value.otherEducation.trim(),
      occupationDetails: value.occupationDetails.trim(),
      workAddress: value.workAddress.trim(),
      religiousEducation: value.religiousEducation.trim(),
      partnerRequirement: value.partnerRequirement.trim(),
      partnerHeightFrom: value.partnerHeightFrom,
      partnerHeightTo: value.partnerHeightTo,
      partnerChildren: value.partnerChildren,
      partnerDisability: value.partnerDisability,
      profileSaved: true,
    });
    this.filling.set(false);
    this.stepIndex.set(0);
    this.stepError.set('');
    this.toast.show(firstSave ? 'Your profile is 100% complete.' : 'Profile updated successfully.');
    if (firstSave) {
      void this.router.navigateByUrl('/dashboard');
    }
  }

  private isStepComplete(index: number): boolean {
    switch (this.steps[index]?.id) {
      case 'basics':
        return (
          this.filled('fullName') &&
          this.form.controls.mobile.valid &&
          this.filledAll(['age', 'gender', 'maritalStatus', 'religion', 'motherTongue'])
        );
      case 'life':
        return this.filledAll(['state', 'city']);
      case 'education':
        return this.filledAll(['education', 'occupation']);
      case 'partner':
        return this.filledAll([
          'partnerRequirement',
          'partnerAgeFrom',
          'partnerAgeTo',
          'partnerHeightFrom',
          'partnerHeightTo',
          'partnerMaritalStatus',
          'partnerEducation',
          'partnerDiet',
        ]);
      case 'about':
        return this.filled('about');
      default:
        return false;
    }
  }

  private filledAll(names: Array<keyof typeof this.form.controls>): boolean {
    return names.every((name) => this.filled(name));
  }

  private filled(name: keyof typeof this.form.controls): boolean {
    return Boolean(this.form.controls[name].getRawValue()?.toString().trim());
  }

  private toOptions(values: string[]): SearchSelectOption[] {
    return values.map((value) => ({ value, label: value }));
  }

  private citiesFor(state: string): SearchSelectOption[] {
    return this.toOptions(INDIA_LOCATIONS[state] ?? []);
  }
}
