import { Component, computed, input, output } from '@angular/core';
import { LucideBadgeCheck, LucideHeart } from '@lucide/angular';
import { MemberMatch } from './match-profile.model';

@Component({
  selector: 'app-member-profile-card',
  imports: [LucideBadgeCheck, LucideHeart],
  templateUrl: './member-profile-card.component.html',
  host: {
    class: 'block h-full min-h-0 min-w-0 overflow-x-hidden',
  },
})
export class MemberProfileCardComponent {
  readonly member = input.required<MemberMatch>();
  readonly shortlisted = input(false);
  readonly interested = input(false);
  readonly scrollable = input(false);
  readonly dialog = input(false);
  readonly compact = input(false);
  readonly toggleShortlist = output<MemberMatch>();
  readonly expressInterest = output<MemberMatch>();
  readonly withdrawInterest = output<MemberMatch>();
  readonly message = output<MemberMatch>();

  readonly photoFrameClass = computed(() => {
    if (this.dialog()) {
      return 'relative h-56 overflow-hidden bg-blush md:h-full md:min-h-0';
    }
    if (this.compact()) {
      return 'relative h-48 overflow-hidden bg-blush sm:h-52 md:h-full md:min-h-full';
    }
    if (this.scrollable()) {
      return 'relative h-full min-h-52 overflow-hidden bg-blush';
    }
    return 'relative h-56 overflow-hidden bg-blush md:h-full md:min-h-[22rem]';
  });
  readonly photoImageClass = computed(() =>
    this.scrollable() && !this.dialog()
      ? 'absolute inset-0 h-full w-full object-cover object-[46%_14%]'
      : 'absolute inset-0 h-full w-full object-cover object-top',
  );

  labelClass(): string {
    return this.compact()
      ? 'text-[10px] font-medium text-stone-400'
      : 'text-[11px] font-medium text-stone-400';
  }

  valueClass(): string {
    return this.compact() || this.dialog()
      ? 'mt-0.5 min-w-0 break-words font-medium leading-snug text-charcoal'
      : 'mt-0.5 font-medium text-charcoal';
  }

  fieldClass(): string {
    return this.compact() || this.dialog() ? 'min-w-0' : '';
  }
}
