import { Component, input, output } from '@angular/core';
import { LucideBadgeCheck, LucideHeart } from '@lucide/angular';
import { MemberMatch } from './match-profile.model';

@Component({
  selector: 'app-match-listing-card',
  imports: [LucideBadgeCheck, LucideHeart],
  templateUrl: './match-listing-card.component.html',
  host: {
    class: 'block w-full',
  },
})
export class MatchListingCardComponent {
  readonly member = input.required<MemberMatch>();
  readonly shortlisted = input(false);
  readonly interested = input(false);
  readonly viewProfile = output<MemberMatch>();
  readonly toggleShortlist = output<MemberMatch>();
  readonly expressInterest = output<MemberMatch>();
  readonly withdrawInterest = output<MemberMatch>();
  readonly message = output<MemberMatch>();
}
