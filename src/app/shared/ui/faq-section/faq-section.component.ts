import { Component, computed, signal } from '@angular/core';
import { LucideArrowUpRight, LucideChevronDown } from '@lucide/angular';
import { SITE_FAQS } from '../../content/site-faqs';

const FAQ_PREVIEW_COUNT = 5;

/** Accordion FAQ block for embedding on the dashboard (and similar pages). */
@Component({
  selector: 'app-faq-section',
  imports: [LucideArrowUpRight, LucideChevronDown],
  template: `
    <section class="bg-blush/30 pb-12 pt-6 sm:pb-16 sm:pt-8">
      <div class="mx-auto max-w-7xl px-5 lg:px-8">
        <div class="max-w-2xl">
          <p class="text-xs font-semibold tracking-[0.18em] text-gold uppercase">FAQ</p>
          <div class="w-fit">
            <h2 class="mt-3 font-serif text-2xl leading-tight text-charcoal sm:text-3xl lg:text-4xl">
              Frequently asked questions
            </h2>
            <span class="mt-1.5 block h-px w-1/2 bg-gold"></span>
          </div>
          <p class="mt-4 text-sm leading-7 text-stone-500 sm:text-base">
            Quick answers about profile, matches, biodata, membership, and privacy.
          </p>
        </div>

        <div class="mt-8 space-y-3">
          @for (item of visibleFaqs(); track item.question; let index = $index) {
            <article
              class="overflow-hidden rounded-2xl border bg-white shadow-sm transition"
              [class.border-gold/40]="isOpen(index)"
              [class.border-gold/15]="!isOpen(index)"
            >
              <button
                type="button"
                class="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left sm:px-7 sm:py-5"
                [attr.aria-expanded]="isOpen(index)"
                (click)="toggle(index)"
              >
                <span class="min-w-0 font-serif text-lg leading-snug text-charcoal sm:text-xl">
                  {{ item.question }}
                </span>
                <span
                  class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-blush text-burgundy transition duration-300"
                  [class.rotate-180]="isOpen(index)"
                >
                  <svg lucideChevronDown [size]="18" aria-hidden="true"></svg>
                </span>
              </button>
              @if (isOpen(index)) {
                <div class="border-t border-gold/15 px-5 pb-5 sm:px-7 sm:pb-6">
                  <p class="pt-4 text-sm leading-7 text-stone-500">{{ item.answer }}</p>
                </div>
              }
            </article>
          }
        </div>

        @if (canToggleMore()) {
          <div class="mt-6 flex justify-center">
            <button
              type="button"
              class="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-burgundy px-6 text-sm font-semibold text-white transition hover:bg-burgundy-deep"
              (click)="toggleShowAll()"
            >
              {{ showAll() ? 'View less' : 'View more' }}
              <svg lucideArrowUpRight [size]="16" aria-hidden="true"></svg>
            </button>
          </div>
        }
      </div>
    </section>
  `,
})
export class FaqSectionComponent {
  readonly faqs = SITE_FAQS;
  readonly openIndex = signal(0);
  readonly showAll = signal(false);

  readonly visibleFaqs = computed(() =>
    this.showAll() ? this.faqs : this.faqs.slice(0, FAQ_PREVIEW_COUNT),
  );

  canToggleMore(): boolean {
    return this.faqs.length > FAQ_PREVIEW_COUNT;
  }

  toggleShowAll(): void {
    this.showAll.update((open) => !open);
    if (!this.showAll()) {
      this.openIndex.update((current) => (current >= FAQ_PREVIEW_COUNT ? 0 : current));
    }
  }

  toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? -1 : index));
  }

  isOpen(index: number): boolean {
    return this.openIndex() === index;
  }
}
