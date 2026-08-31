import { Injectable, signal } from '@angular/core';
import { isPrimarySearchComplete, parseMatchQuery, type MatchQuery } from '../data/match-query';

const STORAGE_KEY = 'gathbandhan.match.search';

const PRIMARY_KEYS = ['lookingFor', 'ageFrom', 'ageTo', 'religion', 'maritalStatus'] as const;

interface StoredSearch {
  params: Record<string, string>;
  base: Record<string, string>;
  unlocked: boolean;
}

@Injectable({ providedIn: 'root' })
export class MatchSearchService {
  private readonly stored = this.readStored();
  readonly lastParams = signal<Record<string, string>>(this.stored.params);
  readonly baseParams = signal<Record<string, string>>(this.stored.base);
  readonly hasSearched = signal(this.stored.unlocked);

  remember(params: Record<string, string | undefined | null>, options?: { primary?: boolean }): void {
    const clean = this.cleanParams(params);
    this.lastParams.set(clean);
    if (options?.primary) {
      this.baseParams.set(this.pickPrimary(clean));
      this.hasSearched.set(true);
    } else if (isPrimarySearchComplete(parseMatchQuery(this.asParamMap(clean)))) {
      this.hasSearched.set(true);
      if (!Object.keys(this.baseParams()).length) {
        this.baseParams.set(this.pickPrimary(clean));
      }
    }
    this.writeStored();
  }

  rememberQuery(query: MatchQuery, options?: { primary?: boolean }): void {
    this.remember(
      {
        lookingFor: query.lookingFor,
        ageFrom: query.ageFrom,
        ageTo: query.ageTo,
        religion: query.religion,
        maritalStatus: query.maritalStatus,
        height: query.height,
        diet: query.diet,
        occupation: query.occupation,
        country: query.country,
        state: query.state,
        city: query.city,
        manglik: query.manglik,
        education: query.education,
        motherTongue: query.motherTongue,
      },
      options,
    );
  }

  clear(): void {
    this.lastParams.set({});
    this.baseParams.set({});
    this.hasSearched.set(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Private browsing can block storage.
    }
  }

  private pickPrimary(params: Record<string, string>): Record<string, string> {
    const primary: Record<string, string> = {};
    for (const key of PRIMARY_KEYS) {
      if (params[key]) {
        primary[key] = params[key];
      }
    }
    return primary;
  }

  private cleanParams(params: Record<string, string | undefined | null>): Record<string, string> {
    const clean: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        clean[key] = value;
      }
    }
    return clean;
  }

  private asParamMap(params: Record<string, string>): { get(name: string): string | null } {
    return {
      get: (name: string) => params[name] ?? null,
    };
  }

  private readStored(): StoredSearch {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { params: {}, base: {}, unlocked: false };
      }
      const parsed: unknown = JSON.parse(raw);
      if (this.isStoredSearch(parsed)) {
        const params = this.cleanParams(parsed.params as Record<string, string>);
        const base = this.isStringRecord(parsed.base)
          ? this.cleanParams(parsed.base)
          : this.pickPrimary(params);
        return {
          params,
          base,
          unlocked: Boolean(parsed.unlocked),
        };
      }
      if (this.isStringRecord(parsed)) {
        const params = this.cleanParams(parsed);
        return {
          params,
          base: this.pickPrimary(params),
          unlocked: isPrimarySearchComplete(parseMatchQuery(this.asParamMap(params))),
        };
      }
      return { params: {}, base: {}, unlocked: false };
    } catch {
      return { params: {}, base: {}, unlocked: false };
    }
  }

  private isStoredSearch(value: unknown): value is StoredSearch {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const params = (value as { params?: unknown }).params;
    return Boolean(params && typeof params === 'object' && !Array.isArray(params));
  }

  private isStringRecord(value: unknown): value is Record<string, string> {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
  }

  private writeStored(): void {
    try {
      const payload: StoredSearch = {
        params: this.lastParams(),
        base: this.baseParams(),
        unlocked: this.hasSearched(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Private browsing can block storage.
    }
  }
}
