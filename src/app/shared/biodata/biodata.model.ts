import type { LucideIcon } from '@lucide/angular';

/** One label/value line inside a biodata sheet. */
export interface BiodataField {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Values like an email or phone number read better on a single line. */
  noWrap?: boolean;
}

export interface BiodataSection {
  id: string;
  title: string;
  fields: BiodataField[];
}

/** Everything a template needs to print, already resolved from the member profile. */
export interface BiodataContent {
  name: string;
  headline: string;
  initials: string;
  photoSrc: string;
  about: string;
  profession: string;
  profileInfo: BiodataField[];
  sections: BiodataSection[];
  contact: BiodataField[];
}

/** Page structure a template uses. Themes then colour the same structure differently. */
export type BiodataLayout =
  | 'panel-left'
  | 'panel-right'
  | 'header-curve'
  | 'light-left'
  /** Traditional framed sheet with the photo and name centred. */
  | 'framed-center'
  /** Traditional framed sheet with the photo beside the name. */
  | 'framed-side';

/** Decorative frame drawn around traditional layouts. */
export type BiodataFrame = 'corner' | 'double' | 'temple' | 'floral';

/** How section titles are printed. */
export type BiodataHeading = 'bar' | 'pill' | 'underline';

export interface BiodataTheme {
  /** Sidebar / band background. */
  panel: string;
  /** Text on the panel. */
  panelText: string;
  /** Muted text on the panel. */
  panelMuted: string;
  /** Section headings, rules and filled bars. */
  accent: string;
  /** Text printed on an accent-filled heading. */
  accentText: string;
  /** Page background. */
  page: string;
  /** Body text. */
  text: string;
}

export interface BiodataTemplate {
  id: string;
  name: string;
  layout: BiodataLayout;
  heading: BiodataHeading;
  serif: boolean;
  /** Only used by the framed layouts. */
  frame?: BiodataFrame;
  theme: BiodataTheme;
}
