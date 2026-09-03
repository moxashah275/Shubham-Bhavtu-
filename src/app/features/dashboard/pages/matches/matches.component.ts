import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideSlidersHorizontal, LucideX } from '@lucide/angular';
import { map } from 'rxjs';
import {
  EMPTY_MATCH_QUERY,
  MatchQuery,
  filledFilterCount,
  filterMembers,
  hasActiveFilters,
  hasMatchSearch,
  matchQueryParams,
  matchSummaryItems,
  parseMatchQuery,
} from '../../../../core/data/match-query';
import { lookingForLabel, profilesTypeForLookingFor } from '../../../../core/data/partner-search-options';
import { MatchActivityService } from '../../../../core/services/match-activity.service';
import { InboxService } from '../../../../core/services/inbox.service';
import { MatchSearchService } from '../../../../core/services/match-search.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MemberMatch } from '../../../../shared/matches/match-profile.model';
import { MatchListingCardComponent } from '../../../../shared/matches/match-listing-card.component';
import { MemberProfileDialogComponent } from '../../../../shared/matches/member-profile-dialog.component';
import { MatchRefineFiltersComponent } from '../../../../shared/search/match-refine-filters.component';
import { PaginationComponent } from '../../../../shared/ui/pagination.component';
import memberMatchesData from '../../../../../assets/data/member-matches.json';

const PAGE_SIZE = 5;
const DEFAULT_BROWSE_COUNT = 10;

