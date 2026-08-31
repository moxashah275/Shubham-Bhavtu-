import {
  LucideBriefcase,
  LucideCake,
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
import type { BiodataContent, BiodataField } from './biodata.model';

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

/** Maps the saved profile onto the fields a marriage biodata usually prints. */
export function buildBiodataContent(user: AuthUser | null): BiodataContent {
  const name = user?.fullName?.trim() || 'Your Name';
  const location = [user?.city, user?.state].filter(Boolean).join(', ');

  const profileInfo: BiodataField[] = [
    { label: 'Gender', value: text(user?.gender), icon: LucideUser },
    { label: 'Marital status', value: text(user?.maritalStatus), icon: LucideHeart },
    { label: 'Age', value: ageText(user?.age), icon: LucideCake },
    { label: 'Height', value: text(user?.height), icon: LucideRuler },
    { label: 'Manglik / Shani', value: text(user?.manglik), icon: LucideStar },
    { label: 'Religion', value: text(user?.religion), icon: LucideSparkles },
    { label: 'Community', value: text(user?.community), icon: LucideUsers },
    { label: 'Sub caste', value: text(user?.subCaste), icon: LucideUsers },
    { label: 'Mother tongue', value: text(user?.motherTongue), icon: LucideGlobe },
    { label: 'Diet', value: text(user?.diet), icon: LucideUtensils },
    { label: 'Native place', value: text(user?.state), icon: LucideMapPin },
    { label: 'Hobbies', value: text(user?.hobbies), icon: LucideMoveVertical },
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

  return {
    name,
    headline: [user?.occupation?.trim(), location].filter(Boolean).join(' · ') || 'Marriage biodata',
    initials: initialsOf(name),
    photoSrc: '',
    profession: text(user?.occupation),
    about:
      user?.about?.trim() ||
      'Add a few lines about yourself in your profile — they will appear here automatically.',
    profileInfo,
    sections: [
      {
        id: 'career',
        title: 'Education / Professional details',
        fields: [
          { label: 'Education', value: text(user?.education), icon: LucideGraduationCap },
          { label: 'Occupation', value: text(user?.occupation), icon: LucideBriefcase },
          { label: 'Annual income', value: text(user?.income), icon: LucideWallet },
        ],
      },
      {
        id: 'family',
        title: 'Family details',
        fields: [
          { label: 'Family type', value: text(user?.familyType), icon: LucideUsers },
          { label: 'Native place', value: text(user?.state), icon: LucideMapPin },
          { label: 'Lives in', value: location || PLACEHOLDER, icon: LucideHome },
        ],
      },
    ],
    contact,
  };
}
