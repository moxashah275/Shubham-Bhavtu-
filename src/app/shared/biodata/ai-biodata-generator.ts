import type { AuthUser } from '../../core/models/auth.model';
import type { AiBiodataResult, AiBiodataSection } from './ai-biodata.model';

function t(value: string | undefined | null): string {
  return value?.toString().trim() || '';
}

function joinNatural(parts: string[]): string {
  const clean = parts.map((part) => part.trim()).filter(Boolean);
  if (clean.length === 0) {
    return '';
  }
  if (clean.length === 1) {
    return clean[0];
  }
  if (clean.length === 2) {
    return `${clean[0]} and ${clean[1]}`;
  }
  return `${clean.slice(0, -1).join(', ')}, and ${clean[clean.length - 1]}`;
}

function toneHint(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('traditional')) {
    return 'traditional';
  }
  if (lower.includes('elegant')) {
    return 'elegant';
  }
  if (lower.includes('family')) {
    return 'family-focused';
  }
  if (lower.includes('career')) {
    return 'career-focused';
  }
  if (lower.includes('short') || lower.includes('simple')) {
    return 'short';
  }
  return 'balanced';
}

function opening(tone: string, name: string): string {
  switch (tone) {
    case 'traditional':
      return `With warm regards, we introduce ${name}`;
    case 'elegant':
      return `${name} is presented with quiet grace`;
    case 'family-focused':
      return `${name} comes from a family that values togetherness`;
    case 'career-focused':
      return `${name} brings purpose and steadiness to work and life`;
    case 'short':
      return `${name}`;
    default:
      return `We are pleased to introduce ${name}`;
  }
}

/**
 * Builds biodata narrative sections using only fields present on the profile.
 * Missing facts are omitted — nothing is invented.
 */
