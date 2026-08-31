import { Component, computed, input, output } from '@angular/core';
import {
  LucideCalendar,
  LucideCheck,
  LucideClock,
  LucideLanguages,
  LucideMapPin,
  LucidePhone,
  LucideShirt,
  LucideTicket,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import {
  EVENT_HELPDESK,
  eventAvailability,
  eventDateLabel,
  eventDressCode,
  eventFeeLabel,
  eventLanguage,
  eventState,
  isFreeEvent,
  type CommunityEvent,
} from './event.model';

@Component({
  selector: 'app-event-detail-dialog',
  imports: [
    LucideCalendar,
    LucideCheck,
    LucideClock,
    LucideLanguages,
    LucideMapPin,
    LucidePhone,
    LucideShirt,
    LucideTicket,
    LucideUsers,
    LucideX,
  ],
  templateUrl: './event-detail-dialog.component.html',
})
export class EventDetailDialogComponent {
  readonly event = input.required<CommunityEvent>();
  readonly closed = output<void>();
  readonly booked = output<string>();

  readonly free = computed(() => isFreeEvent(this.event()));
  readonly feeLabel = computed(() => eventFeeLabel(this.event()));
  readonly dateLabel = computed(() => eventDateLabel(this.event()));
  readonly availability = computed(() => eventAvailability(this.event()));
  readonly location = computed(() => `${this.event().venue}, ${this.event().city}, ${eventState(this.event())}`);
  readonly dressCode = computed(() => eventDressCode(this.event()));
  readonly language = computed(() => eventLanguage(this.event()));
  readonly helpdesk = EVENT_HELPDESK;
}
