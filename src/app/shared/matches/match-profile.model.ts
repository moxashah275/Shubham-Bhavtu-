import { AppImages } from '../../core/assets/app-images';

export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  profession: string;
  imageSrc: string;
}

export interface MemberMatch {
  id: string;
  memberId: string;
  name: string;
  gender: 'Male' | 'Female';
  age: number;
  height: string;
  city: string;
  state: string;
  country: string;
  profession: string;
  manglik: string;
  education: string;
  religion: string;
  community: string;
  subCaste: string;
  motherTongue: string;
  maritalStatus: string;
  diet: string;
  familyType: string;
  income: string;
  profileBy: string;
  imageSrc: string;
  photoCount: number;
  premium: boolean;
  activeToday: boolean;
  about: string;
}

export interface SuccessMatch {
  id: string;
  names: string;
  city: string;
  story: string;
  imageSrc: string;
  religion?: string;
  community?: string;
  matchedOn?: string;
  details?: string;
}

export const FEATURED_MATCHES: MatchProfile[] = [
  {
    id: '1',
    name: 'Aanya Mehta',
    age: 27,
    city: 'Ahmedabad',
    profession: 'Architect',
    imageSrc: AppImages.home.matchAanya,
  },
  {
    id: '2',
    name: 'Kabir Sharma',
    age: 29,
    city: 'Jaipur',
    profession: 'Entrepreneur',
    imageSrc: AppImages.home.matchKabir,
  },
  {
    id: '3',
    name: 'Arjun Malhotra',
    age: 28,
    city: 'Mumbai',
    profession: 'Designer',
    imageSrc: AppImages.home.matchArjun,
  },
  {
    id: '4',
    name: 'Rohan Desai',
    age: 31,
    city: 'Surat',
    profession: 'Doctor',
    imageSrc: AppImages.home.matchRohan,
  },
];

export const SUCCESS_MATCHES: SuccessMatch[] = [
  {
    id: 's1',
    names: 'Aanya & Vihaan',
    city: 'Ahmedabad',
    story: 'Matched through family values, faith, and a shared love for quiet weekends at home.',
    imageSrc: AppImages.matches.ahmedabad,
    religion: 'Hindu',
    community: 'Gujarati',
    matchedOn: 'March 2025',
    details:
      'Aanya and Vihaan met after both families reviewed verified profiles on Gathbandhan. Shared faith, similar education, and a preference for a calm home life made the introduction feel familiar from the first call. Their parents stayed involved through every conversation, and the wedding was planned with both homes, both traditions, and a quiet confidence that this was the right beginning.',
  },
  {
    id: 's2',
    names: 'Kabir & Meera',
    city: 'Jaipur',
    story: 'Two families met on Gathbandhan and found a partnership that felt familiar from the first call.',
    imageSrc: AppImages.matches.jaipur,
    religion: 'Hindu',
    community: 'Rajasthani',
    matchedOn: 'January 2025',
    details:
      'Kabir and Meera were introduced after a careful search by community, city, and family values. The first conversation was with both sets of parents on the call. What followed was a partnership that felt known rather than new — respect for elders, a love for Jaipur, and a shared wish for a wedding that honoured both families equally.',
  },
  {
    id: 's3',
    names: 'Arjun & Diya',
    city: 'Mumbai',
    story: 'A verified introduction led to a wedding planned with both homes, both traditions.',
    imageSrc: AppImages.matches.mumbai,
    religion: 'Hindu',
    community: 'Marathi',
    matchedOn: 'November 2024',
    details:
      'Arjun and Diya connected through a verified introduction in Mumbai. Both families wanted a match that respected career, culture, and the pace of city life without losing warmth. After a few guided conversations, they chose a wedding that brought both homes together — modern in spirit, traditional in blessing.',
  },
  {
    id: 's4',
    names: 'Rohan & Kiara',
    city: 'Surat',
    story: 'They began with a profile, continued with respect, and chose a life together.',
    imageSrc: AppImages.matches.surat,
    religion: 'Hindu',
    community: 'Gujarati',
    matchedOn: 'February 2025',
    details:
      'Rohan and Kiara began with two carefully written profiles and a family-first introduction. They took time, asked the right questions, and let respect lead every step. The match felt complete when both families met in Surat — and they chose a life that holds work, faith, and home with equal care.',
  },
];