export function generateAiBiodataFromProfile(user: AuthUser | null, prompt: string): AiBiodataResult {
  const tone = toneHint(prompt);
  /** Sheet about text stays short; profile fields already show the rest. */
  const short = true;
  const sections: AiBiodataSection[] = [];

  const name = t(user?.fullName) || 'the member';
  const age = t(user?.age);
  const ageLabel = age && age !== 'below-18' ? `${age} years` : '';
  const height = t(user?.height);
  const gender = t(user?.gender);
  const marital = t(user?.maritalStatus);
  const city = t(user?.city);
  const state = t(user?.state);
  const location = joinNatural([city, state]);
  const religion = t(user?.religion);
  const community = t(user?.community) || t(user?.jainCaste);
  const sect = t(user?.jainSect);
  const subCaste = t(user?.subCaste);
  const gotra = t(user?.gotra);
  const diet = t(user?.diet);
  const manglik = t(user?.manglik);
  const education = t(user?.education) || t(user?.educationSpec) || t(user?.degree);
  const specialization = t(user?.specialization);
  const university = t(user?.university);
  const occupation = t(user?.occupation);
  const company = t(user?.companyName);
  const designation = t(user?.designation);
  const employment = t(user?.employmentStatus);
  const income = t(user?.income);
  const workExp = t(user?.workExperience);
  const familyType = t(user?.familyType);
  const father = t(user?.fatherName);
  const mother = t(user?.motherName);
  const fatherOcc = t(user?.fatherOccupation);
  const motherOcc = t(user?.motherOccupation);
  const brothers = t(user?.brothers);
  const sisters = t(user?.sisters);
  const about = t(user?.about);
  const personality = t(user?.personality);
  const hobbies = t(user?.hobbies);
  const languages = t(user?.languagesKnown);
  const futureGoals = t(user?.futureGoals);
  const partnerAge =
    t(user?.partnerAgeFrom) && t(user?.partnerAgeTo)
      ? `${t(user?.partnerAgeFrom)}–${t(user?.partnerAgeTo)} years`
      : t(user?.partnerAgeFrom) || t(user?.partnerAgeTo);
  const partnerEducation = t(user?.partnerEducation);
  const partnerOccupation = t(user?.partnerOccupation);
  const partnerLocation = joinNatural([t(user?.partnerCity), t(user?.partnerState)]);
  const partnerDiet = t(user?.partnerDiet);
  const partnerMarital = t(user?.partnerMaritalStatus);

  // Personal Introduction
  {
    const facts: string[] = [];
    if (ageLabel) {
      facts.push(ageLabel);
    }
    if (height) {
      facts.push(height);
    }
    if (gender) {
      facts.push(gender);
    }
    if (marital) {
      facts.push(marital);
    }
    if (location) {
      facts.push(`based in ${location}`);
    }

    let body = '';
    if (short) {
      body = [opening(tone, name), facts.length ? facts.join(', ') : ''].filter(Boolean).join(' — ');
      if (about) {
        body = `${body}. ${about}`;
      } else if (body) {
        body = `${body}.`;
      }
    } else {
      const lead = opening(tone, name);
      const detail = facts.length ? `, ${facts.join(', ')}` : '';
      body = `${lead}${detail}.`;
      if (about) {
        body = `${body} ${about}`;
      }
      if (occupation && location && !short) {
        body = `${body} ${occupation}${location ? ` in ${location}` : ''} forms a steady part of everyday life.`;
      }
    }

    if (body.trim()) {
      sections.push({ id: 'introduction', title: 'Personal Introduction', body: body.trim() });
    }
  }

  // Education
  {
    const parts: string[] = [];
    if (education) {
      parts.push(education);
    }
    if (specialization) {
      parts.push(`with a focus on ${specialization}`);
    }
    if (university) {
      parts.push(`from ${university}`);
    }
    if (parts.length) {
      const body = short
        ? `Education: ${joinNatural(parts)}.`
        : `${name === 'the member' ? 'Educational background' : `${name}'s education`} includes ${joinNatural(parts)}.`;
      sections.push({ id: 'education', title: 'Education', body });
    }
  }

  // Career
  {
    const parts: string[] = [];
    if (occupation) {
      parts.push(occupation);
    }
    if (designation) {
      parts.push(designation);
    }
    if (company) {
      parts.push(`at ${company}`);
    }
    if (employment) {
      parts.push(`(${employment})`);
    }
    if (workExp) {
      parts.push(`${workExp} of experience`);
    }
    if (income) {
      parts.push(`income range ${income}`);
    }
    if (parts.length) {
      const body = short
        ? `Career: ${joinNatural(parts)}.`
        : `Professionally, ${joinNatural(parts)}.`;
      sections.push({ id: 'career', title: 'Career', body });
    }
  }

  // Family Background
  {
    const parts: string[] = [];
    if (familyType) {
      parts.push(`a ${familyType.toLowerCase()} family`);
    }
    if (father) {
      parts.push(fatherOcc ? `Father: ${father} (${fatherOcc})` : `Father: ${father}`);
    }
    if (mother) {
      parts.push(motherOcc ? `Mother: ${mother} (${motherOcc})` : `Mother: ${mother}`);
    }
    if (brothers) {
      parts.push(`Brothers: ${brothers}`);
    }
    if (sisters) {
      parts.push(`Sisters: ${sisters}`);
    }
    if (location && !parts.some((p) => p.includes(location))) {
      parts.push(`residing in ${location}`);
    }
    if (parts.length) {
      const body = short
        ? `Family: ${parts.join('; ')}.`
        : `Family background includes ${parts.join('; ')}.`;
      sections.push({ id: 'family', title: 'Family Background', body });
    }
  }

  // Jain Values
  {
    const parts: string[] = [];
    if (religion) {
      parts.push(religion);
    }
    if (sect) {
      parts.push(sect);
    }
    if (community) {
      parts.push(community);
    }
    if (subCaste) {
      parts.push(subCaste);
    }
    if (gotra) {
      parts.push(`Gotra ${gotra}`);
    }
    if (diet) {
      parts.push(`${diet} diet`);
    }
    if (manglik) {
      parts.push(`Manglik / Shani: ${manglik}`);
    }
    if (parts.length) {
      const body = short
        ? `Jain values: ${joinNatural(parts)}.`
        : `Grounded in Jain values — ${joinNatural(parts)} — with respect for tradition and family.`;
      sections.push({ id: 'jainValues', title: 'Jain Values', body });
    }
  }

  // Personality
  {
    const parts: string[] = [];
    if (personality) {
      parts.push(personality);
    }
    if (hobbies) {
      parts.push(`Hobbies include ${hobbies}`);
    }
    if (languages) {
      parts.push(`Languages: ${languages}`);
    }
    if (futureGoals) {
      parts.push(`Future goals: ${futureGoals}`);
    }
    if (parts.length) {
      const body = short ? parts.join('. ') + '.' : parts.join('. ') + '.';
      sections.push({ id: 'personality', title: 'Personality', body });
    }
  }

  // Partner Expectations
  {
    const parts: string[] = [];
    if (partnerAge) {
      parts.push(`preferred age ${partnerAge}`);
    }
    if (partnerMarital) {
      parts.push(`marital status ${partnerMarital}`);
    }
    if (partnerEducation) {
      parts.push(`education ${partnerEducation}`);
    }
    if (partnerOccupation) {
      parts.push(`occupation ${partnerOccupation}`);
    }
    if (partnerLocation) {
      parts.push(`location ${partnerLocation}`);
    }
    if (partnerDiet) {
      parts.push(`diet ${partnerDiet}`);
    }
    if (parts.length) {
      const body = short
        ? `Partner expectations: ${joinNatural(parts)}.`
        : `Partner expectations are shared with care — seeking ${joinNatural(parts)}.`;
      sections.push({ id: 'partner', title: 'Partner Expectations', body });
    }
  }

  return { sections, tone };
}

/** Builds a short About line for the printed biodata sheet (not a long essay). */
export function aiSectionsToAbout(sections: AiBiodataSection[]): string {
  const intro = sections.find((section) => section.id === 'introduction')?.body.trim() ?? '';
  if (intro) {
    return intro.length > 280 ? `${intro.slice(0, 277).trim()}…` : intro;
  }
  return sections
    .map((section) => section.body.trim())
    .filter(Boolean)
    .slice(0, 1)
    .join('');
}
