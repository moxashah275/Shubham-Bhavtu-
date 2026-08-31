import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { MemberMatch } from '../../shared/matches/match-profile.model';
import memberMatchesData from '../../../assets/data/member-matches.json';

const SHORTLIST_KEY = 'gathbandhan.match.shortlist';
const INTEREST_KEY = 'gathbandhan.match.interest';

export type MemberActivityKind = 'shortlist' | 'interest';

/** Shared shortlist and interest lists so Matches and the navbar stay in sync. */
@Injectable({ providedIn: 'root' })
export class MatchActivityService {
  private readonly auth = inject(AuthService);
  private readonly members = memberMatchesData as MemberMatch[];

  readonly shortlistedIds = signal<string[]>(this.readIds(SHORTLIST_KEY));
  readonly interestedIds = signal<string[]>(this.readIds(INTEREST_KEY));
  readonly panel = signal<MemberActivityKind | null>(null);

  readonly shortlistedMembers = computed(() => this.membersFor(this.shortlistedIds()));
  readonly interestedMembers = computed(() => this.membersFor(this.interestedIds()));
  readonly shortlistCount = computed(() => this.shortlistedIds().length);
  readonly interestCount = computed(() => this.interestedIds().length);

  openPanel(kind: MemberActivityKind): void {
    this.panel.set(kind);
  }

  closePanel(): void {
    this.panel.set(null);
  }

  isShortlisted(id: string): boolean {
    return this.shortlistedIds().includes(id);
  }

  isInterested(id: string): boolean {
    return this.interestedIds().includes(id);
  }

  /** A member sits in one list only, so the shortlist and interest panels never repeat a profile. */
  toggleShortlist(member: MemberMatch): { added: boolean; name: string; movedFromInterest: boolean } {
    const added = !this.isShortlisted(member.id);
    const movedFromInterest = added && this.isInterested(member.id);
    this.shortlistedIds.update((ids) =>
      added ? [...ids, member.id] : ids.filter((id) => id !== member.id),
    );
    this.writeIds(SHORTLIST_KEY, this.shortlistedIds());
    if (movedFromInterest) {
      this.interestedIds.update((ids) => ids.filter((id) => id !== member.id));
      this.writeIds(INTEREST_KEY, this.interestedIds());
    }
    return { added, name: member.name, movedFromInterest };
  }

  expressInterest(member: MemberMatch): { already: boolean; name: string } {
    if (this.isInterested(member.id)) {
      return { already: true, name: member.name };
    }
    this.interestedIds.update((ids) => [...ids, member.id]);
    this.writeIds(INTEREST_KEY, this.interestedIds());
    if (this.isShortlisted(member.id)) {
      this.shortlistedIds.update((ids) => ids.filter((id) => id !== member.id));
      this.writeIds(SHORTLIST_KEY, this.shortlistedIds());
    }
    return { already: false, name: member.name };
  }

  withdrawInterest(member: MemberMatch): { name: string } {
    this.interestedIds.update((ids) => ids.filter((id) => id !== member.id));
    this.writeIds(INTEREST_KEY, this.interestedIds());
    return { name: member.name };
  }

  memberById(id: string): MemberMatch | null {
    return this.members.find((member) => member.id === id) ?? null;
  }

  private membersFor(ids: string[]): MemberMatch[] {
    return ids
      .map((id) => this.members.find((member) => member.id === id))
      .filter((member): member is MemberMatch => Boolean(member));
  }

  private readIds(key: string): string[] {
    try {
      const raw = localStorage.getItem(this.scoped(key));
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }

  private writeIds(key: string, ids: string[]): void {
    try {
      localStorage.setItem(this.scoped(key), JSON.stringify(ids));
    } catch {
      // Private browsing can block storage.
    }
  }

  private scoped(key: string): string {
    return `${key}.${this.auth.user()?.id ?? 'guest'}`;
  }
}
