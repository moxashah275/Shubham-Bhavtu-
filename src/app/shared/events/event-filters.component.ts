import { Component, computed, input, model, output, signal } from '@angular/core';
import { FilterActionsComponent } from '../search/filter-actions.component';
import { FilterGroupComponent } from '../search/filter-group.component';
import { SearchSelectComponent, SearchSelectOption } from '../search/search-select.component';
import { EVENT_CATEGORIES, eventState, type CommunityEvent } from './event.model';

type EventFilterGroup = 'type' | 'location' | 'price' | 'date' | 'availability';

/** Event filters, using the same accordion, border and type as Matches. */
@Component({
  selector: 'app-event-filters',
  imports: [SearchSelectComponent, FilterGroupComponent, FilterActionsComponent],
  templateUrl: './event-filters.component.html',
})
export class EventFiltersComponent {
  readonly events = input<CommunityEvent[]>([]);
  readonly resultCount = input(0);

  readonly category = model('');
  readonly fee = model('');
  readonly state = model('');
  readonly city = model('');
  readonly when = model('');
  readonly availability = model('');
  readonly applied = output<void>();
  readonly cleared = output<void>();

  readonly openGroup = signal<EventFilterGroup | null>('type');
  readonly groups: { id: EventFilterGroup; label: string }[] = [
    { id: 'type', label: 'Event type' },
    { id: 'location', label: 'Location' },
    { id: 'price', label: 'Event price' },
    { id: 'date', label: 'Date' },
    { id: 'availability', label: 'Availability' },
  ];

  readonly categoryOptions: SearchSelectOption[] = EVENT_CATEGORIES.map((item) => ({ value: item, label: item }));
  readonly feeOptions: SearchSelectOption[] = [
    { value: 'free', label: 'Free events' },
    { value: 'paid', label: 'Paid events' },
  ];
  readonly whenOptions: SearchSelectOption[] = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'this-week', label: 'This week' },
    { value: 'this-month', label: 'This month' },
  ];
  readonly availabilityOptions: SearchSelectOption[] = [
    { value: 'Seats available', label: 'Seats available' },
    { value: 'Almost full', label: 'Almost full' },
    { value: 'Full', label: 'Full' },
  ];

  readonly stateOptions = computed(() => this.toOptions(this.events().map(eventState)));
  readonly cityOptions = computed(() => {
    const state = this.state();
    if (!state) {
      return [];
    }
    return this.toOptions(
      this.events()
        .filter((event) => eventState(event) === state)
        .map((event) => event.city),
    );
  });

  readonly applyLabel = computed(() => {
    const count = this.resultCount();
    if (count <= 0) {
      return 'Apply filters';
    }
    return `Show ${count} ${count === 1 ? 'event' : 'events'}`;
  });

  isOpen(group: EventFilterGroup): boolean {
    return this.openGroup() === group;
  }

  toggleGroup(group: EventFilterGroup): void {
    this.openGroup.update((open) => (open === group ? null : group));
  }

  onStateChange(value: string): void {
    this.state.set(value);
    this.city.set('');
  }

  clear(): void {
    this.category.set('');
    this.fee.set('');
    this.state.set('');
    this.city.set('');
    this.when.set('');
    this.availability.set('');
    this.cleared.emit();
  }

  private toOptions(values: string[]): SearchSelectOption[] {
    return [...new Set(values.filter(Boolean))].sort().map((value) => ({ value, label: value }));
  }
}
