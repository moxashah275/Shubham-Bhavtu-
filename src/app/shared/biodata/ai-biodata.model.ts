/** Narrative sections produced by the AI biodata maker (profile-only). */
export type AiBiodataSectionId =
  | 'introduction'
  | 'education'
  | 'career'
  | 'family'
  | 'jainValues'
  | 'personality'
  | 'partner';

export interface AiBiodataSection {
  id: AiBiodataSectionId;
  title: string;
  body: string;
}

export interface AiBiodataResult {
  sections: AiBiodataSection[];
  /** Tone used for this generation (from prompt suggestion chips). */
  tone: string;
}
