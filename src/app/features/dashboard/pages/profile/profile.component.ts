import { Component, computed, effect, ElementRef, inject, signal, untracked, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideArrowLeft,
  LucideBriefcase,
  LucideCamera,
  LucideCheck,
  LucideChevronDown,
  LucideImage,
  LucideMapPin,
  LucidePlus,
  LucideUpload,
} from '@lucide/angular';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '../../../../core/data/country-codes';
import { INDIA_LOCATIONS, STATE_OPTIONS } from '../../../../core/data/india-locations';
import { AGE_OPTIONS } from '../../../../core/data/partner-search-options';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileViewService } from '../../../../core/services/profile-view.service';
import { ToastService } from '../../../../core/services/toast.service';
import { formatWorkExperienceLabel } from '../../../../core/profile/profile-data';
import { SearchSelectComponent, SearchSelectOption } from '../../../../shared/search/search-select.component';
import { ProfileSavedViewComponent } from './profile-saved-view.component';
import profileOptions from '../../../../../assets/data/profile-options.json';

type ProfileStep = 'personal' | 'family' | 'education' | 'about';

type ProfileStringField =
  | 'fullName'
  | 'countryCode'
  | 'mobile'
  | 'dateOfBirth'
  | 'gender'
  | 'height'
  | 'weight'
  | 'willingToRelocate'
  | 'bloodGroup'
  | 'disability'
  | 'religion'
  | 'country'
  | 'state'
  | 'city'
  | 'nativePlace'
  | 'currentAddress'
  | 'permanentAddress'
  | 'jainSect'
  | 'jainCaste'
  | 'subCaste'
  | 'gotra'
  | 'diet'
  | 'familyType'
  | 'fatherName'
  | 'motherName'
  | 'fatherOccupation'
  | 'motherOccupation'
  | 'brothers'
  | 'sisters'
  | 'birthTime'
  | 'birthPlace'
  | 'rasi'
  | 'nakshatra'
  | 'manglik'
  | 'educationSpec'
  | 'degree'
  | 'specialization'
  | 'university'
  | 'employmentStatus'
  | 'occupation'
  | 'companyName'
  | 'designation'
  | 'workExperience'
  | 'income'
  | 'workLocation'
  | 'exerciseFrequency'
  | 'travelFrequency'
  | 'hobbies'
  | 'languagesKnown'
  | 'about'
  | 'personality'
  | 'futureGoals'
  | 'partnerAgeFrom'
  | 'partnerAgeTo'
  | 'partnerHeightFrom'
  | 'partnerHeightTo'
  | 'partnerMaritalStatus'
  | 'partnerEducation'
  | 'partnerOccupation'
  | 'jainSectPreference'
  | 'partnerState'
  | 'partnerCity'
  | 'partnerDiet'
  | 'partnerChildren'
  | 'horoscopeMatching'
  | 'partnerDisability'
  | 'partnerManglik';

type ProfileRadioField =
  | 'gender'
  | 'willingToRelocate'
  | 'exerciseFrequency'
  | 'travelFrequency'
  | 'disability'
  | 'familyType'
  | 'manglik';

