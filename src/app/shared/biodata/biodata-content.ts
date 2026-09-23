import {
  LucideBriefcase,
  LucideBuilding2,
  LucideCake,
  LucideCalendar,
  LucideGlobe,
  LucideGraduationCap,
  LucideHeart,
  LucideHome,
  LucideMail,
  LucideMapPin,
  LucideMoveVertical,
  LucidePhone,
  LucideRuler,
  LucideSparkles,
  LucideStar,
  LucideUser,
  LucideUsers,
  LucideUtensils,
  LucideWallet,
} from '@lucide/angular';
import type { AuthUser } from '../../core/models/auth.model';
import { DEFAULT_COUNTRY_CODE } from '../../core/data/country-codes';
import type { BiodataContent, BiodataField, BiodataSection } from './biodata.model';

const PLACEHOLDER = '—';

function text(value: string | undefined | null): string {
  return value?.toString().trim() || PLACEHOLDER;
}

function ageText(age: string | undefined): string {
  const value = age?.trim() ?? '';
  if (!value) {
    return PLACEHOLDER;
  }
  return value === 'below-18' ? 'Below 18' : `${value} years`;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? 'G';
  const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? '';
  return `${first}${second}`.toUpperCase();
}

function line(
  label: string,
  value: string | undefined | null,
  icon: BiodataField['icon'],
  extra?: Partial<BiodataField>,
): BiodataField {
  return { label, value: text(value), icon, ...extra };
}

/** Maps the saved profile onto the fields a marriage biodata usually prints. */
export function buildBiodataContent(
  user: AuthUser | null,
  options?: { aboutOverride?: string; photoSrc?: string },
): BiodataContent {
  const name = user?.fullName?.trim() || 'Your Name';
  const location = [user?.city, user?.state].filter(Boolean).join(', ');
  const education = user?.education || user?.educationSpec || user?.degree;
  const nativePlace = user?.nativePlace || user?.city || user?.state;

  const profileInfo: BiodataField[] = [
    line('Gender', user?.gender, LucideUser),
    line('Marital status', user?.maritalStatus, LucideHeart),
    { label: 'Age', value: ageText(user?.age), icon: LucideCake },
    line('Date of birth', user?.dateOfBirth, LucideCalendar),
    line('Height', user?.height, LucideRuler),
    line('Manglik / Shani', user?.manglik, LucideStar),
    line('Religion', user?.religion, LucideSparkles),
    line('Jain sect', user?.jainSect, LucideSparkles),
    line('Community', user?.community || user?.jainCaste, LucideUsers),
    line('Sub caste', user?.subCaste, LucideUsers),
    line('Gotra', user?.gotra, LucideUsers),
    line('Mother tongue', user?.motherTongue || user?.languagesKnown, LucideGlobe),
    line('Diet', user?.diet, LucideUtensils),
    line('Native place', nativePlace, LucideMapPin),
    line('Hobbies', user?.hobbies, LucideMoveVertical),
  ];

  const contact: BiodataField[] = [
    {
      label: 'Mobile',
      value: user?.mobile?.trim() ? `${user.countryCode || DEFAULT_COUNTRY_CODE} ${user.mobile}` : PLACEHOLDER,
      icon: LucidePhone,
      noWrap: true,
    },
    { label: 'Email', value: text(user?.email), icon: LucideMail, noWrap: true },
    { label: 'Address', value: location || PLACEHOLDER, icon: LucideHome },
  ];

  const sections: BiodataSection[] = [
    {
      id: 'career',
      title: 'Education / Professional details',
      fields: [
        line('Education', education, LucideGraduationCap),
        line('Specialization', user?.specialization, LucideGraduationCap),
        line('University', user?.university, LucideBuilding2),
        line('Occupation', user?.occupation, LucideBriefcase),
        line('Designation', user?.designation, LucideBriefcase),
        line('Company', user?.companyName, LucideBuilding2),
        line('Employment status', user?.employmentStatus, LucideBriefcase),
        line('Work experience', user?.workExperience, LucideBriefcase),
        line('Annual income', user?.income, LucideWallet),
      ],
    },
    {
      id: 'family',
      title: 'Family details',
      fields: [
        line('Family type', user?.familyType, LucideUsers),
        line('Father name', user?.fatherName, LucideUser),
        line('Father occupation', user?.fatherOccupation, LucideBriefcase),
        line('Mother name', user?.motherName, LucideUser),
        line('Mother occupation', user?.motherOccupation, LucideBriefcase),
        line('Brothers', user?.brothers, LucideUsers),
        line('Sisters', user?.sisters, LucideUsers),
        line('Native place', nativePlace, LucideMapPin),
        line('Lives in', location || PLACEHOLDER, LucideHome),
      ],
    },
  ];

  const partnerBits = [
    user?.partnerAgeFrom && user?.partnerAgeTo
      ? `${user.partnerAgeFrom}–${user.partnerAgeTo}`
      : user?.partnerAgeFrom || user?.partnerAgeTo || '',
    user?.partnerEducation,
    user?.partnerOccupation,
    [user?.partnerCity, user?.partnerState].filter(Boolean).join(', '),
    user?.partnerDiet,
  ].filter((part) => part && String(part).trim());

  if (partnerBits.length) {
    sections.push({
      id: 'partner',
      title: 'Partner expectations',
      fields: [
        line(
          'Preferred age',
          user?.partnerAgeFrom && user?.partnerAgeTo
            ? `${user.partnerAgeFrom}–${user.partnerAgeTo}`
            : user?.partnerAgeFrom || user?.partnerAgeTo,
          LucideCake,
        ),
        line('Preferred education', user?.partnerEducation, LucideGraduationCap),
        line('Preferred occupation', user?.partnerOccupation, LucideBriefcase),
        line('Preferred city', user?.partnerCity, LucideMapPin),
        line('Preferred state', user?.partnerState, LucideMapPin),
        line('Preferred diet', user?.partnerDiet, LucideUtensils),
      ],
    });
  }

  const aboutOverride = options?.aboutOverride?.trim();
  const photoSrc = options?.photoSrc?.trim() || user?.profilePhoto?.trim() || '';

  return {
    name,
    headline: [user?.occupation?.trim(), location].filter(Boolean).join(' · ') || 'Marriage biodata',
    initials: initialsOf(name),
    photoSrc,
    profession: text(user?.occupation),
    about:
      aboutOverride ||
      user?.about?.trim() ||
      'Add a few lines about yourself in your profile — they will appear here automatically.',
    profileInfo,
    sections,
    contact,
  };
}
