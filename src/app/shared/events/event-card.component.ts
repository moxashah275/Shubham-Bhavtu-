import { Component, computed, input, output } from '@angular/core';
import { LucideArrowRight, LucideCalendar, LucideClock, LucideMapPin, LucideUser } from '@lucide/angular';
import {
  eventAvailability,
  eventDateLabel,
  eventFeeBadge,
  eventFeeLabel,
  eventShortDate,
  isFreeEvent,
  type CommunityEvent,
} from './event.model';

/** Compact card for one upcoming event. Reused by the events page and any future listing. */
@Component({
  selector: 'app-event-card',
  imports: [LucideArrowRight, LucideCalendar, LucideClock, LucideMapPin, LucideUser],
  templateUrl: './event-card.component.html',
})
export class EventCardComponent {
  readonly event = input.required<CommunityEvent>();
  readonly opened = output<string>();

  readonly free = computed(() => isFreeEvent(this.event()));
  readonly feeBadge = computed(() => eventFeeBadge(this.event()));
  readonly feeLabel = computed(() => eventFeeLabel(this.event()));
  readonly filledPercent = computed(() => {
    const item = this.event();
    const taken = item.totalSeats - item.seatsLeft;
    return Math.min(100, Math.max(4, Math.round((taken / item.totalSeats) * 100)));
  });
  readonly shortDate = computed(() => eventShortDate(this.event()));
  readonly dateLabel = computed(() => eventDateLabel(this.event()));
  readonly availability = computed(() => eventAvailability(this.event()));
  readonly almostFull = computed(() => this.availability() !== 'Seats available');
}
