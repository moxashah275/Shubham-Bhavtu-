import { Component, OnDestroy, computed, signal } from '@angular/core';
import { AppImages } from '../../../../core/assets/app-images';
import { HeroBannerComponent } from '../../../../shared/hero/hero-banner.component';
import { PartnerSearchComponent } from '../../../../shared/search/partner-search.component';
import { SuccessMatch } from '../../../../shared/matches/match-profile.model';
import { SuccessMatchCardComponent } from '../../../../shared/matches/success-match-card.component';
import { SuccessMatchDialogComponent } from '../../../../shared/matches/success-match-dialog.component';
import { SiteHighlightsComponent } from '../../../../shared/trust/site-highlights.component';
import successMatchesData from '../../../../../assets/data/success-matches.json';

const SLIDE_SIZE = 4;
const SLIDE_INTERVAL = 5000;

@Component({
  selector: 'app-dashboard-page',
  imports: [
    HeroBannerComponent,
    PartnerSearchComponent,
    SiteHighlightsComponent,
    SuccessMatchCardComponent,
    SuccessMatchDialogComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardPageComponent implements OnDestroy {
  readonly images = AppImages.home;
  readonly successMatches = successMatchesData as SuccessMatch[];
  readonly selectedMatch = signal<SuccessMatch | null>(null);

  readonly slideIndex = signal(0);
  readonly slides = computed(() => {
    const pages: SuccessMatch[][] = [];
    for (let start = 0; start < this.successMatches.length; start += SLIDE_SIZE) {
      pages.push(this.successMatches.slice(start, start + SLIDE_SIZE));
    }
    return pages;
  });

  private timer = setInterval(() => this.nextSlide(), SLIDE_INTERVAL);

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  goToSlide(index: number): void {
    this.slideIndex.set(index);
    this.restartTimer();
  }

  openMatch(story: SuccessMatch): void {
    this.selectedMatch.set(story);
    clearInterval(this.timer);
  }

  closeMatch(): void {
    this.selectedMatch.set(null);
    this.restartTimer();
  }

  private nextSlide(): void {
    const total = this.slides().length;
    this.slideIndex.update((index) => (total ? (index + 1) % total : 0));
  }

  private restartTimer(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.nextSlide(), SLIDE_INTERVAL);
  }
}
