import { Component, computed, input, model, output, signal } from '@angular/core';
import {
  AGE_OPTIONS,
  DIET_OPTIONS,
  EDUCATION_OPTIONS,
  INCOME_OPTIONS,
  LOOKING_FOR_OPTIONS,
  MANGLIK_OPTIONS,
  MARITAL_OPTIONS,
  RELIGION_OPTIONS,
  SUB_CASTE_OPTIONS,
  profilesTypeForLookingFor,
} from '../../core/data/partner-search-options';
import { MemberMatch } from '../matches/match-profile.model';
import { EMPTY_MATCH_QUERY, MatchQuery, filterMembers, uniqueOptions } from '../../core/data/match-query';
import { SearchSelectComponent, SearchSelectOption } from './search-select.component';
import { FilterActionsComponent } from './filter-actions.component';
import { FilterGroupComponent } from './filter-group.component';

type FilterGroup = 'basics' | 'faith' | 'lifestyle' | 'location';

@Component({
  selector: 'app-match-refine-filters',
  imports: [SearchSelectComponent, FilterGroupComponent, FilterActionsComponent],
  templateUrl: './match-refine-filters.component.html',
})
export class MatchRefineFiltersComponent {
  readonly lookingFor = model('');
  readonly ageFrom = model('');
  readonly ageTo = model('');
  readonly religion = model('');
  readonly maritalStatus = model('');
  readonly height = model('');
  readonly diet = model('');
  readonly occupation = model('');
  readonly country = model('');
  readonly state = model('');
  readonly city = model('');
  readonly manglik = model('');
  readonly subCaste = model('');
  readonly income = model('');
  readonly education = model('');
  readonly motherTongue = model('');
  readonly members = input<MemberMatch[]>([]);
  readonly resultNoun = input<'match' | 'profile'>('match');
  readonly applied = output<void>();
  readonly cleared = output<void>();

  readonly openGroup = signal<FilterGroup | null>('basics');
  readonly lookingForOptions = LOOKING_FOR_OPTIONS;
  readonly ageOptions = AGE_OPTIONS;
  readonly maritalOptions = MARITAL_OPTIONS;
  readonly religionOptions = RELIGION_OPTIONS;
  readonly subCasteOptions = SUB_CASTE_OPTIONS;
  readonly dietOptions = DIET_OPTIONS;
  readonly manglikOptions = MANGLIK_OPTIONS;
  readonly incomeOptions = INCOME_OPTIONS;

  readonly heightOptions = computed(() => uniqueOptions(this.members().map((m) => m.height)));
  readonly motherTongueOptions = computed(() => uniqueOptions(this.members().map((m) => m.motherTongue)));
  /** Standard education levels plus anything extra the member data uses. */
  readonly educationOptions = computed(() =>
    uniqueOptions([
      ...EDUCATION_OPTIONS.map((option) => option.value),
      ...this.members().map((member) => member.education),
    ]),
  );
  readonly stateOptions = computed<SearchSelectOption[]>(() =>
    uniqueOptions(this.members().map((member) => member.state)),
  );
  readonly cityOptions = computed<SearchSelectOption[]>(() => {
    const state = this.state();
    if (!state) {
      return [];
    }
    return uniqueOptions(
      this.members()
        .filter((member) => member.state === state)
        .map((member) => member.city),
    );
  });

  readonly previewCount = computed(() => filterMembers(this.members(), this.currentQuery()).length);
  readonly profilesHint = computed(() => {
    const type = profilesTypeForLookingFor(this.lookingFor());
    return type ? `Shows ${type} profiles` : '';
  });
  readonly applyLabel = computed(() => {
    const count = this.previewCount();
    if (count <= 0) {
      return 'Apply filters';
    }
    if (this.resultNoun() === 'profile') {
      return `Show ${count} ${count === 1 ? 'profile' : 'profiles'}`;
    }
    return `Show ${count} ${count === 1 ? 'match' : 'matches'}`;
  });

  readonly groups: { id: FilterGroup; label: string }[] = [
    { id: 'basics', label: 'Basics' },
    { id: 'faith', label: 'Faith' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'location', label: 'Location' },
  ];

  isOpen(group: FilterGroup): boolean {
    return this.openGroup() === group;
  }

  toggleGroup(group: FilterGroup): void {
    this.openGroup.update((open) => (open === group ? null : group));
  }

  onStateChange(value: string): void {
    this.state.set(value);
    this.city.set('');
  }

  apply(): void {
    this.applied.emit();
  }

  clear(): void {
    this.cleared.emit();
  }

  private currentQuery(): MatchQuery {
    return {
      ...EMPTY_MATCH_QUERY,
      lookingFor: this.lookingFor(),
      ageFrom: this.ageFrom(),
      ageTo: this.ageTo(),
      religion: this.religion(),
      maritalStatus: this.maritalStatus(),
      height: this.height(),
      diet: this.diet(),
      state: this.state(),
      city: this.city(),
      subCaste: this.subCaste(),
      income: this.income(),
      motherTongue: this.motherTongue(),
      education: this.education(),
      manglik: this.manglik(),
    };
  }
}
