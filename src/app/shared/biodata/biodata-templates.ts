import type { BiodataTemplate } from './biodata.model';

/**
 * Ten marriage biodata designs in the styles families actually use: traditional
 * framed sheets (gold corner, temple border, maroon vintage, floral) and modern
 * coloured-panel sheets. `layout` sets the structure, `frame` the border art,
 * `heading` the section titles and `theme` the colours — a new design is one
 * more entry here, never new markup.
 */
export const BIODATA_TEMPLATES: BiodataTemplate[] = [
  {
    id: 'golden-corner',
    name: 'Classic Golden Corner',
    layout: 'framed-center',
    heading: 'underline',
    serif: true,
    frame: 'corner',
    theme: {
      panel: '#faf3e0',
      panelText: '#5a4413',
      panelMuted: '#8a6d24',
      accent: '#a9852a',
      accentText: '#ffffff',
      page: '#fffdf6',
      text: '#3d3323',
    },
  },
  {
    id: 'temple-orange',
    name: 'Traditional Temple Border',
    layout: 'framed-center',
    heading: 'bar',
    serif: true,
    frame: 'temple',
    theme: {
      panel: '#fdeacd',
      panelText: '#7a3c07',
      panelMuted: '#a85b12',
      accent: '#d9741a',
      accentText: '#ffffff',
      page: '#fffaf2',
      text: '#40291a',
    },
  },
  {
    id: 'maroon-vintage',
    name: 'Royal Maroon Vintage',
    layout: 'framed-side',
    heading: 'bar',
    serif: true,
    frame: 'double',
    theme: {
      panel: '#f6e5ea',
      panelText: '#5d1226',
      panelMuted: '#8c2340',
      accent: '#7a1630',
      accentText: '#ffffff',
      page: '#fffaf9',
      text: '#33202a',
    },
  },
  {
    id: 'floral-white',
    name: 'Elegant Floral White',
    layout: 'framed-side',
    heading: 'underline',
    serif: true,
    frame: 'floral',
    theme: {
      panel: '#f3f7ef',
      panelText: '#33502f',
      panelMuted: '#4f7048',
      accent: '#5d8a54',
      accentText: '#ffffff',
      page: '#ffffff',
      text: '#2f3a2d',
    },
  },
  {
    id: 'rose-floral',
    name: 'Rose Floral',
    layout: 'framed-center',
    heading: 'pill',
    serif: true,
    frame: 'floral',
    theme: {
      panel: '#fdeaf1',
      panelText: '#7d1f47',
      panelMuted: '#a83a67',
      accent: '#c74a7b',
      accentText: '#ffffff',
      page: '#fffafc',
      text: '#3b2530',
    },
  },
  {
    id: 'lavender-elegance',
    name: 'Lavender Elegance',
    layout: 'framed-side',
    heading: 'pill',
    serif: false,
    frame: 'corner',
    theme: {
      panel: '#efe9fb',
      panelText: '#3f2a6b',
      panelMuted: '#5b3f96',
      accent: '#6b4bb8',
      accentText: '#ffffff',
      page: '#fdfcff',
      text: '#2f2740',
    },
  },
  {
    id: 'navy-panel',
    name: 'Navy Panel',
    layout: 'panel-left',
    heading: 'pill',
    serif: false,
    theme: {
      panel: '#123b73',
      panelText: '#ffffff',
      panelMuted: '#cddcf2',
      accent: '#123b73',
      accentText: '#ffffff',
      page: '#f2f4f8',
      text: '#1f2937',
    },
  },
  {
    id: 'rani-panel',
    name: 'Rani Panel',
    layout: 'panel-right',
    heading: 'bar',
    serif: false,
    theme: {
      panel: '#a83368',
      panelText: '#ffffff',
      panelMuted: '#fad8e6',
      accent: '#8f2453',
      accentText: '#ffffff',
      page: '#ffffff',
      text: '#2b1b22',
    },
  },
  {
    id: 'teal-curve',
    name: 'Teal Curve',
    layout: 'header-curve',
    heading: 'pill',
    serif: false,
    theme: {
      panel: '#5bcdc6',
      panelText: '#ffffff',
      panelMuted: '#f0fffd',
      accent: '#2aa8a0',
      accentText: '#ffffff',
      page: '#ffffff',
      text: '#24383a',
    },
  },
  {
    id: 'olive-light',
    name: 'Olive Light',
    layout: 'light-left',
    heading: 'bar',
    serif: false,
    theme: {
      panel: '#eaf4d8',
      panelText: '#3c4a1f',
      panelMuted: '#5f7233',
      accent: '#4a6420',
      accentText: '#ffffff',
      page: '#ffffff',
      text: '#2f3a20',
    },
  },
];

export function biodataTemplateById(id: string): BiodataTemplate {
  return BIODATA_TEMPLATES.find((template) => template.id === id) ?? BIODATA_TEMPLATES[0];
}

export function biodataTemplateNumber(id: string): string {
  const index = BIODATA_TEMPLATES.findIndex((template) => template.id === id);
  return String((index === -1 ? 0 : index) + 1).padStart(2, '0');
}
