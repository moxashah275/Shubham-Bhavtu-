import { Component, input } from '@angular/core';
import { MatchProfile } from './match-profile.model';

@Component({
  selector: 'app-match-card',
  template: `
    <article class="min-w-0 overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-sm">
      <div class="relative h-48 overflow-hidden sm:h-52">
        <img [src]="profile().imageSrc" [alt]="profile().name" class="h-full w-full object-cover object-top" />
        <span class="absolute top-3 left-3 rounded-full bg-burgundy/90 px-2.5 py-1 text-[11px] font-medium text-white">
          Verified
        </span>
      </div>
      <div class="p-4">
        <h3 class="font-serif text-xl leading-snug text-charcoal">{{ profile().name }}</h3>
        <p class="mt-1 text-sm leading-6 text-stone-500">{{ profile().age }} yrs · {{ profile().city }}</p>
        <p class="mt-1 font-medium text-burgundy">{{ profile().profession }}</p>
      </div>
    </article>
  `,
})
export class MatchCardComponent {
  readonly profile = input.required<MatchProfile>();
}
