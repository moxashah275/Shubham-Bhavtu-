import { Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { SITE_FAQS } from '../../../../shared/content/site-faqs';
import { PageHeroComponent } from '../../../../shared/ui/page-hero/page-hero.component';

@Component({
  selector: 'app-faq-page',
  imports: [PageHeroComponent, LucideChevronDown],
  templateUrl: './faq.component.html',
})
export class FaqPageComponent {
  readonly openIndex = signal(0);
  readonly faqs = SITE_FAQS;

  toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? -1 : index));
  }

  isOpen(index: number): boolean {
    return this.openIndex() === index;
  }
}
