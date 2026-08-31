export type EventCategory = 'Matrimony meet' | 'Cultural' | 'Family' | 'Workshop' | 'Religious';

export const EVENT_CATEGORIES: EventCategory[] = [
  'Matrimony meet',
  'Cultural',
  'Family',
  'Workshop',
  'Religious',
];

export interface CommunityEvent {
  id: string;
  title: string;
  category: EventCategory;
  /** Short date parts so cards can show a calendar-style badge. */
  day: string;
  month: string;
  year: string;
  time: string;
  venue: string;
  city: string;
  imageSrc: string;
  /** Paid events carry a fee; free ones show a Free badge instead. */
  fee: number;
  seatsLeft: number;
  totalSeats: number;
  host: string;
  summary: string;
  forWhom: string;
  highlights: string[];
}

export interface PastEvent {
  id: string;
  title: string;
  city: string;
  held: string;
  attendees: string;
  imageSrc: string;
  note: string;
}

/** Community desk shown on every event, so families always know whom to call. */
export const EVENT_HELPDESK = '+91 90000 12345';

const CITY_STATE: Record<string, string> = {
  Ahmedabad: 'Gujarat',
  Surat: 'Gujarat',
  Vadodara: 'Gujarat',
  Rajkot: 'Gujarat',
  Palitana: 'Gujarat',
  Mumbai: 'Maharashtra',
  Pune: 'Maharashtra',
  Bengaluru: 'Karnataka',
  Indore: 'Madhya Pradesh',
  Jaipur: 'Rajasthan',
};

/** Extra details every event page shows, derived from the event type. */
const CATEGORY_DETAILS: Record<EventCategory, { dressCode: string; language: string }> = {
  'Matrimony meet': { dressCode: 'Indian formal', language: 'Gujarati, Hindi' },
  Cultural: { dressCode: 'Traditional / festive', language: 'Gujarati' },
  Family: { dressCode: 'Smart casual', language: 'Gujarati, Hindi' },
  Workshop: { dressCode: 'Smart casual', language: 'Gujarati, Hindi, English' },
  Religious: { dressCode: 'Traditional, white preferred', language: 'Gujarati' },
};

export function isFreeEvent(event: CommunityEvent): boolean {
  return event.fee === 0;
}

export function eventState(event: CommunityEvent): string {
  return CITY_STATE[event.city] ?? 'Gujarat';
}

/** Date on a single line, e.g. "14 Sep 2026". */
export function eventDateLabel(event: CommunityEvent): string {
  return `${event.day} ${event.month} ${event.year}`;
}

export function eventShortDate(event: CommunityEvent): string {
  return `${event.day} ${event.month}`;
}

/** Month + year for the When filter, e.g. "Sep 2026". */
export function eventMonth(event: CommunityEvent): string {
  return `${event.month} ${event.year}`;
}

const MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function eventDate(event: CommunityEvent): Date {
  return new Date(Number(event.year), MONTH_INDEX[event.month] ?? 0, Number(event.day));
}

/** Date filter: upcoming, this week, or this calendar month. */
export function eventMatchesWhen(event: CommunityEvent, when: string, now = new Date()): boolean {
  if (!when || when === 'upcoming') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return eventDate(event) >= start;
  }
  const date = eventDate(event);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (when === 'this-week') {
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return date >= start && date < end;
  }
  if (when === 'this-month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  return true;
}

export function eventDressCode(event: CommunityEvent): string {
  return CATEGORY_DETAILS[event.category].dressCode;
}

export function eventLanguage(event: CommunityEvent): string {
  return CATEGORY_DETAILS[event.category].language;
}

export type EventAvailability = 'Full' | 'Almost full' | 'Seats available';

export function eventAvailability(event: CommunityEvent): EventAvailability {
  if (event.seatsLeft <= 0) {
    return 'Full';
  }
  return event.seatsLeft / event.totalSeats <= 0.2 ? 'Almost full' : 'Seats available';
}

export function eventFeeLabel(event: CommunityEvent): string {
  return isFreeEvent(event) ? 'Free entry' : `₹${event.fee.toLocaleString('en-IN')} per person`;
}

/** Short badge on cards — Free or Paid, never the rupee amount. */
export function eventFeeBadge(event: CommunityEvent): 'Free' | 'Paid' {
  return isFreeEvent(event) ? 'Free' : 'Paid';
}
