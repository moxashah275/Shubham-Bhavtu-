import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { LucideDynamicIcon, LucideX } from '@lucide/angular';
import { SuccessMatch } from './match-profile.model';

@Component({
  selector: 'app-success-match-dialog',
  imports: [LucideDynamicIcon],
  templateUrl: './success-match-dialog.component.html',
  host: {
    '(document:keydown.escape)': 'closed.emit()',
  },
})
export class SuccessMatchDialogComponent {
  readonly story = input.required<SuccessMatch>();
  readonly closed = output<void>();
  readonly LucideX = LucideX;

  constructor() {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = previous;
    });
  }
}
