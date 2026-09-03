import type { SearchSelectOption } from '../../shared/search/search-select.component';
import type { MemberMatch } from '../../shared/matches/match-profile.model';
import { genderForLookingFor, lookingForLabel, profilesTypeForLookingFor } from './partner-search-options';

export interface MatchQuery {
  lookingFor: string;
  ageFrom: string;
  ageTo: string;
  religion: string;
  maritalStatus: string;
  height: string;
  diet: string;
  occupation: string;
  country: string;
  state: string;
  city: string;
  manglik: string;
  subCaste: string;
  income: string;
  education: string;
  motherTongue: string;
}

export const EMPTY_MATCH_QUERY: MatchQuery = {
  lookingFor: '',
  ageFrom: '',
  ageTo: '',
  religion: '',
  maritalStatus: '',
  height: '',
  diet: '',
  occupation: '',
  country: '',
  state: '',
  city: '',
  manglik: '',
  subCaste: '',
  income: '',
  education: '',
  motherTongue: '',
};

export const MATCH_QUERY_KEYS = Object.keys(EMPTY_MATCH_QUERY) as (keyof MatchQuery)[];

export function parseMatchQuery(params: { get(name: string): string | null }): MatchQuery {
  const age = params.get('age') ?? '';
  return {
    lookingFor: params.get('lookingFor') ?? '',
    ageFrom: params.get('ageFrom') ?? age,
    ageTo: params.get('ageTo') ?? age,
    religion: params.get('religion') ?? '',
    maritalStatus: params.get('maritalStatus') ?? '',
    height: params.get('height') ?? '',
    diet: params.get('diet') ?? '',
    occupation: params.get('occupation') ?? '',
    country: params.get('country') ?? '',
    state: params.get('state') ?? '',
    city: params.get('city') ?? '',
    manglik: params.get('manglik') ?? '',
    subCaste: params.get('subCaste') ?? '',
    income: params.get('income') ?? '',
    education: params.get('education') ?? '',
    motherTongue: params.get('motherTongue') ?? '',
  };
}

/** Primary search picks one age — expand to a gentle window so families still see matches. */
export function preferredAgeWindow(age: string, spread = 3): { ageFrom: string; ageTo: string } {
  const value = Number(age);
  if (!Number.isFinite(value) || value <= 0) {
    return { ageFrom: '', ageTo: '' };
  }
  return {
    ageFrom: String(Math.max(18, value - spread)),
    ageTo: String(Math.min(60, value + spread)),
  };
}

export function matchQueryParams(query: Partial<MatchQuery> & { age?: string }): Record<string, string | undefined> {
  let ageFrom = query.ageFrom || '';
  let ageTo = query.ageTo || '';
  if (query.age && !query.ageFrom && !query.ageTo) {
    const window = preferredAgeWindow(query.age);
    ageFrom = window.ageFrom;
    ageTo = window.ageTo;
  } else if (!ageFrom && !ageTo && query.age) {
    const window = preferredAgeWindow(query.age);
    ageFrom = window.ageFrom;
    ageTo = window.ageTo;
  } else if (ageFrom && !ageTo) {
    ageTo = ageFrom;
  } else if (ageTo && !ageFrom) {
    ageFrom = ageTo;
  }
  return {
    lookingFor: query.lookingFor || undefined,
    age: undefined,
    ageFrom: ageFrom || undefined,
    ageTo: ageTo || undefined,
    religion: query.religion || undefined,
    maritalStatus: query.maritalStatus || undefined,
    height: query.height || undefined,
    diet: query.diet || undefined,
    occupation: query.occupation || undefined,
    country: query.country || undefined,
    state: query.state || undefined,
    city: query.city || undefined,
    manglik: query.manglik || undefined,
    subCaste: query.subCaste || undefined,
    income: query.income || undefined,
    education: query.education || undefined,
    motherTongue: query.motherTongue || undefined,
  };
}

export function hasMatchSearch(query: MatchQuery): boolean {
  return Boolean(query.lookingFor);
}

export function hasActiveFilters(query: MatchQuery): boolean {
  return MATCH_QUERY_KEYS.some((key) => Boolean(query[key]));
}

