import { Component, computed, input, output } from '@angular/core';
import { LucideCheck, LucideIndianRupee, LucideX } from '@lucide/angular';
import type { MembershipPlan } from './membership-plans';
import { featuresForPlan } from './membership-plans';

@Component({
  selector: 'app-membership-payment-dialog',
  imports: [LucideCheck, LucideIndianRupee, LucideX],
  template: `
    @if (plan(); as selected) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal/65 px-4 py-6"
        (click)="closed.emit()"
      >
        <div
          class="membership-pay-dialog my-auto w-full max-w-lg rounded-2xl border border-gold/15 bg-white p-0 shadow-sm"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="'Pay for ' + selected.name"
        >
          <div class="border-b border-gold/15 px-5 py-3.5 sm:px-6">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-[11px] font-semibold tracking-[0.16em] text-gold uppercase">Payment</p>
                <h3 class="mt-0.5 font-serif text-xl text-charcoal sm:text-2xl">{{ selected.name }} plan</h3>
              </div>
              <button
                type="button"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gold/15 bg-blush text-burgundy transition hover:bg-blush"
                aria-label="Close"
                (click)="closed.emit()"
              >
                <svg lucideX [size]="16" aria-hidden="true"></svg>
              </button>
            </div>
          </div>

          <div class="px-5 py-4 sm:px-6 sm:py-5">
            <dl class="grid grid-cols-2 gap-2.5">
              <div class="rounded-xl border border-gold/15 bg-ivory/80 px-3 py-2.5">
                <dt class="text-[10px] font-semibold tracking-[0.14em] text-gold uppercase">Duration</dt>
                <dd class="mt-1 text-sm font-semibold text-charcoal">{{ selected.duration }}</dd>
              </div>
              <div class="rounded-xl border border-gold/15 bg-ivory/80 px-3 py-2.5">
                <dt class="text-[10px] font-semibold tracking-[0.14em] text-gold uppercase">Amount</dt>
                <dd class="mt-1 flex items-center gap-1 text-sm font-semibold text-burgundy">
                  <svg lucideIndianRupee [size]="14" aria-hidden="true"></svg>
                  <span>{{ selected.priceLabel.replace('₹', '') }}</span>
                </dd>
              </div>
            </dl>

            <p class="mt-3 text-sm leading-5 text-stone-500">{{ selected.description }}</p>

            <p class="mt-3 text-[10px] font-semibold tracking-[0.14em] text-gold uppercase">Included details</p>
            <ul class="mt-2 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
              @for (row of includedRows(); track row.label) {
                <li class="flex items-start gap-1.5 text-[13px] leading-5 text-charcoal">
                  <span class="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-burgundy text-white">
                    <svg lucideCheck [size]="10" aria-hidden="true"></svg>
                  </span>
                  <span>{{ row.label }}</span>
                </li>
              }
            </ul>

            <button
              type="button"
              class="mt-5 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-burgundy text-sm font-semibold text-white transition hover:bg-burgundy-deep"
              (click)="confirmed.emit(selected)"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class MembershipPaymentDialogComponent {
  readonly plan = input<MembershipPlan | null>(null);
  readonly closed = output<void>();
  readonly confirmed = output<MembershipPlan>();

  readonly includedRows = computed(() => {
    const selected = this.plan();
    if (!selected) {
      return [];
    }
    return featuresForPlan(selected.id).filter((row) => row.included);
  });
}
