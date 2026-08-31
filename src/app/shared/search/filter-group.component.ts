import { Component, input, output } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';

/**
 * One collapsible group inside a filter sidebar. Shared by the match and event
 * filters so both look and behave identically.
 */
@Component({
  selector: 'app-filter-group',
  imports: [LucideChevronDown],
  template: `
    <div>
      <button
        type="button"
        class="flex w-full cursor-pointer items-center justify-between gap-3 py-3 text-left"
        [attr.aria-expanded]="open()"
        (click)="toggled.emit()"
      >
        <span class="text-xs font-semibold tracking-[0.14em] text-charcoal uppercase">{{ label() }}</span>
        <svg
          lucideChevronDown
          [size]="16"
          class="shrink-0 text-stone-400 transition-transform duration-200"
          [class.rotate-180]="open()"
          aria-hidden="true"
        ></svg>
      </button>

      @if (open()) {
        <div class="grid gap-3 pb-4">
          <ng-content />
        </div>
      }
    </div>
  `,
})
export class FilterGroupComponent {
  readonly label = input.required<string>();
  readonly open = input(false);
  readonly toggled = output<void>();
}