export function isPrimarySearchComplete(query: {
  lookingFor?: string;
  age?: string;
  ageFrom?: string;
  religion?: string;
  maritalStatus?: string;
}): boolean {
  return Boolean(query.lookingFor && (query.age || query.ageFrom) && query.religion && query.maritalStatus);
}

export function filterMembers(members: MemberMatch[], query: MatchQuery): MemberMatch[] {
  const gender = genderForLookingFor(query.lookingFor);
  if (query.lookingFor && !gender) {
    return [];
  }
  const from = Number(query.ageFrom) || 0;
  const to = Number(query.ageTo) || 99;

  return members.filter((member) => {
    if (gender && member.gender !== gender) {
      return false;
    }
    if (from && member.age < from) {
      return false;
    }
    if (query.ageTo && member.age > to) {
      return false;
    }
    if (query.religion && member.religion !== query.religion) {
      return false;
    }
    if (query.maritalStatus && member.maritalStatus !== query.maritalStatus) {
      return false;
    }
    if (query.height && member.height !== query.height) {
      return false;
    }
    if (query.diet && member.diet !== query.diet) {
      return false;
    }
    if (query.occupation && member.profession !== query.occupation) {
      return false;
    }
    if (query.country && member.country !== query.country) {
      return false;
    }
    if (query.state && member.state !== query.state) {
      return false;
    }
    if (query.city && member.city !== query.city) {
      return false;
    }
    if (query.manglik && member.manglik !== query.manglik) {
      return false;
    }
    if (query.subCaste && member.subCaste !== query.subCaste) {
      return false;
    }
    if (query.income && member.income !== query.income) {
      return false;
    }
    if (query.education && member.education !== query.education) {
      return false;
    }
    if (query.motherTongue && member.motherTongue !== query.motherTongue) {
      return false;
    }
    return true;
  });
}

export function uniqueOptions(values: string[]): SearchSelectOption[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b)).map((value) => ({
    value,
    label: value,
  }));
}

export interface MatchSummaryItem {
  label: string;
  value: string;
}

export function matchSummaryItems(query: MatchQuery): MatchSummaryItem[] {
  const items: MatchSummaryItem[] = [];
  if (query.lookingFor) {
    const profilesType = profilesTypeForLookingFor(query.lookingFor);
    items.push({ label: 'Looking for', value: lookingForLabel(query.lookingFor) || query.lookingFor });
    if (profilesType) {
      items.push({ label: 'Profiles', value: profilesType });
    }
  }
  if (query.ageFrom || query.ageTo) {
    const from = query.ageFrom;
    const to = query.ageTo;
    items.push({
      label: 'Age',
      value: from && to && from !== to ? `${from} – ${to}` : from || to,
    });
  }
  if (query.religion) {
    items.push({ label: 'Religion', value: query.religion });
  }
  if (query.maritalStatus) {
    items.push({ label: 'Married status', value: query.maritalStatus });
  }
  if (query.height) {
    items.push({ label: 'Height', value: query.height });
  }
  if (query.diet) {
    items.push({ label: 'Diet', value: query.diet });
  }
  if (query.occupation) {
    items.push({ label: 'Occupation', value: query.occupation });
  }
  if (query.education) {
    items.push({ label: 'Education', value: query.education });
  }
  if (query.subCaste) {
    items.push({ label: 'Sub caste', value: query.subCaste });
  }
  if (query.income) {
    items.push({ label: 'Annual income', value: query.income });
  }
  if (query.motherTongue) {
    items.push({ label: 'Mother tongue', value: query.motherTongue });
  }
  if (query.manglik) {
    items.push({ label: 'Manglik', value: query.manglik });
  }
  const location = [query.city, query.state, query.country].filter(Boolean).join(', ');
  if (location) {
    items.push({ label: 'Location', value: location });
  }
  return items;
}

export function filledFilterCount(query: MatchQuery): number {
  let count = 0;
  if (query.lookingFor) count += 1;
  if (query.height) count += 1;
  if (query.diet) count += 1;
  if (query.state || query.city || query.country) count += 1;
  if (query.ageFrom || query.ageTo) count += 1;
  if (query.religion) count += 1;
  if (query.maritalStatus) count += 1;
  if (query.subCaste) count += 1;
  if (query.income) count += 1;
  if (query.motherTongue) count += 1;
  if (query.education) count += 1;
  if (query.manglik) count += 1;
  return count;
}
