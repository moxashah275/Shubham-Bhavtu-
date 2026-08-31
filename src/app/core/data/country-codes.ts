export interface CountryCodeOption {
  code: string;
  label: string;
}

export const COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+91', label: '+91' },
  { code: '+1', label: '+1' },
  { code: '+44', label: '+44' },
  { code: '+971', label: '+971' },
  { code: '+966', label: '+966' },
  { code: '+974', label: '+974' },
  { code: '+61', label: '+61' },
  { code: '+65', label: '+65' },
  { code: '+60', label: '+60' },
  { code: '+92', label: '+92' },
  { code: '+880', label: '+880' },
  { code: '+94', label: '+94' },
  { code: '+977', label: '+977' },
  { code: '+81', label: '+81' },
  { code: '+86', label: '+86' },
  { code: '+49', label: '+49' },
  { code: '+33', label: '+33' },
  { code: '+7', label: '+7' },
];

export const DEFAULT_COUNTRY_CODE = '+91';
