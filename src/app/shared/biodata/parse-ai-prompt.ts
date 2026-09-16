import type { AuthUser } from '../../core/models/auth.model';

/** Maps prompt labels (lowercase) to AuthUser keys. */
const LABEL_TO_KEY: Record<string, keyof AuthUser> = {
  'personal name': 'fullName',
  name: 'fullName',
  age: 'age',
  height: 'height',
  gender: 'gender',
  'marital status': 'maritalStatus',
  'date of birth': 'dateOfBirth',
  city: 'city',
  state: 'state',
  'native place': 'nativePlace',
  education: 'education',
  specialization: 'specialization',
  university: 'university',
  occupation: 'occupation',
  designation: 'designation',
  company: 'companyName',
  'employment status': 'employmentStatus',
  'work experience': 'workExperience',
  income: 'income',
  'family type': 'familyType',
  'father name': 'fatherName',
  'father occupation': 'fatherOccupation',
  'mother name': 'motherName',
  'mother occupation': 'motherOccupation',
  brothers: 'brothers',
  sisters: 'sisters',
  religion: 'religion',
  'jain sect': 'jainSect',
  caste: 'jainCaste',
  'sub caste': 'subCaste',
  gotra: 'gotra',
  diet: 'diet',
  'manglik / shani': 'manglik',
  manglik: 'manglik',
  'about me': 'about',
  hobbies: 'hobbies',
  'languages known': 'languagesKnown',
  'future goals': 'futureGoals',
  'preferred education': 'partnerEducation',
  'preferred occupation': 'partnerOccupation',
  'preferred city': 'partnerCity',
  'preferred state': 'partnerState',
  'preferred diet': 'partnerDiet',
};

function normalizeAge(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  if (/^below\s*18$/i.test(trimmed)) {
    return 'below-18';
  }
  return trimmed.replace(/\s*years?$/i, '').trim();
}

function applyPreferredAge(user: Partial<AuthUser>, value: string): void {
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }
  const range = trimmed.match(/^(\d+)\s*[–\-to]+\s*(\d+)/i);
  if (range) {
    user.partnerAgeFrom = range[1];
    user.partnerAgeTo = range[2];
    return;
  }
  user.partnerAgeFrom = trimmed.replace(/\s*years?$/i, '').trim();
}

/**
 * Reads `Label : value` lines from the AI prompt.
 * Only values present in the prompt are used — profile defaults are not mixed in.
 */
export function parsePromptDetails(prompt: string): Partial<AuthUser> {
  const result: Partial<AuthUser> = {};

  for (const rawLine of prompt.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.endsWith(':-')) {
      continue;
    }

    const match = line.match(/^(.+?)\s*:\s*(.*)$/);
    if (!match) {
      continue;
    }

    const label = match[1].trim().toLowerCase().replace(/\s+/g, ' ');
    const value = match[2].trim();
    if (label.endsWith('details') || label === 'personality' || label === 'jain values' || label === 'partner expectations') {
      continue;
    }

    if (label === 'preferred age') {
      applyPreferredAge(result, value);
      continue;
    }

    const key = LABEL_TO_KEY[label];
    if (!key) {
      continue;
    }

    if (key === 'age') {
      result.age = normalizeAge(value);
      continue;
    }

    (result as Record<string, string>)[key] = value;

    if (key === 'jainCaste' && value) {
      result.community = value;
    }
  }

  return result;
}

/** Builds a sheet user from the prompt only (empty when a line is blank). */
export function userFromPrompt(prompt: string, photoSrc?: string): AuthUser {
  const parsed = parsePromptDetails(prompt);
  return {
    id: '',
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    countryCode: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
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
    degree: '',
    specialization: '',
    university: '',
    employmentStatus: '',
    companyName: '',
    designation: '',
    workExperience: '',
    workLocation: '',
    exerciseFrequency: '',
    travelFrequency: '',
    languagesKnown: '',
    personality: '',
    futureGoals: '',
    partnerOccupation: '',
    jainSectPreference: '',
    horoscopeMatching: '',
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
    ...parsed,
    profilePhoto: photoSrc?.trim() || '',
  };
}