@Component({
  selector: 'app-matches-page',
  imports: [
    MatchRefineFiltersComponent,
    MatchListingCardComponent,
    MemberProfileDialogComponent,
    PaginationComponent,
    LucideSlidersHorizontal,
    LucideX,
  ],
  templateUrl: './matches.component.html',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class MatchesPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly matchSearch = inject(MatchSearchService);
  private readonly activity = inject(MatchActivityService);
  private readonly inbox = inject(InboxService);

  readonly members = memberMatchesData as MemberMatch[];
  private readonly query = toSignal(this.route.queryParamMap.pipe(map((params) => parseMatchQuery(params))), {
    initialValue: { ...EMPTY_MATCH_QUERY },
  });

  readonly lookingFor = signal('');
  readonly ageFrom = signal('');
  readonly ageTo = signal('');
  readonly religion = signal('');
  readonly maritalStatus = signal('');
  readonly height = signal('');
  readonly diet = signal('');
  readonly occupation = signal('');
  readonly country = signal('');
  readonly state = signal('');
  readonly city = signal('');
  readonly manglik = signal('');
  readonly subCaste = signal('');
  readonly income = signal('');
  readonly education = signal('');
  readonly motherTongue = signal('');
  readonly page = signal(1);
  readonly filtersOpen = signal(false);
  readonly selected = signal<MemberMatch | null>(null);

  readonly filteredActive = computed(() => hasActiveFilters(this.query()));
  readonly summary = computed(() => matchSummaryItems(this.query()));
  readonly filterCount = computed(() => filledFilterCount(this.query()));
  readonly filtered = computed(() => {
    const ranked = (list: MemberMatch[]) =>
      list.slice().sort((left, right) => {
        const rank = (member: MemberMatch) => (member.premium ? 2 : 0) + (member.activeToday ? 1 : 0);
        return rank(right) - rank(left);
      });

    if (!this.filteredActive()) {
      return ranked(this.members).slice(0, DEFAULT_BROWSE_COUNT);
    }
    return ranked(filterMembers(this.members, this.query()));
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));
  readonly pageItems = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });
  readonly heading = computed(() => {
    const count = this.filtered().length;
    if (!this.filteredActive()) {
      return `${count} members`;
    }
    const label = lookingForLabel(this.query().lookingFor);
    const profilesType = profilesTypeForLookingFor(this.query().lookingFor);
    if (label && profilesType) {
      return `${count} ${profilesType.toLowerCase()} for ${label}`;
    }
    if (label) {
      return `${count} match${count === 1 ? '' : 'es'} for ${label}`;
    }
    return `${count} match${count === 1 ? '' : 'es'} found`;
  });
  readonly rangeLabel = computed(() => {
    const total = this.filtered().length;
    if (!total) {
      return this.filteredActive()
        ? 'No profiles for these filters — clear to see members again'
        : 'No profiles yet';
    }
    const start = (this.page() - 1) * PAGE_SIZE + 1;
    const end = Math.min(this.page() * PAGE_SIZE, total);
    return `Showing ${start}–${end} of ${total} verified profiles`;
  });
  readonly canClearRefine = computed(() => this.filteredActive());

  constructor() {
    this.syncFromQuery();
    const query = this.query();
    if (hasMatchSearch(query)) {
      this.matchSearch.rememberQuery(query, { primary: !Object.keys(this.matchSearch.baseParams()).length });
    }
    this.route.queryParamMap.subscribe(() => {
      this.syncFromQuery();
      this.page.set(1);
      if (hasMatchSearch(this.query())) {
        this.matchSearch.rememberQuery(this.query());
      }
    });
  }

  clearRefineFilters(): void {
    this.filtersOpen.set(false);
    void this.router.navigateByUrl('/matches');
  }

  onEscape(): void {
    if (this.selected()) {
      return;
    }
    this.filtersOpen.set(false);
  }

  applyFilters(): void {
    this.filtersOpen.set(false);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: matchQueryParams(this.draftQuery()),
    });
  }

  goToPage(next: number): void {
    this.page.set(Math.min(this.totalPages(), Math.max(1, next)));
    document.getElementById('match-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  isShortlisted(id: string): boolean {
    return this.activity.isShortlisted(id);
  }

  isInterested(id: string): boolean {
    return this.activity.isInterested(id);
  }

  toggleShortlist(member: MemberMatch): void {
    const { added, name } = this.activity.toggleShortlist(member);
    if (!added) {
      this.toast.show(`${name} removed from shortlist.`);
      return;
    }
    this.toast.show(`${name} added to your shortlist.`);
  }

  expressInterest(member: MemberMatch): void {
    const { already, name } = this.activity.expressInterest(member);
    this.toast.show(
      already ? `Interest was already sent to ${name}.` : `Interest sent to ${name}. Families can take the next step.`,
    );
  }

  withdrawInterest(member: MemberMatch): void {
    const { name } = this.activity.withdrawInterest(member);
    this.toast.show(`Interest to ${name} has been removed.`);
  }

  openMessage(member: MemberMatch): void {
    this.inbox.openInbox(member.id);
  }

  private draftQuery(): MatchQuery {
    return {
      lookingFor: this.lookingFor(),
      ageFrom: this.ageFrom(),
      ageTo: this.ageTo(),
      religion: this.religion(),
      maritalStatus: this.maritalStatus(),
      height: this.height(),
      diet: this.diet(),
      occupation: '',
      country: '',
      state: this.state(),
      city: this.city(),
      manglik: this.manglik(),
      subCaste: this.subCaste(),
      income: this.income(),
      education: this.education(),
      motherTongue: this.motherTongue(),
    };
  }

  private writeDraft(query: MatchQuery): void {
    this.lookingFor.set(query.lookingFor);
    this.ageFrom.set(query.ageFrom);
    this.ageTo.set(query.ageTo);
    this.religion.set(query.religion);
    this.maritalStatus.set(query.maritalStatus);
    this.height.set(query.height);
    this.diet.set(query.diet);
    this.occupation.set(query.occupation);
    this.country.set(query.country);
    this.state.set(query.state);
    this.city.set(query.city);
    this.manglik.set(query.manglik);
    this.subCaste.set(query.subCaste);
    this.income.set(query.income);
    this.education.set(query.education);
    this.motherTongue.set(query.motherTongue);
  }

  private syncFromQuery(): void {
    this.writeDraft(this.query());
  }
}
