import { Component, inject } from '@angular/core';
import { LucideCheck, LucideDynamicIcon } from '@lucide/angular';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [LucideDynamicIcon],
  template: `
    @if (toast.message(); as message) {
      <div
        class="pointer-events-none fixed top-24 left-1/2 z-[100] w-[min(calc(100vw-2rem),24rem)] -translate-x-1/2 px-4"
        role="status"
      >
        <div
          class="toast-enter pointer-events-auto flex items-start gap-3 rounded-2xl border border-gold/25 bg-ivory px-4 py-3.5 text-charcoal shadow-[0_18px_40px_rgba(43,36,32,0.16)]"
        >
          <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush text-burgundy">
            <svg [lucideIcon]="checkIcon" [size]="16" aria-hidden="true"></svg>
          </span>
          <p class="pt-1 text-sm font-medium leading-6">{{ message }}</p>
        </div>
      </div>
    }
  `,
})
export class ToastComponent {
  readonly toast = inject(ToastService);
  readonly checkIcon = LucideCheck;
}
