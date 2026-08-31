import { Component, ElementRef, HostListener, inject, input, model, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';

export interface SearchSelectOption {
  value: string;
  label: string;
}

let openSearchSelect: SearchSelectComponent | null = null;

@Component({
  selector: 'app-search-select',
  imports: [LucideChevronDown],
  templateUrl: './search-select.component.html',
  host: {
    class: 'relative mt-1.5 block',
    '[class.z-50]': 'open()',
  },
})
export class SearchSelectComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly name = input.required<string>();
  readonly placeholder = input('Select');
  readonly options = input.required<SearchSelectOption[]>();
  readonly value = model.required<string>();
  readonly disabled = input(false);
  readonly open = signal(false);
  /** True when the list would spill past its card, so it opens upwards instead. */
  readonly openUp = signal(false);

  selectedLabel(): string {
    return this.options().find((option) => option.value === this.value())?.label ?? '';
  }

  toggle(event: Event): void {
    event.stopPropagation();
    if (this.disabled()) {
      return;
    }
    const next = !this.open();
    if (openSearchSelect && openSearchSelect !== this) {
      openSearchSelect.open.set(false);
    }
    if (next) {
      this.openUp.set(this.shouldOpenUp());
    }
    this.open.set(next);
    openSearchSelect = next ? this : null;
  }

  /** Keeps the list inside the surrounding card (or viewport) instead of overflowing it. */
  private shouldOpenUp(): boolean {
    const host = this.host.nativeElement as HTMLElement;
    const rect = host.getBoundingClientRect();
    const listHeight = Math.min(224, this.options().length * 38 + 8);
    const boundary = host.closest('[data-select-boundary]');
    const limit = boundary ? boundary.getBoundingClientRect().bottom : window.innerHeight;
    const spaceBelow = limit - rect.bottom;
    const spaceAbove = rect.top - (boundary ? boundary.getBoundingClientRect().top : 0);
    return spaceBelow < listHeight && spaceAbove > spaceBelow;
  }

  choose(event: Event, option: SearchSelectOption): void {
    event.stopPropagation();
    this.value.set(option.value);
    this.open.set(false);
    openSearchSelect = null;
  }

  keepOpen(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.host.nativeElement.contains(event.target as Node)) {
      return;
    }
    this.open.set(false);
    if (openSearchSelect === this) {
      openSearchSelect = null;
    }
  }
}
