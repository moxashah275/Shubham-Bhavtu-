import type { AuthUser } from '../models/auth.model';

/** All profile fields stored on the user account (excluding auth identity). */
export const PROFILE_DATA_KEYS = [
  'mobile',
  'countryCode',
  'age',
  'dateOfBirth',
  'gender',
  'maritalStatus',
  'motherTongue',
  'education',
  'hobbies',
  'state',
  'city',
  'religion',
  'occupation',
  'about',
  'height',
  'weight',
  'community',
  'subCaste',
  'manglik',
  'diet',
  'familyType',
  'income',
  'willingToRelocate',
  'bloodGroup',
  'disability',
  'country',
  'nativePlace',
  'currentAddress',
  'permanentAddress',
  'sameAsPermanent',
  'jainSect',
  'jainCaste',
  'gotra',
  'fatherName',
  'motherName',
  'fatherOccupation',
  'motherOccupation',
  'brothers',
  'sisters',
  'birthTime',
  'birthPlace',
  'rasi',
  'nakshatra',
  'educationSpec',
  'degree',
  'specialization',
  'university',
  'otherEducation',
  'employmentStatus',
  'companyName',
  'designation',
  'workExperience',
  'workLocation',
  'occupationDetails',
  'workAddress',
  'religiousEducation',
  'exerciseFrequency',
  'travelFrequency',
  'languagesKnown',
  'personality',
  'futureGoals',
  'partnerLookingFor',
  'partnerAgeFrom',
  'partnerAgeTo',
  'partnerReligion',
  'partnerMaritalStatus',
  'partnerEducation',
  'partnerOccupation',
  'partnerHeight',
  'partnerDiet',
  'partnerManglik',
  'partnerState',
  'partnerCity',
  'jainSectPreference',
  'partnerRequirement',
  'partnerHeightFrom',
  'partnerHeightTo',
  'partnerChildren',
  'partnerDisability',
  'horoscopeMatching',
  'profilePhoto',
  'profileSaved',
] as const;

export type ProfileDataKey = (typeof PROFILE_DATA_KEYS)[number];

export function emptyProfileData(): Pick<AuthUser, ProfileDataKey> {
  return {
    mobile: '',
    countryCode: '',
    age: '',
    dateOfBirth: '',
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
    weight: '',
    community: '',
    subCaste: '',
    manglik: '',
    diet: '',
    familyType: '',
    income: '',
    willingToRelocate: '',
    bloodGroup: '',
    disability: '',
    country: '',
    nativePlace: '',
    currentAddress: '',
    permanentAddress: '',
    sameAsPermanent: false,
    jainSect: '',
    jainCaste: '',
    gotra: '',
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    brothers: '',
    sisters: '',
    birthTime: '',
    birthPlace: '',
    rasi: '',
    nakshatra: '',
    educationSpec: '',
    degree: '',
    specialization: '',
    university: '',
    otherEducation: '',
    employmentStatus: '',
    companyName: '',
    designation: '',
    workExperience: '',
    workLocation: '',
    occupationDetails: '',
    workAddress: '',
    religiousEducation: '',
    exerciseFrequency: '',
    travelFrequency: '',
    languagesKnown: '',
    personality: '',
    futureGoals: '',
    partnerLookingFor: '',
    partnerAgeFrom: '',
    partnerAgeTo: '',
    partnerReligion: '',
    partnerMaritalStatus: '',
    partnerEducation: '',
    partnerOccupation: '',
    partnerHeight: '',
    partnerDiet: '',
    partnerManglik: '',
    partnerState: '',
    partnerCity: '',
    jainSectPreference: '',
    partnerRequirement: '',
    partnerHeightFrom: '',
    partnerHeightTo: '',
    partnerChildren: '',
    partnerDisability: '',
    horoscopeMatching: '',
    profilePhoto: '',
    profileSaved: false,
  };
}

export function pickProfileData(user: Partial<AuthUser>): Partial<Pick<AuthUser, ProfileDataKey>> {
  const data: Partial<Pick<AuthUser, ProfileDataKey>> = {};
  for (const key of PROFILE_DATA_KEYS) {
    const value = user[key as keyof AuthUser];
    if (value !== undefined) {
      (data as Record<string, string | boolean>)[key] = value as string | boolean;
    }
  }
  return data;
}

export function profileFromStored(account: Partial<AuthUser>): Pick<AuthUser, ProfileDataKey> {
  return { ...emptyProfileData(), ...pickProfileData(account) } as Pick<AuthUser, ProfileDataKey>;
}

export function formatWorkExperienceLabel(value: string | undefined | null): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return '';
  }
  if (trimmed === '20+') {
    return '20+ years';
  }
  if (trimmed.includes('-')) {
    const [from, to] = trimmed.split('-');
    return `${from} to ${to} years`;
  }
  const year = Number(trimmed);
  if (!Number.isNaN(year)) {
    return year === 0 ? '0 to 1 year' : `${year} to ${year + 1} years`;
  }
  return trimmed;
}
