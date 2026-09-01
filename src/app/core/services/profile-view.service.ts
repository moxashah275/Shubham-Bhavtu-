import { Injectable, signal } from '@angular/core';

/** Lets navbar (and other chrome) request the profile page in read-only view mode. */
@Injectable({ providedIn: 'root' })
export class ProfileViewService {
  private readonly requestTick = signal(0);

  /** Bump when navigation should land on profile view, not the edit form. */
  readonly viewRequested = this.requestTick.asReadonly();

  showViewMode(): void {
    this.requestTick.update((tick) => tick + 1);
  }
}
