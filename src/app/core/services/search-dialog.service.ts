import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchDialogService {
  readonly open = signal(false);
  readonly fresh = signal(false);

  show(options?: { fresh?: boolean }): void {
    this.fresh.set(Boolean(options?.fresh));
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
    this.fresh.set(false);
  }

  toggle(): void {
    this.open.update((open) => !open);
  }
}