@Component({
  selector: 'app-profile-page',
  imports: [
    ReactiveFormsModule,
    SearchSelectComponent,
    ProfileSavedViewComponent,
    LucideArrowLeft,
    LucideBriefcase,
    LucideCamera,
    LucideCheck,
    LucideChevronDown,
    LucideImage,
    LucideMapPin,
    LucidePlus,
    LucideUpload,
  ],
  templateUrl: './profile.component.html',
  host: {
    '(document:click)': 'onDocumentClick()',
  },
})
export class ProfilePageComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly profileView = inject(ProfileViewService);
  private readonly fb = inject(FormBuilder);

  readonly user = this.auth.user;
  readonly hasSavedProfile = this.auth.hasSavedProfile;
  readonly filling = signal(false);
  readonly stepIndex = signal(0);
  readonly stepError = signal('');
  readonly countryMenuOpen = signal(false);
  readonly photoUploadMenuOpen = signal(false);
  readonly maxProfilePhotos = 6;
  readonly profilePhotoInput = viewChild<ElementRef<HTMLInputElement>>('profilePhotoInput');
  readonly aboutGalleryInput = viewChild<ElementRef<HTMLInputElement>>('aboutGalleryInput');
  readonly aboutCameraInput = viewChild<ElementRef<HTMLInputElement>>('aboutCameraInput');
  readonly profilePhotoUrl = computed(() => this.user()?.profilePhoto?.trim() || '');
  readonly todayMax = new Date().toISOString().split('T')[0];

  readonly cityOptions = signal<SearchSelectOption[]>([]);
  readonly partnerCityOptions = signal<SearchSelectOption[]>([]);

  readonly steps: { id: ProfileStep; label: string }[] = [
    { id: 'personal', label: 'Personal' },
    { id: 'family', label: 'Family' },
    { id: 'education', label: 'Education & Lifestyle' },
    { id: 'about', label: 'About & Partner' },
  ];

  readonly currentStep = computed(() => this.steps[this.stepIndex()]);
  readonly isLastStep = computed(() => this.stepIndex() === this.steps.length - 1);
  readonly linePercent = computed(() => (this.stepIndex() / (this.steps.length - 1)) * 100);

  readonly locationLine = computed(() => {
    const user = this.user();
    if (!user) {
      return '';
    }
    const parts = [user.city, user.state, user.country || (user.city || user.state ? 'India' : '')].filter(Boolean);
    return parts.join(', ');
  });

  readonly countryCodes = COUNTRY_CODES;
  readonly genderRadioOptions = profileOptions.genders;
  readonly willingToRelocateOptions = profileOptions.willingToRelocate;
  readonly exerciseFrequencyOptions = profileOptions.exerciseFrequencies;
  readonly travelFrequencyOptions = profileOptions.travelFrequencies;
  readonly disabilityRadioOptions = profileOptions.disabilityOptions;
  readonly familyTypeRadioOptions = profileOptions.familyTypes;
  readonly manglikRadioOptions = profileOptions.manglikOptions;
  readonly languageOptions = profileOptions.languages;

  readonly religionOptions = this.toOptions(profileOptions.religions);
  readonly weightOptions = this.toOptions(profileOptions.weights);
  readonly bloodGroupOptions = this.toOptions(profileOptions.bloodGroups);
  readonly yesNoOptions = this.toOptions(profileOptions.yesNo);
  readonly countryOptions = this.toOptions(profileOptions.countries);
  readonly stateOptions = this.toOptions([...STATE_OPTIONS, 'Other']);
  readonly jainSectOptions = this.toOptions(profileOptions.jainSects);
  readonly jainCasteOptions = this.toOptions(profileOptions.jainCastes);
  readonly subCasteOptions = this.toOptions(profileOptions.subCastes);
  readonly gotraOptions = this.toOptions(profileOptions.gotras);
  readonly dietOptions = this.toOptions(profileOptions.diets);
  readonly siblingCountOptions = this.toOptions(profileOptions.siblingCounts);
  readonly rasiOptions = this.toOptions(profileOptions.rasiOptions);
  readonly nakshatraOptions = this.toOptions(profileOptions.nakshatraOptions);
  readonly manglikOptions = this.toOptions(profileOptions.manglikOptions);
  readonly educationSpecOptions = this.toOptions(profileOptions.educationSpecs);
  readonly employmentStatusOptions = this.toOptions(profileOptions.employmentStatuses);
  readonly workExperienceOptions = profileOptions.workExperienceYears.map((value) => ({
    value,
    label: formatWorkExperienceLabel(value),
  }));
  readonly incomeOptions = this.toOptions(profileOptions.incomes);
  readonly partnerAgeOptions = AGE_OPTIONS;
  readonly ageOptions = AGE_OPTIONS;
  readonly heightOptions = this.toOptions(profileOptions.heights);
  readonly maritalOptions = this.toOptions(profileOptions.maritalStatuses);

  readonly form = this.fb.nonNullable.group({
    fullName: [this.auth.user()?.fullName ?? ''],
    email: [{ value: this.auth.user()?.email ?? '', disabled: true }],
    countryCode: [this.auth.user()?.countryCode || DEFAULT_COUNTRY_CODE],
    mobile: [this.auth.user()?.mobile ?? ''],
    dateOfBirth: [this.auth.user()?.dateOfBirth ?? ''],
    gender: [this.auth.user()?.gender ?? ''],
    height: [this.auth.user()?.height ?? ''],
    age: [this.auth.user()?.age ?? ''],
    weight: [this.auth.user()?.weight ?? ''],
    willingToRelocate: [this.auth.user()?.willingToRelocate ?? ''],
    bloodGroup: [this.auth.user()?.bloodGroup ?? ''],
    disability: [this.auth.user()?.disability ?? ''],
    religion: [this.auth.user()?.religion ?? ''],
    country: [this.auth.user()?.country ?? ''],
    state: [this.auth.user()?.state ?? ''],
    city: [this.auth.user()?.city ?? ''],
    nativePlace: [this.auth.user()?.nativePlace ?? ''],
    currentAddress: [this.auth.user()?.currentAddress ?? ''],
    permanentAddress: [this.auth.user()?.permanentAddress ?? ''],
    sameAsPermanent: [this.auth.user()?.sameAsPermanent ?? false],
    jainSect: [this.auth.user()?.jainSect ?? ''],
    jainCaste: [this.auth.user()?.jainCaste ?? ''],
    subCaste: [this.auth.user()?.subCaste ?? ''],
    gotra: [this.auth.user()?.gotra ?? ''],
    diet: [this.auth.user()?.diet ?? ''],
    familyType: [this.auth.user()?.familyType ?? ''],
    fatherName: [this.auth.user()?.fatherName ?? ''],
    motherName: [this.auth.user()?.motherName ?? ''],
    fatherOccupation: [this.auth.user()?.fatherOccupation ?? ''],
    motherOccupation: [this.auth.user()?.motherOccupation ?? ''],
    brothers: [this.auth.user()?.brothers ?? ''],
    sisters: [this.auth.user()?.sisters ?? ''],
    birthTime: [this.auth.user()?.birthTime ?? ''],
    birthPlace: [this.auth.user()?.birthPlace ?? ''],
    rasi: [this.auth.user()?.rasi ?? ''],
    nakshatra: [this.auth.user()?.nakshatra ?? ''],
    manglik: [this.auth.user()?.manglik ?? ''],
    educationSpec: [this.auth.user()?.educationSpec ?? ''],
    degree: [this.auth.user()?.degree ?? ''],
    specialization: [this.auth.user()?.specialization ?? ''],
    university: [this.auth.user()?.university ?? ''],
    employmentStatus: [this.auth.user()?.employmentStatus ?? ''],
    occupation: [this.auth.user()?.occupation ?? ''],
    companyName: [this.auth.user()?.companyName ?? ''],
    designation: [this.auth.user()?.designation ?? ''],
    workExperience: [this.auth.user()?.workExperience ?? ''],
    income: [this.auth.user()?.income ?? ''],
    workLocation: [this.auth.user()?.workLocation ?? ''],
    exerciseFrequency: [this.auth.user()?.exerciseFrequency ?? ''],
    travelFrequency: [this.auth.user()?.travelFrequency ?? ''],
    hobbies: [this.auth.user()?.hobbies ?? ''],
    languagesKnown: [this.auth.user()?.languagesKnown ?? ''],
    about: [this.auth.user()?.about ?? ''],
    personality: [this.auth.user()?.personality ?? ''],
    futureGoals: [this.auth.user()?.futureGoals ?? ''],
    partnerAgeFrom: [this.auth.user()?.partnerAgeFrom ?? ''],
    partnerAgeTo: [this.auth.user()?.partnerAgeTo ?? ''],
    partnerHeightFrom: [this.auth.user()?.partnerHeightFrom ?? ''],
    partnerHeightTo: [this.auth.user()?.partnerHeightTo ?? ''],
    partnerMaritalStatus: [this.auth.user()?.partnerMaritalStatus ?? ''],
    partnerEducation: [this.auth.user()?.partnerEducation ?? ''],
    partnerOccupation: [this.auth.user()?.partnerOccupation ?? ''],
    jainSectPreference: [this.auth.user()?.jainSectPreference ?? ''],
    partnerState: [this.auth.user()?.partnerState ?? ''],
    partnerCity: [this.auth.user()?.partnerCity ?? ''],
    partnerDiet: [this.auth.user()?.partnerDiet ?? ''],
    partnerChildren: [this.auth.user()?.partnerChildren ?? ''],
    horoscopeMatching: [this.auth.user()?.horoscopeMatching ?? ''],
    partnerDisability: [this.auth.user()?.partnerDisability ?? ''],
    partnerManglik: [this.auth.user()?.partnerManglik ?? ''],
  });

  constructor() {
    this.cityOptions.set(this.citiesFor(this.form.controls.state.value));
    this.partnerCityOptions.set(this.citiesFor(this.form.controls.partnerState.value));
    if (!this.hasSavedProfile()) {
      this.startProfile();
    }

    effect(() => {
      const tick = this.profileView.viewRequested();
      untracked(() => {
        if (tick > 0 && this.hasSavedProfile()) {
          this.exitEditMode();
        }
      });
    });
  }

  isStepDone(index: number): boolean {
    return index < this.stepIndex();
  }

  canOpenStep(_index: number): boolean {
    return true;
  }

  isRadioSelected(field: ProfileRadioField, value: string): boolean {
    return this.form.controls[field].value === value;
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

  setField(name: ProfileStringField, value: string): void {
    this.form.controls[name].setValue(value);
    this.stepError.set('');
  }

  setAge(value: string): void {
    this.form.controls.age.setValue(value);
    this.stepError.set('');
  }

  onDateOfBirthInput(): void {
    this.stepError.set('');
    const fromDob = this.ageForStorage(this.form.controls.dateOfBirth.value);
    if (fromDob && fromDob !== 'below-18') {
      this.form.controls.age.setValue(fromDob);
    }
  }

  setRadio(field: ProfileRadioField, value: string): void {
    this.form.controls[field].setValue(value);
    this.stepError.set('');
  }

  isLanguageSelected(language: string): boolean {
    return this.parseLanguages(this.form.controls.languagesKnown.value).includes(language);
  }

  toggleLanguage(language: string, checked: boolean): void {
    const current = this.parseLanguages(this.form.controls.languagesKnown.value);
    const next = checked
      ? current.includes(language)
        ? current
        : [...current, language]
      : current.filter((item) => item !== language);
    this.form.controls.languagesKnown.setValue(next.join(', '));
    this.stepError.set('');
  }

  selectedLanguages(): string[] {
    return this.parseLanguages(this.form.controls.languagesKnown.value);
  }

  removeLanguage(language: string): void {
    this.toggleLanguage(language, false);
  }

  displayLanguageList(): string[] {
    return this.parseLanguages(this.user()?.languagesKnown);
  }

  onSameAddressChange(checked: boolean): void {
    this.form.controls.sameAsPermanent.setValue(checked);
    if (checked) {
      this.form.controls.permanentAddress.setValue(this.form.controls.currentAddress.value);
    }
    this.stepError.set('');
  }

  onCurrentAddressInput(): void {
    this.stepError.set('');
    if (this.form.controls.sameAsPermanent.value) {
      this.form.controls.permanentAddress.setValue(this.form.controls.currentAddress.value);
    }
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

  displayPartnerAge(): string {
    const from = this.user()?.partnerAgeFrom?.trim() ?? '';
    const to = this.user()?.partnerAgeTo?.trim() ?? '';
    if (from && to) {
      return `${from} – ${to} yrs`;
    }
    return this.display(from || to);
  }

  displayPartnerHeight(): string {
    const from = this.user()?.partnerHeightFrom?.trim() ?? '';
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

  display(value: string | undefined | boolean): string {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    const text = value?.trim() ?? '';
    return text || '—';
  }

  displayReligionChip(): string {
    return this.heroReligionLabel();
  }

  heroFullName(): string {
    const fromUser = this.user()?.fullName?.trim() ?? '';
    const fromForm = this.form.controls.fullName.value?.trim() ?? '';
    return this.filling() ? fromForm || fromUser : fromUser || fromForm;
  }

  heroInitials(): string {
    return this.initialsFromName(this.heroFullName() || 'Member');
  }

  heroProfileId(): string {
    return this.buildProfileId(this.heroFullName() || this.user()?.fullName || 'GB', this.user()?.id ?? 'member');
  }

  heroAgeWeightChip(): string {
    const dob = this.heroDateOfBirth();
    const weight = this.heroWeight();
    const age =
      this.ageTextFromStoredAge(this.filling() ? this.form.controls.age.value : this.user()?.age) ||
      this.ageTextFromDob(dob);
    if (age && weight) {
      return `${age} · ${weight}`;
    }
    return age || weight;
  }

  heroReligionLabel(): string {
    const religion = (this.filling() ? this.form.controls.religion.value : this.user()?.religion)?.trim() ?? '';
    return religion;
  }

  heroRelocateLabel(): string {
    const fromUser = this.user()?.willingToRelocate?.trim() ?? '';
    const fromForm = this.form.controls.willingToRelocate.value?.trim() ?? '';
    return this.filling() ? fromForm || fromUser : fromUser || fromForm;
  }

  heroLocationLine(): string {
    if (this.filling()) {
      const city = this.form.controls.city.value?.trim() ?? '';
      const state = this.form.controls.state.value?.trim() ?? '';
      const fromForm = [city, state].filter(Boolean).join(', ');
      if (fromForm) {
        return fromForm;
      }
    }
    const user = this.user();
    return [user?.city, user?.state].filter(Boolean).join(', ');
  }

  heroOccupationLabel(): string {
    const fromUser = this.user()?.occupation?.trim() ?? '';
    const fromForm = this.form.controls.occupation.value?.trim() ?? '';
    return this.filling() ? fromForm || fromUser : fromUser || fromForm;
  }

  triggerPhotoUpload(event: Event): void {
    event.stopPropagation();
    this.profilePhotoInput()?.nativeElement.click();
  }

  profilePhotos(): string[] {
    const user = this.user();
    if (!user) {
      return [];
    }
    return (user.profilePhotos ?? []).map((photo) => photo.trim()).filter(Boolean);
  }

  mainProfilePhoto(): string {
    return this.profilePhotos()[0] ?? '';
  }

  otherProfilePhotos(): string[] {
    return this.profilePhotos().slice(1);
  }

  canAddProfilePhoto(): boolean {
    return this.profilePhotos().length < this.maxProfilePhotos;
  }

  togglePhotoUploadMenu(event: Event): void {
    event.stopPropagation();
    this.photoUploadMenuOpen.update((open) => !open);
  }

  openGalleryUpload(event: Event): void {
    event.stopPropagation();
    this.photoUploadMenuOpen.set(false);
    this.aboutGalleryInput()?.nativeElement.click();
  }

  openCameraUpload(event: Event): void {
    event.stopPropagation();
    this.photoUploadMenuOpen.set(false);
    this.aboutCameraInput()?.nativeElement.click();
  }

  onGalleryPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.toast.show('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    void this.addProfilePhoto(file);
  }

  setMainProfilePhoto(index: number, event?: Event): void {
    event?.stopPropagation();
    const photos = [...this.profilePhotos()];
    if (index < 1 || index >= photos.length) {
      return;
    }
    const [selected] = photos.splice(index, 1);
    photos.unshift(selected);
    this.persistProfilePhotos(photos);
  }

  removeProfilePhotoAt(index: number, event: Event): void {
    event.stopPropagation();
    const photos = [...this.profilePhotos()];
    if (index < 0 || index >= photos.length) {
      return;
    }
    photos.splice(index, 1);
    this.persistProfilePhotos(photos);
    this.toast.show('Photo removed.');
  }

  onDocumentClick(): void {
    this.countryMenuOpen.set(false);
    this.photoUploadMenuOpen.set(false);
  }

  onProfilePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.toast.show('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    void this.applyProfilePhoto(file);
  }

  removeProfilePhoto(event: Event): void {
    event.stopPropagation();
    const current = this.auth.user();
    if (!current?.profilePhoto?.trim()) {
      return;
    }
    const stayInEdit = this.filling();
    this.auth.updateProfile({
      ...current,
      profilePhoto: '',
    });
    if (stayInEdit) {
      this.filling.set(true);
    }
    this.toast.show('Profile photo removed.');
  }

  displayAge(): string {
    const fromStored = this.ageTextFromStoredAge(this.user()?.age);
    if (fromStored) {
      return fromStored;
    }
    return this.ageTextFromDob(this.user()?.dateOfBirth) || '—';
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
      this.patchFormFromUser(user);
    }
    this.stepError.set('');
    this.stepIndex.set(0);
    this.filling.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editProfile(): void {
    this.startProfile();
  }

  backToProfileView(): void {
    if (!this.hasSavedProfile()) {
      return;
    }
    this.exitEditMode();
  }

  goBack(): void {
    this.stepError.set('');
    if (this.stepIndex() === 0) {
      if (this.hasSavedProfile()) {
        this.exitEditMode();
        return;
      }
      void this.router.navigateByUrl('/dashboard');
      return;
    }
    this.stepIndex.update((index) => index - 1);
  }

  goNext(): void {
    this.stepError.set('');
    this.stepIndex.update((index) => Math.min(index + 1, this.steps.length - 1));
  }

  goToStep(index: number): void {
    this.stepError.set('');
    this.stepIndex.set(index);
  }

  save(): void {
    if (!this.isLastStep()) {
      this.goNext();
      return;
    }

    const current = this.auth.user();
    if (!current) {
      return;
    }

    const firstSave = !current.profileSaved;
    const { email: _email, ...value } = this.form.getRawValue();
    const { id: _id, email: _userEmail, username: _username, ...currentProfile } = current;
    const storedAge = value.age.trim() || this.ageForStorage(value.dateOfBirth) || current.age;
    this.auth.updateProfile({
      ...currentProfile,
      ...value,
      fullName: value.fullName.trim(),
      mobile: value.mobile.trim(),
      about: value.about.trim(),
      hobbies: value.hobbies.trim(),
      occupation: value.occupation.trim(),
      education: value.educationSpec,
      height: value.height.trim(),
      age: storedAge,
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

  private async addProfilePhoto(file: File): Promise<void> {
    const current = this.auth.user();
    if (!current) {
      return;
    }
    if (!this.canAddProfilePhoto()) {
      this.toast.show(`You can upload up to ${this.maxProfilePhotos} photos.`);
      return;
    }

    const stayInEdit = this.filling();

    try {
      const photo = await this.resizeProfilePhoto(file);
      const next = [...this.profilePhotos(), photo].slice(0, this.maxProfilePhotos);
      this.persistProfilePhotos(next, stayInEdit);
      this.toast.show('Photo added.');
    } catch {
      this.toast.show('Could not upload photo. Try a smaller image.');
    }
  }

  private async applyProfilePhoto(file: File): Promise<void> {
    const current = this.auth.user();
    if (!current) {
      return;
    }

    const stayInEdit = this.filling();

    try {
      const profilePhoto = await this.resizeProfilePhoto(file);
      this.auth.updateProfile({
        ...current,
        profilePhoto,
      });
      if (stayInEdit) {
        this.filling.set(true);
      }
      this.toast.show('Profile photo updated.');
    } catch {
      this.toast.show('Could not upload photo. Try a smaller image.');
    }
  }

  private persistProfilePhotos(photos: string[], stayInEdit = this.filling()): void {
    const current = this.auth.user();
    if (!current) {
      return;
    }

    const filtered = photos.map((photo) => photo.trim()).filter(Boolean).slice(0, this.maxProfilePhotos);
    this.auth.updateProfile({
      ...current,
      profilePhotos: filtered,
    });
    if (stayInEdit) {
      this.filling.set(true);
    }
  }

  private resizeProfilePhoto(file: File): Promise<string> {
    const maxBytes = 900_000;
    const outputSize = 320;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read failed'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('image failed'));
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = outputSize;
          canvas.height = outputSize;
          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error('canvas failed'));
            return;
          }

          const scale = Math.max(outputSize / image.width, outputSize / image.height);
          const width = image.width * scale;
          const height = image.height * scale;
          const offsetX = (outputSize - width) / 2;
          const offsetY = (outputSize - height) / 2;
          context.drawImage(image, offsetX, offsetY, width, height);

          let quality = 0.88;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length > maxBytes && quality > 0.45) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          if (dataUrl.length > maxBytes) {
            reject(new Error('too large'));
            return;
          }
          resolve(dataUrl);
        };
        image.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  private exitEditMode(): void {
    const user = this.user();
    if (user) {
      this.patchFormFromUser(user);
    }
    this.filling.set(false);
    this.stepIndex.set(0);
    this.stepError.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private heroDateOfBirth(): string {
    const fromUser = this.user()?.dateOfBirth?.trim() ?? '';
    const fromForm = this.form.controls.dateOfBirth.value?.trim() ?? '';
    return this.filling() ? fromForm || fromUser : fromUser || fromForm;
  }

  private heroWeight(): string {
    const fromUser = this.user()?.weight?.trim() ?? '';
    const fromForm = this.form.controls.weight.value?.trim() ?? '';
    return this.filling() ? fromForm || fromUser : fromUser || fromForm;
  }

  private ageForStorage(dob: string | undefined | null): string {
    const ageText = this.ageTextFromDob(dob);
    if (!ageText) {
      return '';
    }
    if (ageText === 'Below 18') {
      return 'below-18';
    }
    return ageText.replace(/\s*yrs$/i, '').trim();
  }

  private patchFormFromUser(user: NonNullable<ReturnType<typeof this.user>>): void {
    this.form.patchValue({
      fullName: user.fullName ?? '',
      email: user.email ?? '',
      countryCode: user.countryCode || DEFAULT_COUNTRY_CODE,
      mobile: user.mobile ?? '',
      dateOfBirth: user.dateOfBirth ?? '',
      gender: user.gender ?? '',
      height: user.height ?? '',
      age: user.age ?? '',
      weight: user.weight ?? '',
      willingToRelocate: user.willingToRelocate ?? '',
      bloodGroup: user.bloodGroup ?? '',
      disability: user.disability ?? '',
      religion: user.religion ?? '',
      country: user.country ?? '',
      state: user.state ?? '',
      city: user.city ?? '',
      nativePlace: user.nativePlace ?? '',
      currentAddress: user.currentAddress ?? '',
      permanentAddress: user.permanentAddress ?? '',
      sameAsPermanent: user.sameAsPermanent ?? false,
      jainSect: user.jainSect ?? '',
      jainCaste: user.jainCaste ?? '',
      subCaste: user.subCaste ?? '',
      gotra: user.gotra ?? '',
      diet: user.diet ?? '',
      familyType: user.familyType ?? '',
      fatherName: user.fatherName ?? '',
      motherName: user.motherName ?? '',
      fatherOccupation: user.fatherOccupation ?? '',
      motherOccupation: user.motherOccupation ?? '',
      brothers: user.brothers ?? '',
      sisters: user.sisters ?? '',
      birthTime: user.birthTime ?? '',
      birthPlace: user.birthPlace ?? '',
      rasi: user.rasi ?? '',
      nakshatra: user.nakshatra ?? '',
      manglik: user.manglik ?? '',
      educationSpec: user.educationSpec ?? '',
      degree: user.degree ?? '',
      specialization: user.specialization ?? '',
      university: user.university ?? '',
      employmentStatus: user.employmentStatus ?? '',
      occupation: user.occupation ?? '',
      companyName: user.companyName ?? '',
      designation: user.designation ?? '',
      workExperience: user.workExperience ?? '',
      income: user.income ?? '',
      workLocation: user.workLocation ?? '',
      exerciseFrequency: user.exerciseFrequency ?? '',
      travelFrequency: user.travelFrequency ?? '',
      hobbies: user.hobbies ?? '',
      languagesKnown: user.languagesKnown ?? '',
      about: user.about ?? '',
      personality: user.personality ?? '',
      futureGoals: user.futureGoals ?? '',
      partnerAgeFrom: user.partnerAgeFrom ?? '',
      partnerAgeTo: user.partnerAgeTo ?? '',
      partnerHeightFrom: user.partnerHeightFrom ?? '',
      partnerHeightTo: user.partnerHeightTo ?? '',
      partnerMaritalStatus: user.partnerMaritalStatus ?? '',
      partnerEducation: user.partnerEducation ?? '',
      partnerOccupation: user.partnerOccupation ?? '',
      jainSectPreference: user.jainSectPreference ?? '',
      partnerState: user.partnerState ?? '',
      partnerCity: user.partnerCity ?? '',
      partnerDiet: user.partnerDiet ?? '',
      partnerChildren: user.partnerChildren ?? '',
      horoscopeMatching: user.horoscopeMatching ?? '',
      partnerDisability: user.partnerDisability ?? '',
      partnerManglik: user.partnerManglik ?? '',
    });
    this.cityOptions.set(this.citiesFor(user.state));
    this.partnerCityOptions.set(this.citiesFor(user.partnerState));
  }

  private parseLanguages(value: string | undefined | null): string[] {
    return (value ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private initialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? 'G';
    const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? '';
    return `${first}${second}`.toUpperCase();
  }

  private buildProfileId(fullName: string, id: string): string {
    const digits = id.replace(/\D/g, '').slice(-6).padStart(6, '0');
    const prefix = fullName
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 2)
      .toUpperCase()
      .padEnd(2, 'G');
    return `${prefix}-${digits}`;
  }

  private ageTextFromDob(dob: string | undefined | null): string {
    const value = dob?.trim();
    if (!value) {
      return '';
    }
    const birth = new Date(value);
    if (Number.isNaN(birth.getTime())) {
      return '';
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return `${age} yrs`;
  }

  private ageTextFromStoredAge(age: string | undefined | null): string {
    const value = age?.trim();
    if (!value) {
      return '';
    }
    if (value === 'below-18') {
      return 'Below 18';
    }
    return `${value} yrs`;
  }

  private toOptions(values: string[]): SearchSelectOption[] {
    return values.map((value) => ({ value, label: value }));
  }

  private citiesFor(state: string): SearchSelectOption[] {
    const cities = [...(INDIA_LOCATIONS[state] ?? []), 'Other'];
    return this.toOptions(cities);
  }
}
