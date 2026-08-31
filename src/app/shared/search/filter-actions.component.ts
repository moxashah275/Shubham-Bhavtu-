import { Component, input, output } from '@angular/core';

/** Apply / clear buttons shared by every filter sidebar. */
@Component({
  selector: 'app-filter-actions',
  template: `
    <div class="mt-5 flex flex-col gap-2">
      <button
        type="button"
        class="inline-flex h-11 items-center justify-center rounded-lg bg-burgundy text-sm font-semibold text-white transition hover:bg-burgundy-deep"
        (click)="applied.emit()"
      >
        {{ applyLabel() }}
      </button>
      <button
        type="button"
        class="inline-flex h-11 items-center justify-center rounded-lg border border-gold/30 text-sm font-semibold text-charcoal transition hover:bg-blush"
        (click)="cleared.emit()"
      >
        {{ clearLabel() }}
      </button>
    </div>
  `,
})
export class FilterActionsComponent {
  readonly applyLabel = input('Apply filters');
  readonly clearLabel = input('Clear filters');
  readonly applied = output<void>();
  readonly cleared = output<void>();
}
