import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { LucideBadgeCheck, LucideDynamicIcon, LucideHeart, LucideX } from '@lucide/angular';
import { MemberMatch } from './match-profile.model';

@Component({
  selector: 'app-member-profile-dialog',
  imports: [LucideBadgeCheck, LucideDynamicIcon, LucideHeart],
  templateUrl: './member-profile-dialog.component.html',
  host: {
    '(document:keydown.escape)': 'closed.emit()',
  },
})
export class MemberProfileDialogComponent {
  readonly member = input.required<MemberMatch>();
  readonly shortlisted = input(false);
  readonly interested = input(false);
  readonly closed = output<void>();
  readonly toggleShortlist = output<MemberMatch>();
  readonly expressInterest = output<MemberMatch>();
  readonly withdrawInterest = output<MemberMatch>();
  readonly message = output<MemberMatch>();
  readonly LucideX = LucideX;

  constructor() {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = previous;
    });
  }
}
