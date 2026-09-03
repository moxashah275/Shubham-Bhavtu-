import type { SearchSelectOption } from '../../shared/search/search-select.component';

export const LOOKING_FOR_OPTIONS: SearchSelectOption[] = [
  { value: 'bride', label: 'Bride' },
  { value: 'groom', label: 'Groom' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
];

export const RELIGION_OPTIONS: SearchSelectOption[] = [
  { value: 'Jain', label: 'Jain' },
  { value: 'Gujarati', label: 'Gujarati' },
];

export const SUB_CASTE_OPTIONS: SearchSelectOption[] = [
  { value: 'Shwetamber Deravasi', label: 'Shwetamber Deravasi' },
  { value: 'Shwetamber Sthanakvasi', label: 'Shwetamber Sthanakvasi' },
  { value: 'Shwetamber Murtipujak', label: 'Shwetamber Murtipujak' },
  { value: 'Shwetamber Terapanthi', label: 'Shwetamber Terapanthi' },
  { value: 'Digambar', label: 'Digambar' },
  { value: 'Digambar Bispanthi', label: 'Digambar Bispanthi' },
  { value: 'Digambar Terapanthi', label: 'Digambar Terapanthi' },
  { value: 'Visa Oswal', label: 'Visa Oswal' },
  { value: 'Dasa Oswal', label: 'Dasa Oswal' },
  { value: 'Visa Shrimali', label: 'Visa Shrimali' },
  { value: 'Dasa Shrimali', label: 'Dasa Shrimali' },
  { value: 'Porwad', label: 'Porwad' },
  { value: 'Kutchi Jain', label: 'Kutchi Jain' },
  { value: 'Other Jain', label: 'Other Jain' },
];

export const INCOME_OPTIONS: SearchSelectOption[] = [
  { value: 'Prefer not to say', label: 'Prefer not to say' },
  { value: 'Below 1 lakh', label: 'Below 1 lakh' },
  { value: '1 - 3 lakh', label: '1 - 3 lakh' },
  { value: '3 - 5 lakh', label: '3 - 5 lakh' },
  { value: '5 - 10 lakh', label: '5 - 10 lakh' },
  { value: '10 - 15 lakh', label: '10 - 15 lakh' },
  { value: '15 - 25 lakh', label: '15 - 25 lakh' },
  { value: '25 - 50 lakh', label: '25 - 50 lakh' },
  { value: 'Above 50 lakh', label: 'Above 50 lakh' },
];

export const MARITAL_OPTIONS: SearchSelectOption[] = [
  { value: 'Never Married', label: 'Never Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
  { value: 'Separated', label: 'Separated' },
  { value: 'Awaiting Divorce', label: 'Awaiting Divorce' },
];

export const AGE_OPTIONS: SearchSelectOption[] = Array.from({ length: 43 }, (_, index) => {
  const year = String(18 + index);
  return { value: year, label: year };
});

export const HEIGHT_OPTIONS: SearchSelectOption[] = [
  { value: "4'10\"", label: "4'10\"" },
  { value: "4'11\"", label: "4'11\"" },
  { value: "5'0\"", label: "5'0\"" },
  { value: "5'1\"", label: "5'1\"" },
  { value: "5'2\"", label: "5'2\"" },
  { value: "5'3\"", label: "5'3\"" },
  { value: "5'4\"", label: "5'4\"" },
  { value: "5'5\"", label: "5'5\"" },
  { value: "5'6\"", label: "5'6\"" },
  { value: "5'7\"", label: "5'7\"" },
  { value: "5'8\"", label: "5'8\"" },
  { value: "5'9\"", label: "5'9\"" },
  { value: "5'10\"", label: "5'10\"" },
  { value: "5'11\"", label: "5'11\"" },
  { value: "6'0\"", label: "6'0\"" },
  { value: "6'1\"", label: "6'1\"" },
  { value: "6'2\"", label: "6'2\"" },
];

export const DIET_OPTIONS: SearchSelectOption[] = [
  { value: 'Vegetarian', label: 'Vegetarian' },
  { value: 'Vegan', label: 'Vegan' },
  { value: 'Strict Jain', label: 'Strict Jain' },
  { value: 'Flexible', label: 'Flexible' },
];

export const MANGLIK_OPTIONS: SearchSelectOption[] = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: "I don't know", label: "I don't know" },
];

export const COUNTRY_OPTIONS: SearchSelectOption[] = [
  { value: 'India', label: 'India' },
  { value: 'USA', label: 'USA' },
  { value: 'UK', label: 'UK' },
  { value: 'Canada', label: 'Canada' },
  { value: 'UAE', label: 'UAE' },
];

export const EDUCATION_OPTIONS: SearchSelectOption[] = [
  { value: "Bachelor's", label: "Bachelor's" },
  { value: "Master's", label: "Master's" },
  { value: 'Doctorate', label: 'Doctorate' },
  { value: 'Diploma', label: 'Diploma' },
  { value: 'High School', label: 'High School' },
  { value: 'Other', label: 'Other' },
];

export function lookingForLabel(value: string): string {
  return LOOKING_FOR_OPTIONS.find((option) => option.value === value)?.label ?? '';
}

/** Human label for the profile gender shown (e.g. Son → Girls). */
export function profilesTypeForLookingFor(lookingFor: string): 'Girls' | 'Boys' | '' {
  const gender = genderForLookingFor(lookingFor);
  if (gender === 'Female') {
    return 'Girls';
  }
  if (gender === 'Male') {
    return 'Boys';
  }
  return '';
}

/** Partner gender to show for a Looking For choice (match for son/brother = girls, etc.). */
export function genderForLookingFor(lookingFor: string): 'Male' | 'Female' | '' {
  switch (lookingFor) {
    case 'bride':
    case 'son':
    case 'brother':
      return 'Female';
    case 'groom':
    case 'daughter':
    case 'sister':
      return 'Male';
    default:
      return '';
  }
}
