import type { AuthUser } from '../models/auth.model';

/** Only the details we ask for as mandatory — optional extras never hold a profile below 100%. */
export const PROFILE_COMPLETION_FIELDS = [
  'fullName',
  'email',
  'mobile',
  'age',
  'gender',
  'maritalStatus',
  'religion',
  'motherTongue',
  'state',
  'city',
  'education',
  'occupation',
  'about',
] as const;

export type ProfileCompletionField = (typeof PROFILE_COMPLETION_FIELDS)[number];

export interface ProfileCompletion {
  percent: number;
  filled: number;
  total: number;
  hint: string;
  complete: boolean;
}

const HINTS: Partial<Record<ProfileCompletionField, string>> = {
  age: 'A few personal details help families see you clearly and find a match that feels right.',
  gender: 'A few personal details help families see you clearly and find a match that feels right.',
  maritalStatus: 'A few personal details help families see you clearly and find a match that feels right.',
  religion: 'A few personal details help families see you clearly and find a match that feels right.',
  motherTongue: 'Add a little more about yourself so introductions feel personal, not like a crowd.',
  state: 'Share where you live so families can discover a genuine match closer to home.',
  city: 'Share where you live so families can discover a genuine match closer to home.',
  education: 'Education and work help families understand the life you hope to build together.',
  occupation: 'Education and work help families understand the life you hope to build together.',
  about: 'A few lines about you complete your story, so the right family can find you.',
};

export function getProfileCompletion(user: AuthUser | null): ProfileCompletion {
  const total = PROFILE_COMPLETION_FIELDS.length;
  if (!user) {
    return {
      percent: 0,
      filled: 0,
      total,
      hint: 'A complete profile helps families find a genuine match with someone who feels like home.',
      complete: false,
    };
  }

  const filled = PROFILE_COMPLETION_FIELDS.filter((field) => Boolean(user[field]?.toString().trim())).length;
  const percent = Math.round((filled / total) * 100);
  const missing = PROFILE_COMPLETION_FIELDS.find((field) => !user[field]?.toString().trim());

  return {
    percent,
    filled,
    total,
    hint:
      percent >= 100
        ? 'Your profile is complete. Families can now see your full story.'
        : (missing && HINTS[missing]) ||
          'A complete profile helps families find a genuine match with someone who feels like home.',
    complete: percent >= 100 || Boolean(user.profileSaved && filled === total),
  };
}
