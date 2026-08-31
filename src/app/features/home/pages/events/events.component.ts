import { Component, computed, inject, signal } from '@angular/core';
import { LucideSlidersHorizontal, LucideX } from '@lucide/angular';
import { COMMUNITY_EVENTS, PAST_EVENTS } from '../../../../core/data/community-events';
import { ToastService } from '../../../../core/services/toast.service';
import { EventCardComponent } from '../../../../shared/events/event-card.component';
import { EventDetailDialogComponent } from '../../../../shared/events/event-detail-dialog.component';
import { EventFiltersComponent } from '../../../../shared/events/event-filters.component';
import { eventAvailability, eventMatchesWhen, eventState, isFreeEvent } from '../../../../shared/events/event.model';
import { PaginationComponent } from '../../../../shared/ui/pagination.component';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-events-page',
  imports: [
    EventCardComponent,
    EventDetailDialogComponent,
    EventFiltersComponent,
    PaginationComponent,
    LucideSlidersHorizontal,
    LucideX,
  ],
  templateUrl: './events.component.html',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class EventsPageComponent {
  private readonly toast = inject(ToastService);

  readonly events = COMMUNITY_EVENTS;
  readonly pastEvents = PAST_EVENTS;

  readonly category = signal('');
  readonly fee = signal('');
  readonly state = signal('');
  readonly city = signal('');
  readonly when = signal('');
  readonly availability = signal('');
  readonly page = signal(1);
  readonly openId = signal('');
  readonly filtersOpen = signal(false);

  readonly filtered = computed(() =>
    COMMUNITY_EVENTS.filter((event) => {
      if (this.fee() === 'free' && !isFreeEvent(event)) {
        return false;
      }
      if (this.fee() === 'paid' && isFreeEvent(event)) {
        return false;
      }
      if (this.category() && event.category !== this.category()) {
        return false;
      }
      if (this.state() && eventState(event) !== this.state()) {
        return false;
      }
      if (this.city() && event.city !== this.city()) {
        return false;
      }
      if (!eventMatchesWhen(event, this.when() || 'upcoming')) {
        return false;
      }
      if (this.availability() && eventAvailability(event) !== this.availability()) {
        return false;
      }
      return true;
    }),
  );

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));
  readonly pageEvents = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });
  readonly openEvent = computed(() => COMMUNITY_EVENTS.find((event) => event.id === this.openId()) ?? null);
  readonly rangeLabel = computed(() => {
    const total = this.filtered().length;
    if (!total) {
      return 'No events for these filters — clear to see gatherings again';
    }
    const start = (this.page() - 1) * PAGE_SIZE + 1;
    const end = Math.min(this.page() * PAGE_SIZE, total);
    return `Showing ${start}–${end} of ${total} gatherings`;
  });

  onEscape(): void {
    if (this.openId()) {
      this.close();
      return;
    }
    this.filtersOpen.set(false);
  }

  /** Any filter change starts the list again from page one. */
  onFilterChange(): void {
    this.page.set(1);
  }

  applyFilters(): void {
    this.filtersOpen.set(false);
    this.onFilterChange();
  }

  clearFilters(): void {
    this.category.set('');
    this.fee.set('');
    this.state.set('');
    this.city.set('');
    this.when.set('');
    this.availability.set('');
    this.filtersOpen.set(false);
    this.onFilterChange();
  }

  goToPage(page: number): void {
    this.page.set(Math.min(Math.max(page, 1), this.totalPages()));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  open(id: string): void {
    this.openId.set(id);
  }

  close(): void {
    this.openId.set('');
  }

  book(id: string): void {
    const event = COMMUNITY_EVENTS.find((item) => item.id === id);
    this.openId.set('');
    this.toast.show(
      event
        ? `Seat reserved for ${event.title}. Our team will confirm on WhatsApp.`
        : 'Seat reserved. Our team will confirm shortly.',
    );
  }
}
