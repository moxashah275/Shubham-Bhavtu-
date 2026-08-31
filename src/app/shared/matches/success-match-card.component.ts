import { Component, input, output } from '@angular/core';
import { LucideArrowUpRight, LucideDynamicIcon } from '@lucide/angular';
import { SuccessMatch } from './match-profile.model';

@Component({
  selector: 'app-success-match-card',
  imports: [LucideDynamicIcon],
  templateUrl: './success-match-card.component.html',
})
export class SuccessMatchCardComponent {
  readonly story = input.required<SuccessMatch>();
  readonly viewMore = output<SuccessMatch>();
  readonly ArrowUpRight = LucideArrowUpRight;
}
