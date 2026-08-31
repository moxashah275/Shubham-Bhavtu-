import { Component, computed, input, output } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

/** Single pagination control shared by matches, events and the biodata gallery. */
@Component({
  selector: 'app-pagination',
  imports: [LucideChevronLeft, LucideChevronRight],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly label = input('Pages');
  readonly changed = output<number>();

  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

  go(page: number): void {
    const next = Math.min(Math.max(page, 1), this.totalPages());
    if (next !== this.page()) {
      this.changed.emit(next);
    }
  }
}
