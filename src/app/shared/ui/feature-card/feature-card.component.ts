import { Component, input } from '@angular/core';
import { LucideDynamicIcon, type LucideIcon } from '@lucide/angular';

@Component({
  selector: 'app-feature-card',
  imports: [LucideDynamicIcon],
  template: `
    <article class="h-full min-w-0 rounded-2xl border border-gold/15 bg-white p-5 shadow-sm sm:p-6">
      <span class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blush text-burgundy">
        <svg [lucideIcon]="icon()" [size]="20" aria-hidden="true"></svg>
      </span>
      <h3 class="mt-5 font-serif text-xl text-charcoal sm:text-2xl">{{ title() }}</h3>
      <p class="mt-2 text-sm leading-6 text-stone-500">{{ copy() }}</p>
    </article>
  `,
})
export class FeatureCardComponent {
  readonly icon = input.required<LucideIcon>();
  readonly title = input.required<string>();
  readonly copy = input.required<string>();
}
